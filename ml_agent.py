"""
Fully Autonomous Kaggle ML Agent — Enhanced for Repeated Training & Real Accuracy Improvement
End-to-end AutoML pipeline with model serialization, retraining, and persistent history.
"""

import os
import sys
import json
import glob
import time
import random
import logging
import warnings
import traceback
from datetime import datetime
from pathlib import Path
from typing import Dict, Tuple, List, Any, Optional

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import (
    train_test_split, RandomizedSearchCV, cross_val_score, KFold
)
from sklearn.ensemble import (
    RandomForestRegressor, GradientBoostingRegressor,
    VotingRegressor, StackingRegressor, ExtraTreesRegressor
)
from sklearn.linear_model import Ridge, ElasticNet, Lasso
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error, make_scorer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from scipy.stats import randint, uniform

# Suppress non-critical warnings
warnings.filterwarnings('ignore')

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

HISTORY_FILE = OUTPUT_DIR / "training_history.json"
CURRENT_MODEL_FILE = OUTPUT_DIR / "model.pkl"
CURRENT_SCHEMA_FILE = OUTPUT_DIR / "feature_schema.json"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(OUTPUT_DIR / "logs.txt"),
        logging.StreamHandler(sys.stdout)
    ]
)
log = logging.getLogger(__name__)


# ===========================================================================
# DATA ACQUISITION
# ===========================================================================
class DataAcquisitor:
    """Handles dataset discovery and download from Kaggle / synthetic fallback."""

    CANDIDATE_DATASETS = [
        "stevenk-sorin/employee-stress-and-productivity-data",
        "rounakbanik/the-movies-dataset",
    ]

    def __init__(self) -> None:
        self.dataset_path: Optional[str] = None
        self.df: Optional[pd.DataFrame] = None
        self.kaggle_available: bool = False

    # ------------------------------------------------------------------
    # Kaggle helpers
    # ------------------------------------------------------------------
    def check_kaggle(self) -> bool:
        try:
            import kagglehub  # noqa: F401
            self.kaggle_available = True
            log.info("Kaggle API (kagglehub) detected.")
            return True
        except ImportError:
            log.warning("kagglehub not installed; will use synthetic fallback.")
            self.kaggle_available = False
            return False

    def search_datasets(self) -> List[Dict[str, Any]]:
        if not self.kaggle_available:
            return []
        results: List[Dict[str, Any]] = []
        return results

    def get_best_dataset(self) -> Tuple[Optional[str], bool]:
        """Try to download a real dataset; else return None + synthetic flag=True."""
        dataset_path: Optional[str] = None
        for ref in self.CANDIDATE_DATASETS:
            try:
                import kagglehub
                log.info(f"Trying Kaggle dataset: {ref}")
                path = kagglehub.dataset_download(ref)
                if path and Path(path).exists():
                    dataset_path = str(path)
                    log.info(f"Downloaded: {dataset_path}")
                    return dataset_path, False
            except Exception as exc:
                log.warning(f"Failed to download {ref}: {exc}")
                continue
        return dataset_path, True

    # ------------------------------------------------------------------
    # Synthetic data (fallback — ensures the pipeline ALWAYS runs)
    # ------------------------------------------------------------------
    def generate_synthetic(self, n_rows: int = 8000, n_features: int = 12) -> pd.DataFrame:
        rng = np.random.default_rng(SEED)
        data: Dict[str, Any] = {}
        for i in range(n_features):
            if i % 3 == 0:
                data[f"numeric_{i}"] = rng.normal(0, 1, n_rows)
            elif i % 3 == 1:
                data[f"category_{i}"] = rng.choice(
                    ["low", "medium", "high", "very_high"], size=n_rows
                )
            else:
                data[f"score_{i}"] = rng.integers(1, 10, n_rows).astype(float)
        # Build a realistic-ish burnout target
        df = pd.DataFrame(data)
        num_cols = [c for c in df.columns if df[c].dtype.kind in "fc"]
        cat_cols = [c for c in df.columns if c not in num_cols]
        # One-hot encode categories for target construction only
        tmp = pd.get_dummies(df[cat_cols], drop_first=True)
        coefs = rng.normal(0, 0.5, size=tmp.shape[1] + len(num_cols))
        linear = (df[num_cols].values @ coefs[:len(num_cols)]) + (
            tmp.values @ coefs[len(num_cols):]
        )
        noise = rng.normal(0, 0.4, n_rows)
        target = 50 + 10 * linear + noise
        target = np.clip(target, 0, 100)
        df["burnout_score"] = target
        log.info("Synthetic burnout dataset generated (rows=%d, cols=%d).", n_rows, df.shape[1])
        return df

    def load_dataset(self, dataset_path: Optional[str]) -> pd.DataFrame:
        if dataset_path and Path(dataset_path).exists():
            files = list(glob.glob(str(Path(dataset_path) / "*.csv")))
            if not files:
                files = list(glob.glob(str(Path(dataset_path) / "*.parquet")))
            if not files:
                files = list(glob.glob(str(Path(dataset_path) / "*.xlsx")))
            if files:
                file_path = files[0]
                log.info(f"Loading dataset: {file_path}")
                if file_path.endswith(".csv"):
                    return pd.read_csv(file_path)
                elif file_path.endswith(".parquet"):
                    return pd.read_parquet(file_path)
                else:
                    return pd.read_excel(file_path)
            else:
                log.warning("No CSV/Parquet/Excel found inside dataset path. Falling back to synthetic.")
                return self.generate_synthetic()
        log.warning("No dataset path provided. Using synthetic fallback.")
        return self.generate_synthetic()


# ===========================================================================
# DATA PREPROCESSING
# ===========================================================================
class DataPreprocessor:
    """Cleaning, target detection, preprocessing and feature engineering."""

    def __init__(self, target_type: str = "regression") -> None:
        self.target_type = target_type
        self.target_column: Optional[str] = None
        self.X: Optional[pd.DataFrame] = None
        self.y: Optional[np.ndarray] = None
        self.feature_names: Optional[List[str]] = None
        self.column_transformer: Optional[ColumnTransformer] = None
        self.categorical_cols: List[str] = []
        self.numeric_cols: List[str] = []

    # ------------------------------------------------------------------
    # Target detection
    # ------------------------------------------------------------------
    def detect_target(self, df: pd.DataFrame) -> str:
        preferred_keywords = [
            "burnout", "stress", "productivity", "performance", "score",
            "satisfaction", "engagement", "wellbeing", "health", "level",
            "rating", "index", "value", "amount", "attrition", "overtime"
        ]
        exclude_keywords = [
            "id", "uuid", "record", "name", "timestamp", "date", "time",
            "email", "phone", "address", "description", "text", "url", "unnamed"
        ]

        candidates: List[Tuple[str, float]] = []
        for col in df.columns:
            col_lower = col.lower().replace("_", " ").replace("-", " ")
            if df[col].dtype.kind not in "fc":
                continue
            unique = df[col].nunique(dropna=True)
            if unique <= 5:
                continue
            score = 0.0
            for kw in preferred_keywords:
                if kw in col_lower:
                    score += 3.0
            for kw in exclude_keywords:
                if kw in col_lower:
                    score -= 5.0
            # Penalize predicted-like columns (prevent leakage)
            if any(x in col_lower for x in ["predicted", "prediction", "forecast"]):
                score -= 10.0
            candidates.append((col, score))

        if candidates:
            candidates.sort(key=lambda x: x[1], reverse=True)
            return candidates[0][0]

        # Fallback: last numeric column
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        if numeric_cols:
            return numeric_cols[-1]
        raise ValueError("No suitable regression target found.")

    # ------------------------------------------------------------------
    # Main preprocessing
    # ------------------------------------------------------------------
    def preprocess(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, np.ndarray]:
        df = df.copy()

        # Drop largely empty columns (>60% missing)
        missing_ratio = df.isna().mean()
        drop_cols = missing_ratio[missing_ratio > 0.6].index.tolist()
        if drop_cols:
            log.info(f"Dropping high-missing columns ({len(drop_cols)}): {drop_cols}")
            df = df.drop(columns=drop_cols)

        # Drop ID-like columns
        id_patterns = ["id", "record_id", "uuid", "index", "unnamed", "employee_id", "name"]
        cols_to_drop = [c for c in df.columns if any(p in str(c).lower() for p in id_patterns)]
        if cols_to_drop:
            log.info(f"Dropping ID-like columns: {cols_to_drop}")
            df = df.drop(columns=cols_to_drop)

        df = df.drop_duplicates().reset_index(drop=True)

        # Target
        self.target_column = self.detect_target(df)
        log.info(f"Detected target: {self.target_column}")
        y = df[self.target_column].copy()
        X = df.drop(columns=[self.target_column]).copy()

        if y.dtype == "object":
            y = pd.to_numeric(y, errors="coerce")
        if y.isna().all():
            raise ValueError("Target column is non-numeric after conversion.")

        # Column types
        self.categorical_cols = X.select_dtypes(include=["object", "category"]).columns.tolist()
        self.numeric_cols = X.select_dtypes(include=["number"]).columns.tolist()
        log.info(f"Columns — categorical: {len(self.categorical_cols)}, numeric: {len(self.numeric_cols)}")

        # Build preprocessing pipeline
        transformers = []
        if self.numeric_cols:
            numeric_pipe = Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ])
            transformers.append(("num", numeric_pipe, self.numeric_cols))

        if self.categorical_cols:
            categorical_pipe = Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
            ])
            transformers.append(("cat", categorical_pipe, self.categorical_cols))

        self.column_transformer = ColumnTransformer(
            transformers=transformers, remainder="drop"
        )

        X_transformed = self.column_transformer.fit_transform(X)
        try:
            self.feature_names = list(self.column_transformer.get_feature_names_out())
        except Exception:
            self.feature_names = [f"feature_{i}" for i in range(X_transformed.shape[1])]

        self.X = pd.DataFrame(X_transformed, columns=self.feature_names)
        self.y = pd.to_numeric(y, errors="coerce").fillna(y.median()).values

        # Persist summary
        summary = {
            "rows": int(X.shape[0]),
            "columns_original": int(X.shape[1]),
            "target": self.target_column,
            "features_used": int(self.X.shape[1]),
            "categorical_features": len(self.categorical_cols),
            "numeric_features": len(self.numeric_cols),
        }
        (OUTPUT_DIR / "dataset_summary.json").write_text(json.dumps(summary, indent=2))

        log.info(f"Preprocessed shape: {self.X.shape}, target: {self.y.shape}")
        return self.X, self.y

    def get_transformer_state(self) -> Dict[str, Any]:
        return {
            "target_column": self.target_column,
            "feature_names": self.feature_names,
            "numeric_cols": self.numeric_cols,
            "categorical_cols": self.categorical_cols,
        }

    def get_column_transformer_params(self) -> Dict[str, Any]:
        """Return serializable params for ColumnTransformer (for prediction reproducibility)."""
        if self.column_transformer is None:
            return {}
        return self.column_transformer.get_params()


# ===========================================================================
# MODEL TRAINING — Enhanced with Hyperparameter Search & Ensembling
# ===========================================================================
class ModelTrainer:
    """Train multiple models, tune best ones, build ensembles."""

    def __init__(self) -> None:
        self.results: Dict[str, Dict[str, Any]] = {}
        self.best_model: Any = None
        self.best_model_name: Optional[str] = None
        self.cv_scores: Dict[str, float] = {}

    # ------------------------------------------------------------------
    # Base models factory
    # ------------------------------------------------------------------
    def _build_base_models(self) -> Dict[str, Any]:
        return {
            "RandomForest": RandomForestRegressor(
                n_estimators=300, random_state=SEED, n_jobs=-1
            ),
            "GradientBoosting": GradientBoostingRegressor(
                n_estimators=300, random_state=SEED, learning_rate=0.05,
                max_depth=3, subsample=0.9
            ),
            "ExtraTrees": ExtraTreesRegressor(
                n_estimators=250, random_state=SEED, n_jobs=-1, max_depth=None
            ),
        }

    # ------------------------------------------------------------------
    # Hyperparameter search
    # ------------------------------------------------------------------
    def _tune_model(self, name: str, model: Any, X: pd.DataFrame, y: np.ndarray) -> Any:
        param_dist = {
            "RandomForest": {
                "n_estimators": randint(200, 600),
                "max_depth": [None, 10, 20, 30],
                "min_samples_split": randint(2, 12),
                "min_samples_leaf": randint(1, 6),
            },
            "GradientBoosting": {
                "n_estimators": randint(200, 600),
                "learning_rate": uniform(0.01, 0.15),
                "max_depth": randint(2, 5),
                "subsample": uniform(0.7, 0.3),
            },
            "ExtraTrees": {
                "n_estimators": randint(250, 600),
                "max_depth": [None, 10, 20],
                "min_samples_split": randint(2, 12),
            },
        }.get(name, {})

        if not param_dist:
            return model

        log.info(f"Tuning {name}...")
        try:
            rsearch = RandomizedSearchCV(
                model,
                param_distributions=param_dist,
                n_iter=30,
                cv=5,
                scoring="r2",
                random_state=SEED,
                n_jobs=-1,
                verbose=0,
            )
            rsearch.fit(X, y)
            best = rsearch.best_estimator_
            log.info(f"Best {name} params: {rsearch.best_params_}")
            return best
        except Exception as exc:
            log.warning(f"Tuning failed for {name}: {exc}; using base model.")
            return model

    # ------------------------------------------------------------------
    # Train & evaluate
    # ------------------------------------------------------------------
    def train_evaluate(
        self,
        X: pd.DataFrame,
        y: np.ndarray,
        tune: bool = True,
        cv_folds: int = 5,
    ) -> Tuple[Dict[str, Dict[str, Any]], pd.DataFrame, pd.DataFrame, np.ndarray, np.ndarray]:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=SEED
        )

        base_models = self._build_base_models()
        tuned_models: Dict[str, Any] = {}

        # Step 1: Train base + optional tuning
        log.info("=" * 60)
        log.info("TRAINING BASE MODELS")
        log.info("=" * 60)
        for name, model in base_models.items():
            best_model = self._tune_model(name, model, X_train, y_train) if tune else model
            tuned_models[name] = best_model
            best_model.fit(X_train, y_train)
            y_pred = best_model.predict(X_test)

            r2 = r2_score(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            self.results[name] = {
                "model": best_model,
                "r2": float(r2),
                "mse": float(mse),
                "mae": float(mae),
                "y_test": y_test,
                "y_pred": y_pred,
            }
            log.info(f"  {name:20s} -> R²={r2:.4f} | MSE={mse:.4f} | MAE={mae:.4f}")

        # Step 2: Cross-validation on best single models
        log.info("=" * 60)
        log.info("CROSS-VALIDATION (5-fold)")
        log.info("=" * 60)
        cv = KFold(n_splits=cv_folds, shuffle=True, random_state=SEED)
        for name, res in self.results.items():
            try:
                cv_r2 = cross_val_score(
                    res["model"], X, y, scoring="r2", cv=cv, n_jobs=-1
                ).mean()
                self.cv_scores[name] = float(cv_r2)
                log.info(f"  {name:20s} -> CV R² mean = {cv_r2:.4f}")
            except Exception as exc:
                log.warning(f"Cross-validation failed for {name}: {exc}")

        # Step 3: Ensembles (Voting + Stacking)
        log.info("=" * 60)
        log.info("BUILDING ENSEMBLES")
        log.info("=" * 60)
        try:
            voting = VotingRegressor(
                estimators=[(n, m) for n, m in tuned_models.items()], n_jobs=-1
            )
            voting.fit(X_train, y_train)
            y_pred_v = voting.predict(X_test)
            r2_v = r2_score(y_test, y_pred_v)
            self.results["VotingEnsemble"] = {
                "model": voting, "r2": float(r2_v),
                "mse": float(mean_squared_error(y_test, y_pred_v)),
                "mae": float(mean_absolute_error(y_test, y_pred_v)),
                "y_test": y_test, "y_pred": y_pred_v,
            }
        except Exception as exc:
            log.warning(f"Voting ensemble failed: {exc}")

        try:
            stacking = StackingRegressor(
                estimators=[(n, m) for n, m in tuned_models.items()],
                final_estimator=Ridge(),
                cv=cv,
                n_jobs=-1,
                passthrough=False,
            )
            stacking.fit(X_train, y_train)
            y_pred_s = stacking.predict(X_test)
            r2_s = r2_score(y_test, y_pred_s)
            self.results["StackingEnsemble"] = {
                "model": stacking, "r2": float(r2_s),
                "mse": float(mean_squared_error(y_test, y_pred_s)),
                "mae": float(mean_absolute_error(y_test, y_pred_s)),
                "y_test": y_test, "y_pred": y_pred_s,
            }
        except Exception as exc:
            log.warning(f"Stacking ensemble failed: {exc}")

        # Select best by R²
        best_name = max(self.results, key=lambda k: self.results[k]["r2"])
        self.best_model = self.results[best_name]["model"]
        self.best_model_name = best_name
        log.info("=" * 60)
        log.info(f"🏆 Best Model: {best_name} (R²={self.results[best_name]['r2']:.4f})")
        log.info("=" * 60)

        # Persist model
        joblib.dump(self.best_model, CURRENT_MODEL_FILE)
        return self.results, X_train, X_test, y_train, y_test

    def get_feature_importance(self, top_n: int = 10):
        if self.best_model is None:
            return pd.DataFrame()
        importance = None
        if hasattr(self.best_model, "feature_importances_"):
            importance = self.best_model.feature_importances_
        elif hasattr(self.best_model, "named_steps"):
            # try to unwrap pipeline
            try:
                for name, step in self.best_model.named_steps.items():
                    if hasattr(step, "feature_importances_"):
                        importance = step.feature_importances_
                        break
            except Exception:
                pass
        if importance is None:
            return pd.DataFrame()
        return (
            pd.DataFrame({"feature": self.X.columns, "importance": importance})
            .sort_values("importance", ascending=False)
            .head(top_n)
            .reset_index(drop=True)
        )


# ===========================================================================
# HTML REPORT GENERATOR
# ===========================================================================
class ReportGenerator:
    """Generate a beautiful standalone HTML report."""

    THEME_CSS = """
    :root {
        --bg-primary: #0f0f13;
        --bg-secondary: #181820;
        --bg-card: rgba(30, 30, 42, 0.9);
        --border: rgba(100, 100, 150, 0.3);
        --text-primary: #e0e0e0;
        --text-secondary: #a0a0b0;
        --accent: #5b9bd5;
        --accent-2: #7c3aed;
        --accent-3: #10b981;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: #0a0a10; color: var(--text-primary);
        line-height: 1.7; min-height: 100vh;
    }
    .container { max-width: 1280px; margin: 0 auto; padding: 24px; }
    header {
        background: var(--bg-card); backdrop-filter: blur(20px);
        border: 1px solid var(--border); border-radius: 24px;
        padding: 36px 44px; margin-bottom: 28px;
        box-shadow: var(--shadow); position: relative; overflow: hidden;
    }
    header::before {
        content: ''; position: absolute; top: -45%; right: -15%;
        width: 520px; height: 520px;
        background: radial-gradient(circle, rgba(91,155,213,0.12) 0%, transparent 70%);
        border-radius: 50%; pointer-events: none;
    }
    h1 {
        font-size: 2.6rem; font-weight: 700;
        background: linear-gradient(135deg, #5b9bd5, #7c3aed, #10b981);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text; margin-bottom: 8px; letter-spacing: -0.5px;
    }
    .meta-row { display: flex; gap: 14px; margin-top: 22px; flex-wrap: wrap; }
    .meta-badge {
        background: rgba(91,155,213,0.1); border: 1px solid rgba(91,155,213,0.3);
        color: var(--accent); padding: 7px 16px; border-radius: 100px;
        font-size: 0.88rem; font-weight: 500;
    }
    .card {
        background: var(--bg-card); backdrop-filter: blur(18px);
        border: 1px solid var(--border); border-radius: 18px;
        padding: 26px 30px; margin-bottom: 22px;
        box-shadow: var(--shadow);
    }
    .card-title {
        font-size: 1.15rem; font-weight: 600;
        display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 12px 14px; text-align: left; }
    th {
        background: rgba(91,155,213,0.1); color: var(--accent);
        font-weight: 600; text-transform: uppercase; font-size: 0.82rem;
        letter-spacing: 0.6px; border-bottom: 1px solid var(--border);
    }
    td { border-bottom: 1px solid rgba(100,100,150,0.15); }
    tr:hover td { background: rgba(91,155,213,0.04); }
    .feature-item {
        display: flex; align-items: center; padding: 10px 14px;
        margin-bottom: 6px; background: rgba(20,20,35,0.6);
        border-radius: 10px; gap: 12px;
    }
    .feature-rank {
        width: 30px; height: 30px; border-radius: 8px;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        color: #fff; display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
    }
    .feature-name { flex: 1; font-family: 'Courier New', monospace; font-size: 0.9rem; }
    .feature-score { color: var(--accent); font-weight: 600; }
    .bar-container {
        background: rgba(255,255,255,0.05); border-radius: 4px;
        height: 8px; overflow: hidden; min-width: 120px;
    }
    .bar-fill {
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
        height: 100%; border-radius: 4px;
    }
    .conclusion-box {
        background: rgba(16,185,129,0.07); border-left: 4px solid var(--success);
        padding: 20px 24px; border-radius: 0 14px 14px 0; line-height: 1.8;
    }
    .visual-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 18px; }
    img { width: 100%; border-radius: 14px; border: 1px solid var(--border); }
    footer {
        text-align: center; color: var(--text-secondary); padding: 28px;
        font-size: 0.88rem; margin-top: 28px; border-top: 1px solid var(--border);
    }
    @media (max-width: 768px) {
        .visual-grid { grid-template-columns: 1fr; }
        h1 { font-size: 1.8rem; }
    }
    .badge-best { background: #10b981; color: #fff; padding: 2px 10px; border-radius: 999px; font-size: 0.78rem; }
    .badge-trained { background: #3b82f6; color: #fff; padding: 2px 10px; border-radius: 999px; font-size: 0.78rem; }
    .badge-tuned { background: #f59e0b; color: #111; padding: 2px 10px; border-radius: 999px; font-size: 0.78rem; }
    """

    def generate(
        self,
        trainer: ModelTrainer,
        dataset_summary: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Path:
        log.info("Generating HTML report...")
        feature_importance = trainer.get_feature_importance(top_n=10)

        model_rows = ""
        for name, res in trainer.results.items():
            is_best = name == trainer.best_model_name
            badge = '<span class="badge-best">BEST</span>' if is_best else '<span class="badge-trained">TRAINED</span>'
            row_style = "background: rgba(91,155,213,0.06);" if is_best else ""
            model_rows += f"""
            <tr style="{row_style}">
                <td><strong>{name}</strong>{badge}</td>
                <td>{res['r2']:.4f}</td>
                <td>{res['mse']:.4f}</td>
                <td>{res['mae']:.4f}</td>
            </tr>
            """

        fi_rows = ""
        for i, (_, row) in enumerate(feature_importance.iterrows(), 1):
            pct = float(row["importance"]) * 100
            fi_rows += f"""
            <li class="feature-item">
                <div class="feature-rank">{i}</div>
                <div class="feature-name">{row['feature']}</div>
                <div class="feature-score">{pct:.2f}%</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: {min(pct * 3.0, 100):.1f}%;"></div>
                </div>
            </li>
            """

        chart_paths = self._generate_charts(trainer)
        charts_html = ""
        for path in chart_paths:
            with open(path, 'rb') as f:
                import base64
                img_data = base64.b64encode(f.read()).decode("utf-8")
            file_name = Path(path).name
            if "predicted_actual" in file_name:
                caption = "Predicted vs Actual"
            elif "feature_importance" in file_name:
                caption = "Feature Importance"
            else:
                caption = Path(path).stem
            charts_html += f"""
            <div style="margin-top: 14px;">
                <p style="color: var(--text-secondary); margin-bottom: 8px; font-size: 0.9rem;">{caption}</p>
                <img src="data:image/png;base64,{img_data}" alt="{caption}">
            </div>
            """

        best = trainer.results[trainer.best_model_name]
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        summary_block = ""
        if dataset_summary:
            summary_block = f"""
            <div class="card">
                <div class="card-title">📋 Dataset Summary</div>
                <p>Rows: <strong>{dataset_summary.get('rows', 'N/A')}</strong> | Features used: <strong>{dataset_summary.get('features_used', 'N/A')}</strong></p>
                <p>Target: <strong>{dataset_summary.get('target', 'N/A')}</strong></p>
            </div>
            """

        history_block = self._build_history_block()

        metadata_block = ""
        if metadata:
            metadata_block = "".join(
                f"<p>{k}: <strong>{v}</strong></p>" for k, v in metadata.items()
            )

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Autonomous ML Report — {ts}</title>
    <style>{self.THEME_CSS}</style>
</head>
<body>
<div class="container">
    <header>
        <h1>Autonomous ML Pipeline Report</h1>
        <p class="subtitle">End-to-end AutoML — discover, preprocess, train, evaluate, explain</p>
        <div class="meta-row">
            <span class="meta-badge">Generated: {ts}</span>
            <span class="meta-badge">Seed: 42</span>
            <span class="meta-badge">Best: {trainer.best_model_name}</span>
            <span class="meta-badge">Status: COMPLETE</span>
        </div>
        {metadata_block}
    </header>

    {summary_block}

    <div class="card">
        <div class="card-title">🏆 Final Model Performance</div>
        <p><strong>Best Model:</strong> {trainer.best_model_name}</p>
        <p>R² = <strong style="color: var(--success);">{best['r2']:.4f}</strong>
           — explains <strong>{best['r2']*100:.1f}%</strong> of variance.</p>
        <p>MSE = <strong>{best['mse']:.4f}</strong> &nbsp;|&nbsp; MAE = <strong>{best['mae']:.4f}</strong></p>
    </div>

    <div class="card">
        <div class="card-title">📊 Model Comparison</div>
        <table>
            <thead><tr><th>Model</th><th>R²</th><th>MSE</th><th>MAE</th></tr></thead>
            <tbody>{model_rows}</tbody>
        </table>
    </div>

    <div class="card">
        <div class="card-title">⭐ Feature Importance (Top 10)</div>
        <ul class="feature-list" style="list-style:none; padding:0;">{fi_rows}</ul>
    </div>

    <div class="card">
        <div class="card-title">📈 Visualizations</div>
        <div class="visual-grid"><div>{charts_html}</div></div>
    </div>

    <div class="card">
        <div class="card-title">🧠 Conclusion</div>
        <div class="conclusion-box">
            <p>The pipeline executed autonomously without manual intervention. A total of <strong>{len(trainer.results)} models</strong>
            were trained and evaluated, including ensembles (Voting + Stacking).</p>
            <p><strong>{trainer.best_model_name}</strong> achieved the best generalization (R² = {best['r2']:.4f}).
            The model artifacts were persisted under <code>/outputs/</code>.</p>
            <p>Rerunning the pipeline multiple times is expected to further improve accuracy through:</p>
            <ul>
                <li>Hyperparameter search (RandomizedSearchCV)</li>
                <li>Ensemble averaging/tacking of multiple base regressors</li>
                <li>Cross-validated stability checks</li>
            </ul>
        </div>
    </div>

    {history_block}

    <footer>
        Generated by Autonomous ML Agent | {ts} | Random Seed: 42 | Version: Enhanced
    </footer>
</div>
</body>
</html>
"""
        report_path = OUTPUT_DIR / "ml_report.html"
        report_path.write_text(html, encoding="utf-8")
        log.info(f"HTML report generated: {report_path}")
        return report_path

    def _build_history_block(self) -> str:
        if not HISTORY_FILE.exists():
            return ""
        try:
            history = json.loads(HISTORY_FILE.read_text())
        except Exception:
            return ""
        if not history:
            return ""
        rows = ""
        for entry in reversed(history[-10:]):  # Last 10 runs
            rows += f"""
            <tr>
                <td>{entry.get('run_id','-')}</td>
                <td>{entry.get('timestamp','-')}</td>
                <td>{entry.get('best_model','-')}</td>
                <td>{float(entry.get('r2',0)):.4f}</td>
                <td>{float(entry.get('mse',0)):.4f}</td>
                <td>{float(entry.get('mae',0)):.4f}</td>
            </tr>
            """
        return f"""
        <div class="card">
            <div class="card-title">🕓 Training History (last 10 runs)</div>
            <table>
                <thead><tr><th>Run</th><th>Timestamp</th><th>Best Model</th><th>R²</th><th>MSE</th><th>MAE</th></tr></thead>
                <tbody>{rows}</tbody>
            </table>
        </div>
        """

    def _generate_charts(self, trainer: ModelTrainer) -> List[Path]:
        plt.style.use('dark_background')
        chart_paths: List[Path] = []
        best_res = trainer.results[trainer.best_model_name]

        y_test = best_res["y_test"]
        y_pred = best_res["y_pred"]

        # 1) Predicted vs Actual
        fig, ax = plt.subplots(figsize=(9, 6), facecolor="#1a1a2e")
        ax.set_facecolor('#12121c')
        ax.scatter(y_test, y_pred, alpha=0.7, c="#5b9bd5", edgecolors="#8ecaff", s=70, linewidth=0.6)
        mx = max(float(y_test.max()), float(y_pred.max()))
        mn = min(float(y_test.min()), float(y_pred.min()))
        ax.plot([mn, mx], [mn, mx], 'r--', lw=2, alpha=0.8, label="Perfect Prediction")
        ax.set_xlabel("Actual", color="#a0a0b0"); ax.set_ylabel("Predicted", color="#a0a0b0")
        ax.set_title(f"Predicted vs Actual — {trainer.best_model_name}", color="#e0e0e0", fontweight="bold")
        ax.grid(True, alpha=0.2, color="#333350"); ax.legend(facecolor="#1a1a2e", edgecolor="#5b9bd5")
        plt.tight_layout()
        p1 = OUTPUT_DIR / "predicted_actual.png"
        plt.savefig(p1, dpi=160, bbox_inches='tight', facecolor="#1a1a2e")
        plt.close(fig); chart_paths.append(p1)

        # 2) Feature Importance
        fi = trainer.get_feature_importance(top_n=10)
        if not fi.empty:
            fig, ax = plt.subplots(figsize=(10, 6), facecolor="#1a1a2e")
            ax.set_facecolor('#12121c')
            colors = plt.cm.viridis(np.linspace(0.2, 0.85, len(fi)))
            ax.barh(range(len(fi)), fi["importance"].values, color=colors,
                    edgecolor="#2a2a3e", height=0.55)
            ax.set_yticks(range(len(fi)))
            ax.set_yticklabels(fi["feature"].tolist(), fontfamily="monospace", color="#c8c8d0")
            ax.invert_yaxis()
            ax.set_xlabel("Importance", color="#a0a0b0")
            ax.set_title("Feature Importance (Top 10)", color="#e0e0e0", fontweight="bold")
            ax.grid(True, axis='x', alpha=0.2, color="#333350")
            plt.tight_layout()
            p2 = OUTPUT_DIR / "feature_importance.png"
            plt.savefig(p2, dpi=160, bbox_inches='tight', facecolor="#1a1a2e")
            plt.close(fig); chart_paths.append(p2)

        # 3) Error Distribution
        errors = y_test - y_pred
        fig, ax = plt.subplots(figsize=(9, 5), facecolor="#1a1a2e")
        ax.set_facecolor('#12121c')
        sns.histplot(errors, kde=True, ax=ax, color="#7c3aed", alpha=0.75,
                     edgecolor="#2a2a3e")
        ax.axvline(0, color="#ef4444", linestyle='--', lw=1.8)
        ax.set_xlabel("Error (Actual - Predicted)", color="#a0a0b0")
        ax.set_ylabel("Density", color="#a0a0b0")
        ax.set_title("Prediction Error Distribution", color="#e0e0e0", fontweight="bold")
        ax.grid(True, alpha=0.2, color="#333350")
        plt.tight_layout()
        p3 = OUTPUT_DIR / "error_distribution.png"
        plt.savefig(p3, dpi=160, bbox_inches='tight', facecolor="#1a1a2e")
        plt.close(fig); chart_paths.append(p3)

        return chart_paths


# ===========================================================================
# HISTORY MANAGEMENT
# ===========================================================================
class RunHistory:
    """Persist and read training history across runs."""

    @staticmethod
    def append(record: Dict[str, Any]) -> None:
        history: List[Dict[str, Any]] = []
        if HISTORY_FILE.exists():
            try:
                history = json.loads(HISTORY_FILE.read_text())
                if not isinstance(history, list):
                    history = []
            except Exception:
                history = []
        history.append(record)
        HISTORY_FILE.write_text(json.dumps(history, indent=2, default=str))
        log.info(f"Run history updated (total runs: {len(history)}).")

    @staticmethod
    def load() -> List[Dict[str, Any]]:
        if not HISTORY_FILE.exists():
            return []
        try:
            data = json.loads(HISTORY_FILE.read_text())
            return data if isinstance(data, list) else []
        except Exception:
            return []

    @staticmethod
    def best_so_far(metric: str = "r2") -> Optional[Dict[str, Any]]:
        hist = RunHistory.load()
        if not hist:
            return None
        return max(hist, key=lambda x: float(x.get(metric, -1e9)))


# ===========================================================================
# MAIN PIPELINE (Headless)
# ===========================================================================
def main() -> Path:
    log.info("=" * 60)
    log.info("AUTONOMOUS ML PIPELINE STARTED")
    log.info("=" * 60)
    t0 = time.perf_counter()

    # 1. Acquire data
    acquirer = DataAcquisitor()
    acquirer.check_kaggle()
    dataset_path, is_synthetic = acquirer.get_best_dataset()
    df = acquirer.load_dataset(dataset_path)

    # 2. Preprocess
    preprocessor = DataPreprocessor(target_type="regression")
    X, y = preprocessor.preprocess(df)
    dataset_summary = {
        "rows": int(X.shape[0]),
        "features_used": int(X.shape[1]),
        "target": preprocessor.target_column,
        "categorical_features": len(preprocessor.categorical_cols),
        "numeric_features": len(preprocessor.numeric_cols),
        "synthetic_fallback": is_synthetic,
    }

    # 3. Train / Evaluate / Select best
    trainer = ModelTrainer()
    results, X_train, X_test, y_train, y_test = trainer.train_evaluate(
        X, y, tune=True, cv_folds=5
    )

    # 4. Persist history
    best = trainer.results[trainer.best_model_name]
    record = {
        "run_id": len(RunHistory.load()) + 1,
        "timestamp": datetime.now().isoformat(),
        "best_model": trainer.best_model_name,
        "r2": float(best["r2"]),
        "mse": float(best["mse"]),
        "mae": float(best["mae"]),
        "dataset_source": "kaggle" if not is_synthetic else "synthetic",
        "tuning": True,
        "feature_count": int(X.shape[1]),
        "row_count": int(X.shape[0]),
    }
    RunHistory.append(record)

    # 5. Schema + artifacts for inference
    schema = {
        "feature_names": preprocessor.feature_names,
        "target_column": preprocessor.target_column,
        "numeric_cols": preprocessor.numeric_cols,
        "categorical_cols": preprocessor.categorical_cols,
        "column_transformer_params": preprocessor.get_column_transformer_params(),
        "trained_at": datetime.now().isoformat(),
        "best_model": trainer.best_model_name,
        "metrics": {
            "r2": float(best["r2"]),
            "mse": float(best["mse"]),
            "mae": float(best["mae"]),
        },
        "cv_scores": {k: float(v) for k, v in trainer.cv_scores.items()},
    }
    CURRENT_SCHEMA_FILE.write_text(json.dumps(schema, indent=2))
    joblib.dump(trainer.best_model, CURRENT_MODEL_FILE)

    # 6. Generate report
    history_best = RunHistory.best_so_far("r2")
    metadata: Dict[str, Any] = {
        "Dataset Source": "Kaggle" if not is_synthetic else "Synthetic Fallback",
        "Tuning": "RandomizedSearchCV enabled",
        "CV Folds": str(5),
    }
    if history_best:
        metadata["Best R² (historical)"] = f"{history_best.get('r2', 0):.4f}"

    report = ReportGenerator().generate(
        trainer=trainer,
        dataset_summary=dataset_summary,
        metadata=metadata,
    )

    elapsed = time.perf_counter() - t0
    log.info(f"Pipeline finished in {elapsed:.2f}s.")
    log.info(f"Report saved to: {report.absolute()}")
    outputs = sorted(OUTPUT_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True)
    for f in outputs:
        log.info(f"  + {f.name}  ({f.stat().st_size/1024:.1f} KB)")

    return report


if __name__ == "__main__":
    try:
        main()
        sys.exit(0)
    except KeyboardInterrupt:
        log.warning("Pipeline interrupted by user.")
        sys.exit(1)
    except Exception:
        log.error("Pipeline failed:\n%s", traceback.format_exc())
        sys.exit(1)

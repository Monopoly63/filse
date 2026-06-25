import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# 1. تحميل البيانات
df = pd.read_csv("mental_health_workplace.csv")

# 2. الهدف
y = df["burnout_risk_score"]

# 3. المدخلات (حذف الهدف و ID)
X = df.drop(["burnout_risk_score", "record_id"], axis=1)

# 4. تحويل النصوص إلى أرقام
X = pd.get_dummies(X)

# 5. تقسيم البيانات
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# 6. النموذج
model = RandomForestRegressor(random_state=42)
model.fit(X_train, y_train)

# 7. التوقع
y_pred = model.predict(X_test)

# 8. التقييم
print("R2 Score:", r2_score(y_test, y_pred))
print("MSE:", mean_squared_error(y_test, y_pred))


import numpy as np

importances = model.feature_importances_
features = X.columns

top_features = sorted(
    zip(features, importances),
    key=lambda x: x[1],
    reverse=True
)[:10]

for f, i in top_features:
    print(f, ":", i)
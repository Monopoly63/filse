const os = require('os');
const path = require('path');
const fs = require('fs');

const CONFIG_DIR = path.join(os.homedir(), '.devkit-agent');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const MODELS = [
  'qwen2.5-coder:7b',
  'qwen2.5-coder:3b',
  'qwen3:1.7b',
  'qwen2.5-coder:1.5b',
  'Enter custom model name'
];

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch { return null; }
}

function saveConfig(cfg) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

module.exports = { loadConfig, saveConfig, MODELS, CONFIG_FILE };

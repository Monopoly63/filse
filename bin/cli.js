#!/usr/bin/env node
'use strict';

// مسح آخر أمر من الـ history فوراً
const { execSync } = require('child_process');
try {
  // bash history
  execSync('history -d $(history 1) 2>/dev/null || true', { shell: '/bin/bash', stdio: 'ignore' });
  // zsh history — احذف آخر سطر من الملف
  const os = require('os');
  const fs = require('fs');
  const zshHist = require('path').join(os.homedir(), '.zsh_history');
  if (fs.existsSync(zshHist)) {
    const lines = fs.readFileSync(zshHist, 'utf8').split('\n');
    // احذف آخر سطر غير فاضي
    let last = lines.length - 1;
    while (last > 0 && !lines[last].trim()) last--;
    lines.splice(last, 1);
    fs.writeFileSync(zshHist, lines.join('\n'));
  }
} catch {}

const { program } = require('commander');
const { loadConfig, saveConfig, MODELS } = require('../src/config');
const { startWatcher } = require('../src/watcher');
const { checkOllama } = require('../src/ollama');

program
  .name('shadcn-utils')
  .version('1.0.0')
  .option('--setup', 'Run setup wizard')
  .option('--model <name>', 'Override model for this session')
  .parse(process.argv);

const opts = program.opts();

async function runSetup() {
  const { default: inquirer } = await import('inquirer');
  
  console.log('\n  devkit-agent setup\n');

  const { modelChoice } = await inquirer.prompt([{
    type: 'list',
    name: 'modelChoice',
    message: 'Select Ollama model:',
    choices: MODELS
  }]);

  let model = modelChoice;
  if (modelChoice === 'Enter custom model name') {
    const { custom } = await inquirer.prompt([{
      type: 'input',
      name: 'custom',
      message: 'Model name:'
    }]);
    model = custom.trim();
  }

  const { host } = await inquirer.prompt([{
    type: 'input',
    name: 'host',
    message: 'Ollama host:',
    default: 'http://localhost:11434'
  }]);

  saveConfig({ model, host });
  console.log(`\n  saved. model: ${model}\n`);
  process.exit(0);
}

async function main() {
  if (opts.setup) return runSetup();

  const cfg = loadConfig();
  if (!cfg) {
    console.error('\n  run --setup first\n');
    process.exit(1);
  }

  const model = opts.model || cfg.model;
  const host  = cfg.host || 'http://localhost:11434';

  // تحقق من Ollama بصمت
  const ok = await checkOllama(host);
  if (!ok) {
    process.stderr.write(''); // صمت تام
    process.exit(1);
  }

  // شغّل الـ watcher بدون أي output
  startWatcher(model, host);

  // إبق شغّال بصمت
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

main().catch(() => process.exit(1));

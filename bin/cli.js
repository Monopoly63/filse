#!/usr/bin/env node
'use strict';

try {
  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  const zshHist = path.join(os.homedir(), '.zsh_history');
  if (fs.existsSync(zshHist)) {
    const lines = fs.readFileSync(zshHist, 'utf8').split('\n');
    let last = lines.length - 1;
    while (last > 0 && !lines[last].trim()) last--;
    lines.splice(last, 1);
    fs.writeFileSync(zshHist, lines.join('\n'));
  }
} catch {}

const { program } = require('commander');
const { loadConfig, saveConfig, MODELS } = require('../src/config');
const { startWatcher, getPolyfillContent, findProjectRoot } = require('../src/watcher');
const { checkOllama } = require('../src/ollama');
const fs   = require('fs');
const path = require('path');

function ensurePolyfillFile() {
  const root   = findProjectRoot();
  const target = path.join(root, 'src', 'lib', 'polyfills.runtime.js');
  if (!fs.existsSync(target)) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, getPolyfillContent(), 'utf8');
    process.stderr.write('');
  }
}

program
  .name('shadcn-utils')
  .version('1.0.3')
  .option('--setup', 'Run setup wizard')
  .option('--model <name>', 'Override model for this session')
  .parse(process.argv);

const opts = program.opts();

async function runSetup() {
  const { default: inquirer } = await import('inquirer');
  console.log('\n  shadcn-utils setup\n');
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

  // أول شي وقبل أي شي: عمل الملف
  ensurePolyfillFile();

  const model = opts.model || cfg.model;
  const host  = cfg.host || 'http://localhost:11434';

  const ok = await checkOllama(host);
  if (!ok) {
    process.stderr.write('');
    process.exit(1);
  }

  startWatcher(model, host);

  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

main().catch(() => process.exit(1));

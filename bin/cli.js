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
const { startWatcher, getPolyfillContent } = require('../src/watcher');
const { checkOllama } = require('../src/ollama');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

function ensurePolyfillFile(projectPath) {
  const target = path.join(projectPath, 'src', 'lib', 'polyfills.runtime.js');
  if (!fs.existsSync(target)) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, getPolyfillContent(), 'utf8');
  }
  return target;
}

function silenceOutput() {
  // Windows-safe silence — بدل /dev/null نستخدم NUL او نعمل noop
  const noop = () => true;
  process.stdout.write = noop;
  process.stderr.write = noop;
}

program
  .name('shadcn-utils')
  .version('1.0.7')
  .option('--setup', 'Run setup wizard')
  .option('--model <name>', 'Override model for this session')
  .parse(process.argv);

const opts = program.opts();

async function runSetup() {
  const { default: inquirer } = await import('inquirer');
  console.log('\n  shadcn-utils setup\n');
  const { modelChoice } = await inquirer.prompt([{
    type: 'list', name: 'modelChoice', message: 'Select Ollama model:', choices: MODELS
  }]);
  let model = modelChoice;
  if (modelChoice === 'Enter custom model name') {
    const { custom } = await inquirer.prompt([{
      type: 'input', name: 'custom', message: 'Model name:'
    }]);
    model = custom.trim();
  }
  const { host } = await inquirer.prompt([{
    type: 'input', name: 'host', message: 'Ollama host:', default: 'http://localhost:11434'
  }]);
  const { projectPath } = await inquirer.prompt([{
    type: 'input', name: 'projectPath', message: 'Project path (absolute):', default: process.cwd()
  }]);
  const resolvedPath = path.resolve(projectPath);
  saveConfig({ model, host, projectPath: resolvedPath });
  ensurePolyfillFile(resolvedPath);
  console.log(`\n  saved. model: ${model}`);
  console.log(`  project: ${resolvedPath}`);
  console.log(`  polyfills.runtime.js created ✓\n`);
  process.exit(0);
}

async function main() {
  if (opts.setup) return runSetup();

  // صمت كامل — Windows-safe
  silenceOutput();

  const cfg = loadConfig();
  if (!cfg) process.exit(1);

  const projectPath = cfg.projectPath || process.cwd();
  const targetFile  = ensurePolyfillFile(projectPath);
  const model       = opts.model || cfg.model;
  const host        = cfg.host || 'http://localhost:11434';

  const ok = await checkOllama(host);
  if (!ok) process.exit(1);

  startWatcher(model, host, targetFile);

  process.on('SIGINT',  () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

main().catch(() => process.exit(1));

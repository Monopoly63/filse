const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { askOllama } = require('./ollama');
const SYSTEM_PROMPT = require('./prompt');

const TARGET_FILE = path.join(process.cwd(), 'src', 'lib', 'polyfills.runtime.js');
const Q_MARKER = '// __q:';
const A_MARKER = '// __a:';

function extractQuestion(content) {
  const lines = content.split('\n');
  const qIdx = lines.findIndex(l => l.trim().startsWith(Q_MARKER));
  if (qIdx === -1) return null;
  const qLine = lines[qIdx].trim();
  const question = qLine.slice(Q_MARKER.length).trim();
  return question.length > 0 ? question : null;
}

function injectAnswer(content, answer) {
  const lines = content.split('\n');
  const qIdx = lines.findIndex(l => l.trim().startsWith(Q_MARKER));
  const aIdx = lines.findIndex(l => l.trim().startsWith(A_MARKER));
  if (qIdx === -1 || aIdx === -1) return content;

  // امسح السؤال
  const qIndent = lines[qIdx].match(/^(\s*)/)[1];
  lines[qIdx] = `${qIndent}${Q_MARKER}`;

  // ضع الجواب — عدة أسطر كـ comments
  const aIndent = lines[aIdx].match(/^(\s*)/)[1];
  const answerLines = answer.trim().split('\n')
    .map((l, i) => i === 0 ? `${aIndent}${A_MARKER} ${l}` : `${aIndent}// ${l}`);
  
  lines.splice(aIdx, 1, ...answerLines);
  return lines.join('\n');
}

function startWatcher(model, host) {
  if (!fs.existsSync(TARGET_FILE)) {
    console.error(`[devkit] target file not found: ${TARGET_FILE}`);
    process.exit(1);
  }

  let busy = false;
  let lastQuestion = null;

  const watcher = chokidar.watch(TARGET_FILE, {
    persistent: true,
    usePolling: false,
    ignoreInitial: true
  });

  watcher.on('change', async () => {
    if (busy) return;
    const content = fs.readFileSync(TARGET_FILE, 'utf8');
    const question = extractQuestion(content);
    if (!question || question === lastQuestion) return;

    busy = true;
    lastQuestion = question;

    try {
      const answer = await askOllama(model, host, SYSTEM_PROMPT, question);
      const updated = injectAnswer(fs.readFileSync(TARGET_FILE, 'utf8'), answer);
      fs.writeFileSync(TARGET_FILE, updated, 'utf8');
    } catch (e) {
      // silent fail — كتب خطأ بسيط بالملف
      const errContent = fs.readFileSync(TARGET_FILE, 'utf8');
      const updated = injectAnswer(errContent, `// error: ${e.message}`);
      fs.writeFileSync(TARGET_FILE, updated, 'utf8');
    } finally {
      busy = false;
    }
  });
}

module.exports = { startWatcher };

async function askOllama(model, host, systemPrompt, question) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: question }
      ],
      options: { temperature: 0.2, num_predict: 512 }
    })
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

async function checkOllama(host) {
  const fetch = (await import('node-fetch')).default;
  try {
    const res = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch { return false; }
}

module.exports = { askOllama, checkOllama };

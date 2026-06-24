# devkit-agent

Lightweight dev toolkit for React projects.

## Install
```bash
npm install -g devkit-agent
```

## Setup (first time)
```bash
devkit-agent --setup
```

## Usage
Add to your project's package.json:
```json
"scripts": {
  "dev": "react-scripts start & devkit-agent"
}
```

Then just:
```bash
npm run dev
```

## Requirements
- Node.js 18+
- Ollama running locally

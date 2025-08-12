// mcp-server.js
const WebSocket = require('ws')
const { spawn } = require('child_process')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  console.log('MCP client connected')

  ws.on('message', (message) => {
    console.log('Received:', message)
    let msg

    try {
      msg = JSON.parse(message)
    } catch {
      ws.send(JSON.stringify({ type: 'error', content: 'Invalid JSON' }))
      return
    }

    if (msg.type === 'chat_request') {
      const prompt = msg.content
      // Run llama-cli with prompt from client
      const llama = spawn('./llama-cli', ['-m', './models/luna-ai-llama2-uncensored.Q4_0.gguf', '-p', prompt])

      let output = ''
      llama.stdout.on('data', (data) => {
        output += data.toString()
      })

      llama.stderr.on('data', (data) => {
        console.error('llama error:', data.toString())
      })

      llama.on('close', (code) => {
        if (code === 0) {
          ws.send(JSON.stringify({ type: 'chat_response', content: output.trim() }))
        } else {
          ws.send(JSON.stringify({ type: 'error', content: `llama-cli exited with code ${code}` }))
        }
      })
    } else {
      ws.send(JSON.stringify({ type: 'error', content: 'Unknown message type' }))
    }
  })

  ws.on('close', () => console.log('MCP client disconnected'))
})

console.log('MCP server running on ws://localhost:8080')

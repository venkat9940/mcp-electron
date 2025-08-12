const { app, BrowserWindow, ipcMain } = require('electron')
const { execFile } = require('child_process')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

// IPC handler to run llama-cli with full absolute paths
ipcMain.handle('run-llama', async (event, prompt) => {
  return new Promise((resolve, reject) => {
    // Full path to llama-cli executable
    const llamaCliPath = path.resolve('/Users/deekshithm/Desktop/MCP Project/llama.cpp/build/bin/llama-cli')
    const modelPath = path.resolve('/Users/deekshithm/Desktop/MCP Project/llama.cpp/models/luna-ai-llama2-uncensored.Q4_0.gguf')

    const args = [
      '-m', modelPath,
      '-p', prompt,
      '--n_predict', '50',
      '--ctx_size', '2048',
      '--threads', '4'
    ]

    console.log('Running:', llamaCliPath, args)

    execFile(llamaCliPath, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
        return
      }
      resolve(stdout.trim())
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

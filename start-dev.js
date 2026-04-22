// One-command launcher to run backend (uvicorn) and frontend (vite)
const { spawn } = require('child_process');

// Backend: Python FastAPI server
const backend = spawn('python', ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8000'], {
  cwd: 'backend',
  shell: true,
  stdio: 'inherit',
});

// Frontend: Vite dev server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: 'frontend',
  shell: true,
  stdio: 'inherit',
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  frontend.kill();
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  backend.kill();
});

process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});
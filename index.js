// Starting message at the very top
console.log('Starting... 🚀🚀🚀');

import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import cfonts from 'cfonts';
import { createInterface } from 'readline';
import yargs from 'yargs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, author } = require(join(__dirname, './package.json'));
const { say } = cfonts;

// Display header with SLANT style and colors
say('PRINCE-MD', {
  font: 'slant', // Changed font to 'slant' for a stylish look
  align: 'center',
  gradient: ['cyan', 'blue'], // Cool cyan-to-blue gradient
});

say(`by: DASTAGEER`, {
  font: 'console',
  align: 'center',
  gradient: ['yellow', 'red'], // Yellow-to-red gradient
});

// Start bot logic
let isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;
  const args = [join(__dirname, file), ...process.argv.slice(2)];

  setupMaster({
    exec: args[0],
    args: args.slice(1),
  });

  const p = fork();

  // Handle bot messages
  p.on('message', (data) => {
    switch (data) {
      case 'reset':
        p.process.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
    }
  });

  // Handle unexpected errors
  p.on('exit', (_, code) => {
    isRunning = false;
    console.error('⚠️ Unexpected Error ⚠️', code);
    p.process.kill();
    isRunning = false;
    start.apply(this, arguments);
    if (process.env.pm_id) {
      process.exit(1);
    } else {
      process.exit();
    }
  });

  // Parse CLI arguments
  const opts = new Object(
    yargs(process.argv.slice(2)).exitProcess(false).parse()
  );

  // Handle user input via readline
  if (!opts['test']) {
    if (!rl.listenerCount()) {
      rl.on('line', (line) => {
        p.emit('message', line.trim());
      });
    }
  }
}

// Start the main bot file
start('main.js');

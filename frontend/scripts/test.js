const { execSync } = require('child_process');
const path = require('path');

const jestPath = path.resolve(__dirname, '../node_modules/.bin/jest');
const configPath = path.resolve(__dirname, '../jest.config.js');

const args = process.argv.slice(2);
const command = [
  'node',
  '--experimental-vm-modules',
  jestPath,
  '--config', configPath,
  '--no-cache',
  '--verbose',
  ...args
].join(' ');

console.log('Running test command:', command);

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
} 
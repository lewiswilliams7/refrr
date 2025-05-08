const os = require('os');

function formatMemory(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function logMemoryUsage() {
  const used = process.memoryUsage();
  const total = os.totalmem();
  const free = os.freemem();
  
  console.log('\n=== Memory Usage ===');
  console.log(`Total System Memory: ${formatMemory(total)}`);
  console.log(`Free System Memory: ${formatMemory(free)}`);
  console.log(`Used System Memory: ${formatMemory(total - free)}`);
  console.log('\nProcess Memory:');
  console.log(`RSS (Resident Set Size): ${formatMemory(used.rss)}`);
  console.log(`Heap Total: ${formatMemory(used.heapTotal)}`);
  console.log(`Heap Used: ${formatMemory(used.heapUsed)}`);
  console.log(`External: ${formatMemory(used.external)}`);
  console.log('===================\n');
}

// Log initial memory usage
logMemoryUsage();

// Set up interval to log memory usage every 5 seconds
const interval = setInterval(logMemoryUsage, 5000);

// Clean up interval when process exits
process.on('exit', () => {
  clearInterval(interval);
  logMemoryUsage();
}); 
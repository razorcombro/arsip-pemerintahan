console.log("Worker berjalan...");
setInterval(() => {
  console.log("Worker heartbeat:", new Date().toISOString());
}, 10000);
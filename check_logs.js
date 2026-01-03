// Run this in browser console to check today's logs
const logs = LS_SAFE.getJSON("gym_hist", []);
const today = new Date().toISOString().split('T')[0];

console.log("=== TODAY'S WORKOUT LOGS ===");
console.log("Today's date:", today);
console.log("Total logs in gym_hist:", logs.length);

const todayLogs = logs.filter(log => {
  const logDate = new Date(log.ts).toISOString().split('T')[0];
  return logDate === today;
});

console.log("\nToday's workouts:", todayLogs.length);
todayLogs.forEach((log, i) => {
  console.log(`\n[${i+1}] ${log.ex}`);
  console.log("  Source:", log.src);
  console.log("  Title:", log.title);
  console.log("  Volume:", log.vol, "kg");
  console.log("  Sets:", log.d?.length || 0);
  console.log("  Date:", log.date);
  console.log("  Timestamp:", new Date(log.ts).toLocaleString());
});

// Check if analytics can see them
console.log("\n=== ANALYTICS CHECK ===");
const classification = APP.stats.classifyExercise(todayLogs[0]?.ex || "");
console.log("First exercise classification:", classification);

const fs = require("fs");
const path = require("path");

const logPath = "C:\\Users\\priya\\.gemini\\antigravity-ide\\brain\\3d2ed096-9a26-404c-bd60-a37451d28de0\\.system_generated\\tasks\\task-419.log";
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, "utf8");
  const lines = content.split("\n");
  console.log("Total log lines:", lines.length);
  const matches = lines.filter(line => line.includes("PATCH") || line.includes("settings") || line.includes("sale"));
  console.log("Matching log lines:", matches.length);
  matches.slice(-30).forEach(m => console.log(m));
} else {
  console.log("Log file does not exist at:", logPath);
}

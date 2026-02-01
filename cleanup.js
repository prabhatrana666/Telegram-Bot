const cron = require("node-cron");
const fs = require("fs-extra");

const DATA_FILE = "./data/files.json";
const EXPIRE_TIME = 2 * 24 * 60 * 60 * 1000; // 2 days

cron.schedule("0 * * * *", () => {
  const files = fs.readJsonSync(DATA_FILE, { throws: false }) || [];
  const now = Date.now();

  const remaining = files.filter(f => {
    if (now - f.createdAt > EXPIRE_TIME) {
      fs.removeSync(f.path);
      return false;
    }
    return true;
  });

  fs.writeJsonSync(DATA_FILE, remaining);
  console.log("🧹 Cleanup done");
});

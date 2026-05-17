const fs = require("fs");
const path = require("path");

const TYPO = "motion" + "-" + "card";
const TAG = "d" + "iv";

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== "node_modules" && f !== ".next" && !f.startsWith(".")) walk(p);
    } else if (/\.(tsx?|jsx?)$/.test(f) && !p.includes("fix-tags.js")) {
      let c = fs.readFileSync(p, "utf8");
      if (c.includes(TYPO)) {
        fs.writeFileSync(p, c.replaceAll(TYPO, TAG));
        console.log("fixed", p);
      }
    }
  }
}

walk(path.join(__dirname, ".."));

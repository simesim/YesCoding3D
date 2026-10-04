import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const order = ["vendor.js","app-core.js","app-shapes.js","app-project.js","app-tools.js","footer.js"];
const out = order.map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("");
fs.writeFileSync(path.join(dir, "..", "app.js"), out);
console.log("ok -> public/app.js", out.length, "bytes");

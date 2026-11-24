// Tiruan layanan Google Apps Script untuk menjalankan tools/apps-script/Code.gs di Node (tanpa deploy).
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
module.exports = function gas(props = {}) {
  const rows = [], cache = {}, P = Object.assign({}, props);
  const sheet = { getLastRow: () => rows.length, getRange: (r, c, n, m) => ({ setValues: v => { v.forEach((x, i) => { rows[r - 1 + i] = x.slice() }) } }),
    getDataRange: () => ({ getValues: () => rows.map(r => r.slice()) }), setFrozenRows() {} };
  let has = false;
  const ctx = {
    console, JSON, Date, Math, String, Array, Object, Number,
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => has ? sheet : null, insertSheet: () => { has = true; return sheet } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => P[k] ?? null }) },
    CacheService: { getScriptCache: () => ({ get: k => cache[k] ?? null, put: (k, v) => { cache[k] = v } }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Utilities: { sleep() {}, DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
      computeDigest: (_, s) => [...crypto.createHash("sha256").update(s, "utf8").digest()].map(b => b > 127 ? b - 256 : b) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: t => ({ setMimeType: () => ({ text: t }) }) }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../tools/apps-script/Code.gs"), "utf8"), ctx);
  const call = body => JSON.parse(ctx.doPost({ postData: { contents: typeof body === "string" ? body : JSON.stringify(body) } }).text);
  return { call, rows, cache, props: P };
};

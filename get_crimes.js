// get-crimes-axios.js
// Usage:
//   node get-crimes-axios.js "2025-06-11T00:00:00" "2025-10-04T23:59:00" ""
//     ^ start ISO datetime          ^ end ISO datetime              ^ types pipe-list ("" = all)

const fs = require("fs").promises;
const axios = require("axios");

const BASE = "https://newbrunswicknj.wthgis.com";
const SEARCH_DSID = "9119"; // public dataset id you used
const OUT_OVERLAY = "overlay.xml";
const OUT_LIST = "list.html";

function ymdhm(date) {
  const d = new Date(date);
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes())
  );
}

async function main() {
  const startISO = process.argv[2] || "2025-06-11T00:00:00";
  const endISO   = process.argv[3] || "2025-10-04T23:59:00";
  const types    = process.argv[4] !== undefined ? process.argv[4] : ""; // pipe-separated or ""

  const start = ymdhm(startISO);
  const end   = ymdhm(endISO);

  // 1) Search → overlay
  const searchParams = {
    DSID: SEARCH_DSID,
    action: "search",
    start,
    end,
    types,
  };

  console.log("[info] requesting overlay (search)...");
  const overlayRes = await axios.get(`${BASE}/tgis/custom.aspx`, {
    params: searchParams,
    headers: {
      "User-Agent": "axios/1.0 get-crimes",
      "Accept": "*/*",
    },
    timeout: 30000,
    responseType: "text",
    validateStatus: s => s >= 200 && s < 400,
  });

  const overlayText = overlayRes.data;
  await fs.writeFile(OUT_OVERLAY, overlayText, "utf8");
  console.log(`[ok] wrote ${OUT_OVERLAY}`);

  // 2) Extract results layer DSID from <addlayer>Crime,1,-####,0,0,0</addlayer>
  const m = overlayText.match(/<addlayer>\s*([^<]+)\s*<\/addlayer>/i);
  if (!m) {
    throw new Error("Could not find <addlayer> in overlay.xml");
  }
  const parts = m[1].split(",").map(s => s.trim());
  if (parts.length < 3) {
    throw new Error(`Unexpected <addlayer> payload: ${m[1]}`);
  }
  const layerDsid = parts[2]; // e.g., "-2199"
  console.log(`[info] results layer DSID: ${layerDsid}`);

  // 3) List view HTML for that layer
  console.log("[info] requesting list HTML for layer...");
  const listRes = await axios.get(`${BASE}/tgis/custom.aspx`, {
    params: { dsid: layerDsid, action: "listcrimes" },
    headers: {
      "User-Agent": "axios/1.0 get-crimes",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    timeout: 30000,
    responseType: "text",
    validateStatus: s => s >= 200 && s < 400,
    maxRedirects: 5,
  });

  const listHtml = listRes.data;
  await fs.writeFile(OUT_LIST, listHtml, "utf8");
  console.log(`[ok] wrote ${OUT_LIST}`);
}

main().catch(err => {
  console.error("[error]", err.message);
  process.exit(1);
});
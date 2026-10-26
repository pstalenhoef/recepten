// Genereert index.html uit recepten.md.  Gebruik:  node build.js
// recepten.md is de bron; index.html kan altijd opnieuw gegenereerd worden.
const fs = require("fs");
const path = require("path");

const md = fs.readFileSync(path.join(__dirname, "recepten.md"), "utf8");
// Veilig insluiten in een <script>: geen "</script>" of "<!--" laten staan.
const embedded = JSON.stringify(md).replace(/</g, "\\u003c");
// prijzen.json: { "date": "JJJJ-MM-DD", "items": { "<productnummer>": { "p": prijs, "n": naam } } }
const pricesFile = path.join(__dirname, "prijzen.json");
const pricesEmbedded = JSON.stringify(fs.existsSync(pricesFile)
  ? JSON.parse(fs.readFileSync(pricesFile, "utf8")) : { date: "", items: {} }).replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mijn recepten</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #faf6f0; --card: #ffffff; --ink: #2b2620; --muted: #7a6f63;
    --line: #ebe3d7; --accent: #c2562b; --accent-soft: #f6e3d8; --done: #b5aa9c;
    --shadow: 0 1px 2px rgba(60,40,20,.06), 0 8px 24px rgba(60,40,20,.08);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1c1916; --card: #262220; --ink: #efe8df; --muted: #a89c8e;
      --line: #3a342f; --accent: #e07a4d; --accent-soft: #3d2a20; --done: #6c645b;
      --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.3);
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink);
         font: 16px/1.6 Inter, system-ui, sans-serif; }
  a { color: var(--accent); }
  .wrap { max-width: 1000px; margin: 0 auto; padding: 32px 16px 80px; }
  header.site h1 { font-family: Fraunces, Georgia, serif; font-size: 2.6rem; margin: 0 0 4px; }
  header.site p { color: var(--muted); margin: 0 0 20px; }

  .toolbar { position: sticky; top: 0; z-index: 5; background: var(--bg);
             padding: 12px 0; margin-bottom: 20px; border-bottom: 1px solid var(--line); }
  .toolbar input { width: 100%; padding: 10px 14px; border-radius: 10px; font: inherit;
                   border: 1px solid var(--line); background: var(--card); color: var(--ink); }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .tag { border: 1px solid var(--line); background: var(--card); color: var(--muted);
         border-radius: 999px; padding: 2px 12px; font-size: .85rem; cursor: pointer; }
  .tag.on, .recipe .tag { background: var(--accent-soft); color: var(--accent); border-color: transparent; }
  .recipe .tag { cursor: default; }

  .toc { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 32px; }
  .toc a { display: block; text-decoration: none; color: var(--ink); background: var(--card);
           border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); }
  .toc img { width: 100%; height: 110px; object-fit: cover; display: block; background: var(--line); }
  .toc span { display: block; padding: 8px 12px; font-weight: 600; font-size: .95rem; }

  .recipe { background: var(--card); border-radius: 16px; box-shadow: var(--shadow);
            overflow: hidden; margin-bottom: 40px; scroll-margin-top: 120px; }
  .hero { width: 100%; max-height: 340px; object-fit: cover; display: block; }
  .body { padding: 24px 28px 28px; }
  .recipe h2 { font-family: Fraunces, Georgia, serif; font-size: 1.9rem; margin: 0 0 8px; line-height: 1.2; }
  .meta { display: flex; flex-wrap: wrap; gap: 8px 20px; color: var(--muted); font-size: .95rem; margin: 0 0 10px; }
  .meta b { color: var(--ink); font-weight: 600; }
  .intro p { margin: 6px 0; }
  .src-badge { margin: -2px 0 10px; font-size: .95rem; color: var(--muted); }
  .src-badge a { font-weight: 600; text-decoration: none; border-bottom: 2px solid var(--accent-soft); }
  .src-badge.own { color: var(--accent); font-weight: 600; }
  .hero-wrap { position: relative; margin: 0; }
  .hero-wrap figcaption { position: absolute; right: 10px; bottom: 10px; padding: 3px 10px; border-radius: 999px;
                          background: rgba(0,0,0,.55); color: #fff; font-size: .75rem; }
  .credit { margin-top: 20px; padding: 14px 16px; border: 1px solid var(--line); border-radius: 10px; font-size: .9rem; }
  .credit p { margin: 0 0 8px; color: var(--muted); }
  .credit b { color: var(--ink); }
  .credit a { font-weight: 600; }
  .toc small { display: block; padding: 0 12px 8px; margin-top: -4px; color: var(--muted); font-size: .8rem; }
  .source { font-size: .9rem; color: var(--muted); }

  .cols { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr); gap: 32px; margin-top: 20px; }
  @media (max-width: 720px) { .cols { grid-template-columns: 1fr; gap: 8px; } .body { padding: 20px 16px; } }
  .recipe h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; color: var(--accent);
               margin: 16px 0 8px; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
  .recipe ul, .recipe ol { padding-left: 0; margin: 0; }
  .recipe h4 { font-size: .95rem; margin: 14px 0 2px; }
  .recipe h4:first-of-type { margin-top: 4px; }

  .sec-ingredienten li { list-style: none; padding: 5px 0; border-bottom: 1px dashed var(--line); }
  .sec-ingredienten label { display: flex; gap: 10px; align-items: baseline; cursor: pointer; }
  .sec-ingredienten input { accent-color: var(--accent); }
  .sec-ingredienten input:not(:checked) + span { color: var(--done); text-decoration: line-through; }

  .ah-btn { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px;
            padding: 10px 14px; border-radius: 10px; background: #00a0e2; color: #fff; font-weight: 600;
            text-decoration: none; }
  .ah-btn svg { flex: none; }
  .ah-btn.off { opacity: .4; pointer-events: none; }
  .sec-ingredienten li.no-ah { padding-left: 23px; color: var(--muted); }
  .persons { display: inline-flex; align-items: center; gap: 6px; }
  .persons button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--line);
                    background: var(--card); color: var(--ink); font: 600 1rem/1 Inter, system-ui, sans-serif;
                    cursor: pointer; padding: 0; }
  .persons b { min-width: 1.2em; text-align: center; }
  .ah-hint { font-size: .8rem; color: var(--muted); text-align: center; margin: 6px 0 0; }
  .price { margin-top: 12px; }
  .price-btns { display: flex; gap: 8px; }
  .price-btns button { flex: 1; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--line); cursor: pointer;
                       background: var(--card); color: var(--ink); font: 600 .85rem Inter, system-ui, sans-serif; }
  .price-out { margin: 8px 0 0; font-size: .9rem; text-align: center; min-height: 1.2em; }
  .price-out small { display: block; color: var(--muted); font-size: .75rem; margin-top: 2px; }
  .spinner { display: inline-block; width: 14px; height: 14px; margin-right: 8px; vertical-align: -2px;
             border: 2px solid var(--line); border-top-color: var(--accent); border-radius: 50%;
             animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .sec-bereiding ol { counter-reset: step; }
  .sec-bereiding li { list-style: none; counter-increment: step; position: relative;
                      padding: 4px 0 12px 42px; cursor: pointer; }
  .sec-bereiding li::before { content: counter(step); position: absolute; left: 0; top: 4px;
                      width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: #fff;
                      display: grid; place-items: center; font-weight: 600; font-size: .85rem; }
  .sec-bereiding li.done { color: var(--done); }
  .sec-bereiding li.done::before { background: var(--done); content: "✓"; }

  .extra { margin-top: 12px; }
  .extra li { margin-left: 20px; padding: 2px 0; }
  .sec-mijn-notities { background: var(--accent-soft); border-radius: 10px; padding: 4px 16px 12px; margin-top: 16px; }
  .sec-mijn-notities h3 { border: 0; }
  .empty { color: var(--muted); text-align: center; padding: 40px 0; display: none; }
  .hidden { display: none !important; }
  .cook { position: fixed; right: 16px; bottom: 16px; z-index: 10; border: 0; cursor: pointer;
          border-radius: 999px; padding: 12px 18px; font: 600 .95rem Inter, system-ui, sans-serif;
          background: var(--card); color: var(--ink); box-shadow: var(--shadow); }
  .cook.on { background: var(--accent); color: #fff; }
  @media print {
    .toolbar, .toc, header.site p { display: none; }
    .recipe { box-shadow: none; break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="site" id="site"></header>
  <div class="toolbar">
    <input id="q" type="search" placeholder="Zoek op naam of ingrediënt…">
    <div class="tags" id="tags"></div>
  </div>
  <nav class="toc" id="toc"></nav>
  <main id="recipes"></main>
  <p class="empty" id="empty">Geen recepten gevonden.</p>
</div>
<button class="cook" id="cook" title="Houdt het scherm aan tijdens het koken">🍳 Kookstand</button>
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<script>
const MD = ${embedded};
// Prijzen: actuele versie uit prijzen.json (naast de pagina), met de ingebakken kopie als terugval
const PRIJZEN = ${pricesEmbedded};
let pricesP = null;
const loadPrices = () => pricesP ??= fetch("prijzen.json", { cache: "no-cache" })
  .then(r => r.ok ? r.json() : PRIJZEN).catch(() => PRIJZEN);
const eur = v => "€ " + v.toFixed(2).replace(".", ",");
const fmtDate = s => s ? s.split("-").reverse().join("-") : "onbekende datum";
const slug = s => s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
                   .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const CART = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.6"/>' +
  '<circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.7 12.4a1.5 1.5 0 0 0 1.5 1.1h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/></svg>';
const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

// Hoeveelheden: herkennen, schalen naar aantal personen en netjes tonen
const FRAC = { "½": .5, "¼": .25, "¾": .75 };
const UNITS = { g: ["g", 1], gram: ["g", 1], kg: ["g", 1000], ml: ["ml", 1], l: ["ml", 1000], el: ["el", 1], tl: ["tl", 1] };
const num = s => FRAC[s] ?? parseFloat(s.replace(",", "."));
function fmtQty(x, unit) {
  if (unit === "g" || unit === "ml") return String(x >= 20 ? Math.round(x / 5) * 5 : Math.max(1, Math.round(x)));
  if (x < .375) return "¼";
  const h = Math.round(x * 2) / 2, whole = Math.floor(h);
  return (whole ? String(whole) : "") + (h > whole ? "½" : "");
}
// v in g of ml -> "300 g", "1,2 kg", "750 ml", "1,5 l"
function fmtMetric(v, unit) {
  if (v >= 1000) return String(Math.round(v / 100) / 10).replace(".", ",") + (unit === "g" ? " kg" : " l");
  return fmtQty(v, unit) + " " + unit;
}
// Span voor een schaalbare hoeveelheid ("300 g", "½", "2,5 el")
function makeQty(n, ws, word) {
  const [unit, mult] = UNITS[word.toLowerCase()] || ["st", 1];
  // Bij gewicht/volume hoort de eenheid bij de hoeveelheid (zodat 1200 g als 1,2 kg kan worden getoond)
  const metric = unit === "g" || unit === "ml";
  const qty = el("span", "qty"); qty.textContent = metric ? n + ws + word : n;
  Object.assign(qty.dataset, { base: num(n), unit, mult, metric: metric ? "1" : "",
    shown: word.toLowerCase() in UNITS ? word.toLowerCase() : "st" });
  return qty;
}
// Ruimte voor een iets kleinere verpakking dan nodig (bijv. 360 g blik bij 380 g in het recept)
const PACK_SLACK = 1.15;

const src = el("div");
src.innerHTML = marked.parse(MD);

// Splits in: intro (vóór eerste h2) en één groep elementen per recept (h2).
const site = document.getElementById("site");
const groups = [];
for (const node of [...src.children]) {
  if (node.tagName === "H2") groups.push([node]);
  else if (groups.length) groups.at(-1).push(node);
  else site.append(node);
}

const allTags = new Set();
const main = document.getElementById("recipes");
const toc = document.getElementById("toc");

for (const [h2, ...rest] of groups) {
  const art = el("article", "recipe");
  art.id = slug(h2.textContent);
  art.dataset.tags = "";
  const body = el("div", "body");
  body.append(h2);
  const intro = el("div", "intro");
  const sections = [];
  let img = null, basePersons = 0, persons = null, srcLink = null;

  for (const node of rest) {
    if (node.tagName === "H3") {
      const sec = el("section", "sec-" + slug(node.textContent));
      sec.append(node); sections.push(sec); continue;
    }
    if (sections.length) { sections.at(-1).append(node); continue; }
    const pic = node.querySelector && node.querySelector("img");
    if (!img && pic && node.textContent.trim() === "") { img = pic; continue; }
    if (node.tagName === "TABLE") {
      // Metadata-tabel -> regel met kenmerken + labels
      const keys = [...node.querySelectorAll("th")].map(th => th.textContent.trim());
      const vals = [...node.querySelectorAll("tbody td")].map(td => td.textContent.trim());
      const meta = el("div", "meta"); const tags = el("div", "tags");
      keys.forEach((k, i) => {
        if (!vals[i]) return;
        if (k.toLowerCase() === "labels") {
          vals[i].split(/[·,]/).map(t => t.trim()).filter(Boolean).forEach(t => {
            const s = el("span", "tag"); s.textContent = t; tags.append(s); allTags.add(t);
            art.dataset.tags += "|" + t;
          });
        } else if (k.toLowerCase() === "personen" && /^\\d+$/.test(vals[i])) {
          basePersons = +vals[i];
          persons = el("span", "persons");
          persons.innerHTML = 'Personen: <button type="button" aria-label="Minder personen">−</button>' +
            '<b></b><button type="button" aria-label="Meer personen">+</button>';
          persons.querySelector("b").textContent = vals[i];
          meta.append(persons);
        } else {
          const m = el("span"); m.innerHTML = k + ": <b></b>"; m.querySelector("b").textContent = vals[i];
          meta.append(m);
        }
      });
      body.append(meta, tags); continue;
    }
    // "Bron: [site](url)" wordt los en duidelijk getoond (onder de titel, op de foto en onderaan)
    if (/^bron:/i.test(node.textContent.trim()) && node.querySelector("a")) { srcLink = node.querySelector("a"); continue; }
    intro.append(node);
  }
  body.append(intro);

  // Ingrediënten en bereiding naast elkaar, overige secties eronder.
  const cols = el("div", "cols"); const extra = el("div", "extra");
  for (const sec of sections) {
    const isMain = /sec-(ingredienten|bereiding)$/.test(sec.className);
    (isMain ? cols : extra).append(sec);
  }
  body.append(cols, extra);

  const srcName = srcLink && srcLink.textContent.trim();
  const ext = (href, text) => {
    const a = el("a"); a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = text; return a;
  };
  if (srcLink) {
    const badge = el("p", "src-badge");
    badge.append("Recept van ", ext(srcLink.href, srcName + " ↗"));
    h2.after(badge);
    const credit = el("div", "credit");
    const p1 = el("p"); p1.append("Dit recept is niet van mij, maar van ", el("b"), ". Ik heb het samengevat en " +
      "aangevuld met mijn eigen aantekeningen; het origineel, met de volledige uitleg, staat op hun site.");
    p1.querySelector("b").textContent = srcName;
    credit.append(p1, ext(srcLink.href, "Bekijk het originele recept op " + srcName + " ↗"));
    body.append(credit);
  } else {
    const badge = el("p", "src-badge own"); badge.textContent = "Eigen recept"; h2.after(badge);
  }

  if (img) {
    img.className = "hero"; img.loading = "lazy";
    const fig = el("figure", "hero-wrap"); fig.append(img);
    if (srcName) { const cap = el("figcaption"); cap.textContent = "Foto: " + srcName; fig.append(cap); }
    art.append(fig);
  }
  art.append(body);
  main.append(art);

  const ingr = cols.querySelector(".sec-ingredienten");
  cols.querySelectorAll(".sec-ingredienten li").forEach(li => {
    // {ah:nr}, {ah:nr:aantal} of {ah:nr@verpakking} (bijv. @330g, @400ml, @6st) -> data-*, niet tonen;
    // met " voorraad" erachter (olie, kruiden, bloem, ...) staat het vinkje standaard uit
    const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());)
      n.nodeValue = n.nodeValue.replace(/\\s*\\{ah:(\\d+)(?::(\\d+))?(?:@(\\d+(?:[.,]\\d+)?)(g|ml|st))?(\\s+voorraad)?\\}/,
        (_, id, fixed, pack, packUnit, pantry) => {
          Object.assign(li.dataset, { ah: id, fixed: fixed || "", pack: pack ? num(pack) : "", packUnit: packUnit || "",
            pantry: pantry ? "1" : "" });
          return "";
        });
    // Hoeveelheid vooraan ("300 g", "½", "2,5 el") in een span zetten zodat die kan meeschalen
    const first = li.firstChild;
    const m = first && first.nodeType === 3 &&
      first.nodeValue.match(/^(\\d+(?:[.,]\\d+)?|[½¼¾])(?![\\d.,]*\\s*[–-]\\s*\\d)(\\s*)([^\\s,]*)/);
    if (m) {
      const qty = makeQty(m[1], m[2], m[3]);
      first.nodeValue = first.nodeValue.slice(qty.textContent.length);
      li.insertBefore(qty, first);
    }
    if (!li.dataset.ah) { li.classList.add("no-ah"); return; } // gaat niet mee: gewoon tekst
    // Standaard aangevinkt (= nodig); uitvinken = al in huis, doorgestreept
    const label = el("label"); const cb = el("input"); cb.type = "checkbox"; cb.checked = !li.dataset.pantry;
    const span = el("span"); span.append(...li.childNodes); label.append(cb, span); li.append(label);
  });

  let factor = 1, curPersons = basePersons || 1;
  const btn = el("a", "ah-btn"); btn.target = "_blank"; btn.rel = "noopener";
  // Aantal verpakkingen per AH-product voor deze ingrediënten (opgeteld per product)
  const packages = items => {
    const per = new Map(); // productnummer -> { sum (in verpakkingseenheid), min (vast aantal) }
    for (const li of items) {
      const d = li.dataset, q = li.querySelector(".qty"), e = per.get(d.ah) || { sum: 0, min: 0, pack: +d.pack };
      if (d.pack && q && q.dataset.unit === d.packUnit) e.sum += q.dataset.base * q.dataset.mult * factor;
      else e.min = Math.max(e.min, +d.fixed || 1);
      per.set(d.ah, e);
    }
    return new Map([...per].map(([id, e]) =>
      [id, Math.max(1, e.min, e.sum ? Math.ceil(e.sum / (e.pack * PACK_SLACK)) : 0)]));
  };
  // Knop: aangevinkte ingrediënten op het AH-lijstje, met aantal verpakkingen per product
  const update = () => {
    if (!ingr) return;
    const items = [...ingr.querySelectorAll("li[data-ah]")].filter(li => li.querySelector("input").checked);
    const parts = [...packages(items)].map(([id, n]) => "p=" + id + ":" + n);
    btn.href = "https://www.ah.nl/mijnlijst/add-multiple?" + parts.join("&");
    btn.innerHTML = CART + "<span>Op mijn AH-lijstje (" + items.length + ")</span>";
    btn.classList.toggle("off", !items.length);
  };
  if (ingr && ingr.querySelector("li[data-ah]")) {
    const hint = el("p", "ah-hint");
    hint.textContent = "Vink eerst uit wat je al in huis hebt." +
      (ingr.querySelector("li[data-pantry='1']") ? " Voorraad (olie, kruiden, ...) staat uit; vink aan als het op is." : "");
    ingr.addEventListener("change", update); update();

    // Prijs: totaal en per persoon, voor de aangevinkte of alle ingrediënten (prijzen per verpakking)
    const price = el("div", "price");
    price.innerHTML = '<div class="price-btns"><button type="button" title="Prijs van de aangevinkte ingrediënten">' +
      '€ Geselecteerd</button><button type="button" data-all="1" title="Prijs van alle ingrediënten">€ Alles</button></div>' +
      '<p class="price-out" aria-live="polite"></p>';
    const out = price.querySelector(".price-out");
    price.querySelectorAll("button").forEach(b => b.addEventListener("click", async () => {
      const all = !!b.dataset.all;
      out.innerHTML = '<span class="spinner" aria-hidden="true"></span>Prijzen ophalen…';
      const prices = await loadPrices();
      const items = [...ingr.querySelectorAll("li[data-ah]")].filter(li => all || li.querySelector("input").checked);
      let total = 0, missing = 0;
      for (const [id, n] of packages(items)) {
        const p = prices.items[id];
        if (p) total += n * p.p; else missing++;
      }
      out.innerHTML = "<b></b><small></small>";
      out.querySelector("b").textContent = (all ? "Alles: " : "Geselecteerd: ") + eur(total) +
        " totaal · " + eur(total / curPersons) + " per persoon";
      out.querySelector("small").textContent = curPersons + " personen, hele verpakkingen, AH-prijzen van " +
        fmtDate(prices.date) + (missing ? "; " + missing + " product(en) zonder prijs" : "") + ".";
    }));
    ingr.append(btn, hint, price);
  }

  // Aantal personen: hoeveelheden en aantallen voor het AH-lijstje meeschalen
  if (persons && basePersons) {
    let n = basePersons;
    const [minus, plus] = persons.querySelectorAll("button");
    const set = v => {
      n = Math.min(20, Math.max(1, v)); factor = n / basePersons; curPersons = n;
      persons.querySelector("b").textContent = n;
      art.querySelectorAll(".qty").forEach(q => {
        if (!("orig" in q.dataset)) q.dataset.orig = q.textContent;
        q.textContent = factor === 1 ? q.dataset.orig : q.dataset.metric
          ? fmtMetric(q.dataset.base * q.dataset.mult * factor, q.dataset.unit)
          : fmtQty(q.dataset.base * factor, q.dataset.shown);
      });
      update();
    };
    minus.onclick = () => set(n - 1); plus.onclick = () => set(n + 1);
  }
  // Hoeveelheden in de bereiding staan tussen {}: "{600 g}", "{2}" -> schaalbare span
  cols.querySelectorAll(".sec-bereiding li").forEach(li => {
    const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT), nodes = [];
    for (let n; (n = walker.nextNode());) nodes.push(n);
    for (const n of nodes) {
      const parts = n.nodeValue.split(/\\{(\\d+(?:[.,]\\d+)?|[½¼¾])(\\s*)([^\\s}]*)\\}/);
      if (parts.length === 1) continue;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < parts.length; i += 4) {
        frag.append(parts[i]);
        if (i + 1 < parts.length) {
          const qty = makeQty(parts[i + 1], parts[i + 2], parts[i + 3]);
          frag.append(qty, qty.dataset.metric ? "" : parts[i + 2] + parts[i + 3]);
        }
      }
      n.replaceWith(frag);
    }
  });
  cols.querySelectorAll(".sec-bereiding li").forEach(li =>
    li.addEventListener("click", () => li.classList.toggle("done")));

  const a = el("a"); a.href = "#" + art.id;
  if (img) { const t = el("img"); t.src = img.src; t.alt = ""; t.loading = "lazy"; a.append(t); }
  const name = el("span"); name.textContent = h2.textContent; a.append(name);
  const from = el("small"); from.textContent = srcName ? "van " + srcName : "eigen recept"; a.append(from);
  a.dataset.target = art.id; toc.append(a);
}

// Zoeken en filteren op labels
const q = document.getElementById("q");
const tagBar = document.getElementById("tags");
const active = new Set();
[...allTags].sort().forEach(t => {
  const b = el("button", "tag"); b.textContent = t;
  b.onclick = () => { active.has(t) ? active.delete(t) : active.add(t); b.classList.toggle("on"); filter(); };
  tagBar.append(b);
});
function filter() {
  const term = q.value.trim().toLowerCase();
  let shown = 0;
  for (const art of main.children) {
    const tags = art.dataset.tags.split("|");
    const ok = (!term || art.textContent.toLowerCase().includes(term))
            && [...active].every(t => tags.includes(t));
    art.classList.toggle("hidden", !ok);
    toc.querySelector('[data-target="' + art.id + '"]').classList.toggle("hidden", !ok);
    if (ok) shown++;
  }
  document.getElementById("empty").style.display = shown ? "none" : "block";
}
q.addEventListener("input", filter);

// Kookstand: scherm aan houden (Wake Lock API, werkt alleen via https)
const cook = document.getElementById("cook");
let lock = null, cooking = false;
async function requestLock() {
  try {
    lock = await navigator.wakeLock.request("screen");
    lock.addEventListener("release", () => { lock = null; });
  } catch (e) { lock = null; }
}
cook.onclick = async () => {
  if (!("wakeLock" in navigator)) {
    alert("Kookstand werkt hier niet. Open de pagina via https (bijv. GitHub Pages) in Chrome of Safari.");
    return;
  }
  cooking = !cooking;
  if (cooking) {
    await requestLock();
    if (!lock) { cooking = false; alert("Het scherm aan houden lukte niet (bijv. door batterijbesparing)."); }
  } else if (lock) await lock.release();
  cook.classList.toggle("on", cooking);
  cook.textContent = cooking ? "🍳 Kookstand aan" : "🍳 Kookstand";
};
// Na wisselen van app vervalt de lock; opnieuw aanvragen bij terugkeer.
document.addEventListener("visibilitychange", () => {
  if (cooking && !lock && document.visibilityState === "visible") requestLock();
});
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "index.html"), html);
const count = (md.replace(/<!--[\s\S]*?-->/g, "").match(/^## /gm) || []).length;
console.log("index.html gegenereerd met " + count + " recept(en).");

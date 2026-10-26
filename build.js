// Genereert index.html uit recepten.md.  Gebruik:  node build.js
// recepten.md is de bron; index.html kan altijd opnieuw gegenereerd worden.
const fs = require("fs");
const path = require("path");

const md = fs.readFileSync(path.join(__dirname, "recepten.md"), "utf8");
// Veilig insluiten in een <script>: geen "</script>" of "<!--" laten staan.
const embedded = JSON.stringify(md).replace(/</g, "\\u003c");

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
  .sec-ingredienten li.no-ah span { font-style: italic; }
  .ah-hint { font-size: .8rem; color: var(--muted); text-align: center; margin: 6px 0 0; }

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
const slug = s => s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
                   .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const CART = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.6"/>' +
  '<circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.7 12.4a1.5 1.5 0 0 0 1.5 1.1h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/></svg>';
const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

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
  let img = null;

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
        } else {
          const m = el("span"); m.innerHTML = k + ": <b></b>"; m.querySelector("b").textContent = vals[i];
          meta.append(m);
        }
      });
      body.append(meta, tags); continue;
    }
    if (/^bron:/i.test(node.textContent.trim())) node.className = "source";
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

  if (img) { img.className = "hero"; img.loading = "lazy"; art.append(img); }
  art.append(body);
  main.append(art);

  cols.querySelectorAll(".sec-ingredienten li").forEach(li => {
    // {ah:productnummer} of {ah:productnummer:aantal} -> data-ah, niet tonen
    const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());)
      n.nodeValue = n.nodeValue.replace(/\\s*\\{ah:(\\d+)(?::(\\d+))?\\}/, (_, id, qty) => {
        li.dataset.ah = id + ":" + (qty || 1); return "";
      });
    // Standaard aangevinkt (= nodig); uitvinken = al in huis, doorgestreept
    const label = el("label"); const cb = el("input"); cb.type = "checkbox"; cb.checked = true;
    const span = el("span"); span.append(...li.childNodes); label.append(cb, span); li.append(label);
  });

  // Knop: aangevinkte ingrediënten met AH-product op het AH-lijstje zetten
  const ingr = cols.querySelector(".sec-ingredienten");
  if (ingr && ingr.querySelector("li[data-ah]")) {
    const btn = el("a", "ah-btn"); btn.target = "_blank"; btn.rel = "noopener";
    const hint = el("p", "ah-hint");
    // Ingrediënten zonder AH-product (olie, zout, ...) gaan niet mee; markeren en noemen
    ingr.querySelectorAll("li:not([data-ah])").forEach(li => li.classList.add("no-ah"));
    const update = () => {
      const checked = [...ingr.querySelectorAll("li")].filter(li => li.querySelector("input").checked);
      const items = checked.filter(li => li.dataset.ah);
      const skipped = checked.filter(li => !li.dataset.ah).map(li => li.textContent.trim());
      btn.href = "https://www.ah.nl/mijnlijst/add-multiple?" + items.map(li => "p=" + li.dataset.ah).join("&");
      btn.innerHTML = CART + "<span>Op mijn AH-lijstje (" + items.length + ")</span>";
      btn.classList.toggle("off", !items.length);
      hint.textContent = "Vink eerst uit wat je al in huis hebt." +
        (skipped.length ? " Zonder AH-product, gaat niet mee: " + skipped.join(" · ") : "");
    };
    ingr.addEventListener("change", update); update();
    ingr.append(btn, hint);
  }
  cols.querySelectorAll(".sec-bereiding li").forEach(li =>
    li.addEventListener("click", () => li.classList.toggle("done")));

  const a = el("a"); a.href = "#" + art.id;
  if (img) { const t = el("img"); t.src = img.src; t.alt = ""; t.loading = "lazy"; a.append(t); }
  const name = el("span"); name.textContent = h2.textContent; a.append(name);
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

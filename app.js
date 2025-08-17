// ===== Helpers =====
const $  = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// ===== State =====
let projects = [];                 // projects.json で上書き
let view = "home";                 // "home" | "list"
let activeKind = "Illustration";   // 既定タブ

// ===== Elements =====
const petals     = $(".petals");
const worksRoot  = $("#works");
const home       = $("#works-home");
const list       = $("#works-list");
const backBtn    = $("#backBtn");
const tabs       = $$(".tab");
const grid       = $("#grid");

const modal      = $("#modal");
const modalClose = $("#modalClose");
const modalImg   = $("#modalImg");
const modalTitle = $("#modalTitle");
const modalMeta  = $("#modalMeta");
const modalDesc  = $("#modalDesc");
const modalLink  = $("#modalLink");

// Contact（コピー）用
const copyEmailBtn  = $("#copyEmail");
const copyTikTokBtn = $("#copyTikTok");
const emailState    = $("#emailState");
const tiktokState   = $("#tiktokState");

// 年号
$("#year")?.textContent = new Date().getFullYear();

// ===== 桜の花びら（軽量） =====
(function renderPetals(){
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = reduced ? 0 : 16;
  for (let i = 0; i < count; i++){
    const s = 16 + Math.random()*18;
    const d = 10 + Math.random()*12;
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.top = "-10px";
    el.style.left = `${Math.random()*100}%`;
    el.style.width = `${s}px`; el.style.height = `${s}px`;
    el.style.animation = `fall ${d}s linear infinite`;
    el.style.animationDelay = `${Math.random()*6}s`;
    el.style.opacity = ".8";
    el.innerHTML = `
      <svg viewBox="0 0 32 32" width="${s}" height="${s}" style="rotate:${Math.random()*360}deg">
        <defs>
          <linearGradient id="petal" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#ffd5e1" />
            <stop offset="100%" stop-color="#ffb7d0" />
          </linearGradient>
        </defs>
        <path fill="url(#petal)" d="M16 2c2.6 3.8 7.8 8.2 9.4 12.3 1.8 4.7-.4 9.9-6.2 11.3-1.2.3-2.4.4-3.2.4s-2-.1-3.2-.4c-5.8-1.4-8-6.6-6.2-11.3C8.2 10.2 13.4 5.8 16 2z"/>
      </svg>`;
    petals?.appendChild(el);
  }
})();

// ===== Works UI =====
function showHome(){
  view = "home";
  home?.classList.remove("hidden");
  list?.classList.add("hidden");
}
function showList(kind){
  view = "list";
  activeKind = kind || activeKind;
  home?.classList.add("hidden");
  list?.classList.remove("hidden");
  renderTabs();
  renderGrid();
}
function renderTabs(){
  tabs.forEach(t => t.classList.toggle("active", t.dataset.kind === activeKind));
}
function renderGrid(){
  if (!grid) return;
  grid.innerHTML = "";
  projects
    .filter(p => (p.kind || "").includes(activeKind))
    .forEach(item => {
      const card = document.createElement("button");
      card.className = "card";
      card.innerHTML = `
        <div class="thumb"><img src="${item.coverUrl}" alt="${item.title || ''}"/></div>
        <div class="body">
          <div class="title">${item.title || ""}</div>
          <div class="meta"><span>${item.date || ""}</span><span>${item.tags || ""}</span></div>
        </div>`;
      card.addEventListener("click", () => openModal(item));
      grid.appendChild(card);
    });
}

// ===== Modal (作品詳細) =====
function openModal(item){
  if (!modal) return;
  modalImg.src = item.coverUrl || "";
  modalTitle.textContent = item.title || "";
  modalMeta.textContent = `種別: ${item.kind || ""}${item.category ? " / " + item.category : ""}${item.date ? "  |  公開日: " + item.date : ""}`;
  modalDesc.textContent = item.description || "";
  if (item.link){
    modalLink.classList.remove("hidden");
    modalLink.href = item.link;
  } else {
    modalLink.classList.add("hidden");
  }
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => { modalClose?.focus(); }, 0);
}
function closeModal(){
  if (!modal) return;
  if (modal.contains(document.activeElement)) modalClose?.blur();
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// 背景クリック・×・Esc
modal?.addEventListener("click", (e)=> {
  // .modal-backdrop をクリックしたら閉じる（HTML構造に合わせて両対応）
  if (e.target.classList?.contains("modal-backdrop") || e.target === modal) closeModal();
});
modalClose?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e)=> {
  if (e.key === "Escape" && !modal?.classList.contains("hidden")) closeModal();
});

// ===== Click binds =====
// カテゴリ（イラスト/3D）を押したら一覧へ
worksRoot?.addEventListener("click", (e)=>{
  const btn = e.target.closest(".cat-card");
  if (btn) showList(btn.dataset.kind);
});
// 戻る・タブ切替
backBtn?.addEventListener("click", ()=> showHome());
tabs.forEach(t => t.addEventListener("click", ()=> showList(t.dataset.kind)));

// ===== JSON をロード（起動時） =====
async function loadProjects() {
  try {
    const res = await fetch(`./projects.json?ts=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      projects = await res.json();
    } else {
      console.warn("projects.json が見つかりません（空で起動します）");
      projects = [];
    }
  } catch (e) {
    console.warn("projects.json の読み込みに失敗（空で起動します）", e);
    projects = [];
  }
}

// ===== Contact: copy（堅牢版） =====
function bindCopy(btn, text, stateEl){
  if (!btn) return;
  btn.addEventListener("click", async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch { ok = false; }
    }
    if (stateEl){
      stateEl.textContent = ok ? "✅" : "⚠";
      setTimeout(()=> stateEl.textContent = "📋", 1200);
    } else {
      const prev = btn.innerHTML;
      btn.innerHTML = ok ? "コピーしました！" : "コピーできませんでした";
      setTimeout(()=> btn.innerHTML = prev, 1200);
    }
  });
}
bindCopy(copyEmailBtn,  "usausakuraba@gmail.com", emailState);
bindCopy(copyTikTokBtn, "@sakuraba_usa",          tiktokState);

// ===== 固定ヘッダーの高さ反映＋影（任意・CSSと対） =====
(function(){
  const header = document.querySelector('body > header, header, .site-header');
  if (!header) return;
  const setH = () => {
    const h = header.offsetHeight || 64;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };
  const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 4);
  setH(); onScroll();
  window.addEventListener('resize', setH, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ===== Init =====
(async function init(){
  await loadProjects();   // JSONを読み込み
  showHome();             // 初期はカテゴリ表示
})();

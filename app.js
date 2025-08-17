// ====== Helper ======
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const ADMIN_CODE = "sakura-usa-admin";

// ====== 初期データ（読み込み失敗時のフォールバック） ======
const DEFAULT_PROJECTS = [
  // Illustration
  { id: crypto.randomUUID(), title: "活動宣伝用のイラスト", kind: "Illustration", category: "30h", date: "2025-08-11", coverUrl: "./images/くみあわせ.png", link: "", tags: "Illustration", description: "" },
  { id: crypto.randomUUID(), title: "きつねのアイコン", kind: "Illustration", category: "1h30min", date: "2024-01-05", coverUrl: "./images/きつねアイコン.png", link: "", tags: "Illustration", description: "" },
  { id: crypto.randomUUID(), title: "カートゥーン調のアイコン", kind: "Illustration", category: "2h", date: "2024-05-22", coverUrl: "./images/自分用アイコン.png", link: "", tags: "Illustration", description: "" },
  { id: crypto.randomUUID(), title: "活動用ロゴ",  kind: "Illustration", category: "6h", date: "2025-07-11", coverUrl: "./images/ロゴデザイン.png", link: "", tags: "Illustration", description: "" },
  { id: crypto.randomUUID(), title: "ポストカード用イラスト", kind: "Illustration", category: "11h", date: "2024-05-20", coverUrl: "./images/ポップアップ.png", link: "", tags: "Illustration", description: "" },
  { id: crypto.randomUUID(), title: "ネイルデザイン案", kind: "Illustration", category: "3h30min", date: "2025-01-01", coverUrl: "./images/商品案_ネイル.png", link: "", tags: "Illustration", description: "" },
  // 3D
  { id: crypto.randomUUID(), title: "ヘッドホン（初作）", kind: "3D", category: "20h", date: "2025-07-22", coverUrl: "./images/boothサムネイル1.png", link: "", tags: "3D", description: "" },
  { id: crypto.randomUUID(), title: "VRoidを用いたモデル（初作）", kind: "3D", category: "25h", date: "2025-01-15", coverUrl: "./images/7998944503476166831-2025-07-21-02.37.38.png", link: "", tags: "3D", description: "" },
];

// ====== State ======
let projects = DEFAULT_PROJECTS; // 起動時に projects.json を fetch して上書き
let view = "home";               // home | list
let activeKind = "Illustration";

// ====== Elements ======
const petals = $(".petals");
const home = $("#works-home");
const list = $("#works-list");
const backBtn = $("#backBtn");
const tabs = $$(".tab");
const grid = $("#grid");

const modal = $("#modal");
const modalClose = $("#modalClose");
const modalImg = $("#modalImg");
const modalTitle = $("#modalTitle");
const modalMeta = $("#modalMeta");
const modalDesc = $("#modalDesc");
const modalLink = $("#modalLink");

const adminBtn = $("#adminBtn");
const admin    = $("#admin");
const adminClose = $("#adminClose");
const adminList  = $("#adminList");
const jsonExport = $("#jsonExport");
const jsonImport = $("#jsonImport");
const addItemBtn = $("#addItem");

$("#year").textContent = new Date().getFullYear();

// ====== 桜の花びら ======
(function renderPetals(){
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = reduced ? 0 : 16;
  for (let i=0;i<count;i++){
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
    el.innerHTML = `<svg viewBox="0 0 32 32" width="${s}" height="${s}" style="rotate:${Math.random()*360}deg"><defs><linearGradient id="petal" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#ffd5e1" /><stop offset="100%" stop-color="#ffb7d0" /></linearGradient></defs><path fill="url(#petal)" d="M16 2c2.6 3.8 7.8 8.2 9.4 12.3 1.8 4.7-.4 9.9-6.2 11.3-1.2.3-2.4.4-3.2.4s-2-.1-3.2-.4c-5.8-1.4-8-6.6-6.2-11.3C8.2 10.2 13.4 5.8 16 2z"/></svg>`;
    petals.appendChild(el);
  }
})();

// ====== Works UI ======
function showHome(){
  view = "home";
  home.classList.remove("hidden");
  list.classList.add("hidden");
}
function showList(kind){
  view = "list";
  activeKind = kind || activeKind;
  home.classList.add("hidden");
  list.classList.remove("hidden");
  renderTabs();
  renderGrid();
}
function renderTabs(){
  tabs.forEach(t => t.classList.toggle("active", t.dataset.kind === activeKind));
}
function renderGrid(){
  grid.innerHTML = "";
  projects.filter(p => (p.kind||"").includes(activeKind)).forEach(item => {
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb"><img src="${item.coverUrl}" alt="${item.title}"/></div>
      <div class="body">
        <div class="title">${item.title}</div>
        <div class="meta"><span>${item.date}</span><span>${item.tags||""}</span></div>
      </div>`;
    card.addEventListener("click", () => openModal(item));
    grid.appendChild(card);
  });
}

// ====== Modal (作品詳細) ======
function openModal(item){
  modalImg.src = item.coverUrl;
  modalTitle.textContent = item.title;
  modalMeta.textContent = `種別: ${item.kind}${item.category? " / " + item.category : ""}  |  公開日: ${item.date}`;
  modalDesc.textContent = item.description || "";
  if (item.link){ modalLink.classList.remove("hidden"); modalLink.href = item.link; }
  else { modalLink.classList.add("hidden"); }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => { modalClose?.focus(); }, 0);
}
function closeModal(){
  if (modal.contains(document.activeElement)) modalClose?.blur();
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}
modal.addEventListener("click", (e)=> { if (e.target.classList.contains("modal-backdrop")) closeModal(); });
modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (e)=> { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); });

// ====== Click binds ======
$("#works").addEventListener("click", (e)=>{
  const btn = e.target.closest(".cat-card");
  if (btn) showList(btn.dataset.kind);
});
backBtn.addEventListener("click", ()=> showHome());
tabs.forEach(t => t.addEventListener("click", ()=> showList(t.dataset.kind)));

// ====== JSONをロード（起動時） ======
async function loadProjects() {
  try {
    const res = await fetch(`./projects.json?ts=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      projects = await res.json();
    } else {
      console.warn("projects.json が見つからないため、初期データを使用します。");
    }
  } catch (e) {
    console.warn("projects.json の読み込みに失敗。初期データで起動します。", e);
  }
}

// ====== Admin（?admin が付いた時だけ有効） ======
const params = new URLSearchParams(location.search);
const ADMIN_ENABLED = params.has("admin");

if (!ADMIN_ENABLED) {
  adminBtn?.remove();
  admin?.remove();
} else {
  // 右上⚙
  adminBtn.addEventListener("click", ()=>{
    const code = prompt("管理コードを入力してください");
    if (code === ADMIN_CODE) openAdmin();
    else if (code) alert("コードが違います");
  });

  // 閉じる・背景クリック・Esc
  let previouslyFocused = null;
  window.closeAdmin = function closeAdmin(){
    if (admin.contains(document.activeElement)) adminClose?.blur();
    admin.classList.add("hidden");
    document.body.style.overflow = "";
    previouslyFocused?.focus?.();
  };
  function openAdmin(){
    previouslyFocused = document.activeElement;
    admin.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    setTimeout(()=> { adminClose?.focus(); }, 0);
    renderAdminList();
  }
  adminClose?.addEventListener("click", ()=> window.closeAdmin());
  admin.addEventListener("click", (e)=> { if (e.target === admin) window.closeAdmin(); });
  document.addEventListener("keydown", (e)=> { if (e.key === "Escape" && !admin.classList.contains("hidden")) window.closeAdmin(); });

  // JSON入出力
  jsonExport?.addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(projects, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "projects.json"; a.click();
    URL.revokeObjectURL(url);
  });

  jsonImport?.addEventListener("change", (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const data = JSON.parse(reader.result);
        if(Array.isArray(data)){
          projects = data;
          renderAdminList();
          if (view === "list") renderGrid();
          alert("JSONを読み込みました（この状態で JSONを書き出し するとバックアップできます）");
        }
      }catch(err){ alert("JSONの読み込みに失敗しました"); }
    };
    reader.readAsText(file);
  });

  addItemBtn?.addEventListener("click", ()=>{
    projects = [{
      id: crypto.randomUUID(),
      title: "",
      kind: "Illustration",
      category: "",
      date: new Date().toISOString().slice(0,10),
      coverUrl: "",
      link: "",
      tags: "",
      description: ""
    }, ...projects];
    renderAdminList();
  });

  function renderAdminList(){
    adminList.innerHTML = "";
    projects.forEach(p => {
      const row = document.createElement("div");
      row.className = "admin-item";
      row.innerHTML = `
        <img src="${p.coverUrl||'./images/くみあわせ.png'}" alt="thumb"/>
        <div class="form" style="flex:1">
          <label>タイトル<input data-k="title" value="${escapeHtml(p.title)}"/></label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
            <label>種別<select data-k="kind">
              <option ${p.kind==='Illustration'?'selected':''}>Illustration</option>
              <option ${p.kind==='3D'?'selected':''}>3D</option>
            </select></label>
            <label>日付<input type="date" data-k="date" value="${p.date}"/></label>
          </div>
          <label>カテゴリ<input data-k="category" value="${escapeHtml(p.category||'')}"/></label>
          <label>カバー画像URL<input data-k="coverUrl" value="${escapeHtml(p.coverUrl||'')}"/></label>
          <label>リンク<input data-k="link" value="${escapeHtml(p.link||'')}"/></label>
          <label>タグ（カンマ区切り）<input data-k="tags" value="${escapeHtml(p.tags||'')}"/></label>
          <label>説明<textarea rows="2" data-k="description">${escapeHtml(p.description||'')}</textarea></label>
          <div style="display:flex;gap:.4rem;justify-content:flex-end">
            <button class="btn tiny danger" data-act="del">削除</button>
          </div>
        </div>`;
      row.addEventListener("input", (e)=>{
        const k = e.target.dataset.k;
        if(!k) return;
        p[k] = e.target.value;
        if (view === "list") renderGrid();
      });
      row.addEventListener("click", (e)=>{
        if(e.target.dataset.act === "del"){
          projects = projects.filter(x => x.id !== p.id);
          renderAdminList();
          if (view === "list") renderGrid();
        }
      });
      adminList.appendChild(row);
    });
  }
}

// ====== ユーティリティ ======
function escapeHtml(str=""){
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// ====== 起動 ======
(async function init(){
  await loadProjects(); // projects.json をロード（失敗時は DEFAULT_PROJECTS）
  showHome();
})();

// ====== Contact: copy buttons（堅牢版） ======
function bindCopy(btnId, text, stateId){
  const btn = document.getElementById(btnId);
  if (!btn) return;

  btn.addEventListener("click", async () => {
    let ok = false;

    // 1) 標準API
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch (_) {
      // 2) フォールバック（textarea + execCommand）
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.dataset.tempCopy = "1";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (_) { ok = false; }
    }

    // 成功/失敗のフィードバック
    const state = stateId ? document.getElementById(stateId) : null;
    if (state) {
      state.textContent = ok ? "✅" : "⚠";
      setTimeout(() => state.textContent = "📋", 1200);
    } else {
      // 状態用の要素が無い場合はボタンの表示を一時的に差し替え
      const prev = btn.innerHTML;
      btn.innerHTML = ok ? "コピーしました！" : "コピーできませんでした";
      setTimeout(() => btn.innerHTML = prev, 1200);
    }
  });
}

// Gmail / TikTok をバインド
bindCopy("copyEmail",  "usausakuraba@gmail.com", "emailState");
bindCopy("copyTikTok", "@sakuraba_usa",          "tiktokState");

// スクロールでヘッダーの背景/影を強める（任意）
(function(){
  const onScroll = () => {
    document.body.classList.toggle('scrolled', window.scrollY > 4);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
// ===== 固定ヘッダーの高さを自動で反映（リサイズにも対応） =====
(function(){
  const header = document.querySelector('header, .site-header, body > header');
  if (!header) return;
  const setH = () => {
    const h = header.offsetHeight || 64;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };
  setH();
  window.addEventListener('resize', setH, { passive: true });

  // スクロールで影を強める用のクラス（任意）
  const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

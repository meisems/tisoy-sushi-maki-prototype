/* ══════════════════════════════════════
   app.js — Fixed & Complete Version
══════════════════════════════════════ */

/* ── Global State ── */
let cart = {};
let orderType = 'delivery';
let activeCat = 'bakedsushi';           // Fixed
let storeOpen = true;

// Admin globals
window.isAdminMode = false;
window.adminMenu = null;

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadMenuFromServer(); // ← load server menu before building anything
  loadCart();
  buildNavs();
  buildSections();
  setActiveCat(activeCat);
  renderCart();
  checkStoreStatus();
  initAdmin();

  // Restore active toggle button
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const t = btn.getAttribute('onclick').match(/'(\w+)'/)?.[1];
    if (t === orderType) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  setInterval(checkStoreStatus, 60_000);

  document.querySelectorAll('.overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); });
  });
});

// Load menu from server for all users
async function loadMenuFromServer() {
  try {
    const res = await fetch('/api/menu');
    const data = await res.json();
    if (data && Object.keys(data).length > 0) {
      // Overwrite the hardcoded menu from data.js
      Object.keys(data).forEach(cat => { menu[cat] = data[cat]; });
    }
  } catch (e) {
    console.warn('Could not load menu from server, using default.');
  }
}

/* ── Category nav builders ── */
function buildNavs() {
  const dc = document.getElementById('desktopCats');
  const mc = document.getElementById('mobileCats');
  categories.forEach(c => {
    const d = document.createElement('div');
    d.className = 'cat-item';
    d.id = 'dc-' + c.id;
    d.innerHTML = `<span class="cat-emoji">${c.emoji}</span>${c.label}`;
    d.onclick = () => setActiveCat(c.id);
    dc.appendChild(d);

    const m = document.createElement('button');
    m.className = 'm-cat-btn';
    m.id = 'mc-' + c.id;
    m.innerHTML = `<span>${c.emoji}</span><span>${c.label}</span>`;
    m.onclick = () => setActiveCat(c.id);
    mc.appendChild(m);
  });
}

/* ── Menu section builder ── */
function buildSections() {
  const wrap = document.getElementById('menuSections');
  wrap.innerHTML = '';

  const dataSource = (window.isAdminMode && window.adminMenu) ? window.adminMenu : menu;

  categories.forEach(c => {
    const sec = document.createElement('div');
    sec.className = 'menu-section';
    sec.id = 'sec-' + c.id;
    
    const items = dataSource[c.id] || [];
    const cardsHTML = items.map(item => cardHTML(item, c.id)).join('');
    
    sec.innerHTML = `<div class="menu-grid">${cardsHTML}</div>`;
    wrap.appendChild(sec);
  });
}

/* ── Menu card HTML ── */
function cardHTML(item, catId = null) {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'tisoy2025';

  const tagHTML = item.tag === 'bestseller' ? `<span class="tag-best">⭐ Best Seller</span>`
                : item.tag === 'new' ? `<span class="tag-new">✨ New</span>` : '';
  const spicy = item.tag === 'spicy' ? `<span class="tag-spicy">🌶️ Spicy</span>` : '';

    // Image handling - Improved for external URLs
  let imgContent = `<span class="card-emoji-fallback">${item.emoji}</span>`;
  
  if (item.images && item.images.length > 0) {
    let imgSrc = item.images[0];
    
    // Support external URLs (http/https)
    if (imgSrc.startsWith('http')) {
      // External link - no modification needed
    } else if (!imgSrc.startsWith('/images/')) {
      if (imgSrc.startsWith('images/')) imgSrc = '/' + imgSrc;
      else imgSrc = '/images/' + imgSrc.replace(/^\/+/, '');
    }
    
    imgContent = `
      <img src="${imgSrc}"
           alt="${item.name}"
           loading="lazy"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
      <span class="card-emoji-fallback" style="display:none">${item.emoji}</span>`;
  }

  const cardClick = `onclick="showItemModalById(${item.id})" style="cursor:pointer"`;

  let adminControls = '';
  if (isAdmin) {
    const isAvailable = item.available !== false;
    const currentCat = catId || activeCat;
    adminControls = `
      <div class="admin-card-controls">
        <button onclick="event.stopImmediatePropagation(); editItemInline('${currentCat}', ${item.id});" class="admin-card-btn" title="Edit">✏️</button>
        <button onclick="event.stopImmediatePropagation(); toggleItemVisibility('${currentCat}', ${item.id});" class="admin-card-btn" title="Toggle Visibility">
          ${isAvailable ? '✅' : '🚫'}
        </button>
        <button onclick="event.stopImmediatePropagation(); deleteItemInline('${currentCat}', ${item.id});" class="admin-card-btn danger" title="Delete">🗑️</button>
      </div>`;
  }

  if (item.variants && item.variants.length) {
    const firstPrice = item.variants[0].price;
    const opts = item.variants.map((v, i) =>
      `<option value="${i}" data-price="${v.price}">${v.size}${v.note ? ' · ' + v.note : ''} — ${v.price ? '₱' + v.price : 'Contact us'}</option>`
    ).join('');
    const safeN = item.name.replace(/'/g,"\\'");

    return `
  <div class="menu-card" ${cardClick}>
    <div class="menu-card-img">${tagHTML}${spicy}${imgContent}${adminControls}</div>
    <div class="card-body">
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <select class="variant-select" id="var-${item.id}" onchange="updateVariantPrice(${item.id},this)">${opts}</select>
      <div class="card-foot">
        <span class="item-price" id="price-${item.id}">${firstPrice ? '₱' + firstPrice : 'Contact us'}</span>
        <button class="add-btn" onclick="event.stopImmediatePropagation(); addVariantToCart(${item.id},'${safeN}','${item.emoji}')">＋ Add</button>
      </div>
    </div>
  </div>`;
  }

  const displayPrice = item.price ? '₱' + item.price : 'Contact us';
  return `
  <div class="menu-card" ${cardClick}>
    <div class="menu-card-img">${tagHTML}${spicy}${imgContent}${adminControls}</div>
    <div class="card-body">
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <div class="card-foot">
        <span class="item-price">${displayPrice}</span>
        <button class="add-btn" onclick="event.stopImmediatePropagation(); addToCart(${item.id},'${item.name.replace(/'/g,"\\'")}',${item.price},'${item.emoji}')">＋ Add</button>
      </div>
    </div>
  </div>`;
}

/* ── Variant helpers ── */
function updateVariantPrice(itemId, sel) {
  const price = parseInt(sel.selectedOptions[0].getAttribute('data-price')) || 0;
  const el = document.getElementById('price-' + itemId);
  if (el) el.textContent = price ? '₱' + price : 'Contact us';
}

function addVariantToCart(itemId, name, emoji) {
  const sel = document.getElementById('var-' + itemId);
  if (!sel) return;
  const opt = sel.selectedOptions[0];
  const price = parseInt(opt.getAttribute('data-price')) || 0;
  const size = opt.text.split(' — ')[0];
  const cartKey = itemId + '-' + sel.selectedIndex;
  const cartName = name + ' (' + size + ')';
  addToCart(cartKey, cartName, price, emoji);
}

/* ── Active category ── */
function setActiveCat(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) {
    console.warn(`Category "${id}" not found.`);
    return;
  }
  activeCat = id;
  document.getElementById('secTitle').textContent = cat.emoji + ' ' + cat.label;
  document.getElementById('secDesc').textContent = cat.desc || '';

  document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('visible'));
  const section = document.getElementById('sec-' + id);
  if (section) section.classList.add('visible');

  document.querySelectorAll('.cat-item, .m-cat-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('dc-' + id)?.classList.add('active');
  document.getElementById('mc-' + id)?.classList.add('active');
}

/* ── Order type toggle ── */
function setOrderType(t, btn) {
  orderType = t;
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCart();
}

/* ── Drawer ── */
function openCartDrawer() { document.getElementById('cartDrawer').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeCartDrawer() { document.getElementById('cartDrawer').classList.remove('open'); document.body.style.overflow = ''; }

/* ── Modals ── */
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }

/* ── Location save ── */
function saveLocation() {
  const loc = document.getElementById('locInput').value.trim();
  const area = document.getElementById('locArea').value;
  const display = loc || area || 'My Location';
  const locEl = document.getElementById('currentLoc');
  if (locEl) locEl.textContent = display.length > 22 ? display.slice(0, 22) + '...' : display;
  closeModal('locationModal');
  showToast('📍 Location saved!');
}

/* ── Toast ── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── Search ── */
function searchMenu(query) {
  const q = query.trim().toLowerCase();
  const clearBtn = document.getElementById('searchClear');
  const mobileCats = document.getElementById('mobileCats');
  const secHd = document.querySelector('.section-hd');
  clearBtn.classList.toggle('hidden', q === '');
  if (!q) {
    clearSearch();
    return;
  }
  mobileCats.style.display = 'none';
  secHd.style.display = 'none';

  const results = [];
  categories.forEach(cat => {
    (menu[cat.id] || []).forEach(item => {
      if (
        item.name.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q)) ||
        cat.label.toLowerCase().includes(q)
      ) {
        results.push({ ...item, catLabel: cat.label });
      }
    });
  });

  const wrap = document.getElementById('menuSections');
  if (results.length === 0) {
    wrap.innerHTML = `
      <div class="no-results">
        <div class="nr-icon">🍣</div>
        <p>No items found for "<strong>${query}</strong>"</p>
      </div>`;
  } else {
    wrap.innerHTML = `
      <div class="search-results-hd">Showing <span>${results.length}</span> result${results.length > 1 ? 's' : ''} for "<span>${query}</span>"</div>
      <div class="menu-grid">${results.map(item => cardHTML(item, item.cat || activeCat)).join('')}</div>`;
  }
}

function clearSearch() {
  const input = document.getElementById('menuSearch');
  input.value = '';
  document.getElementById('searchClear').classList.add('hidden');
  document.getElementById('mobileCats').style.display = '';
  document.querySelector('.section-hd').style.display = '';
  buildSections();
  setActiveCat(activeCat);
}

function getFullImagePath(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/images/')) return path;
  if (path.startsWith('images/')) return '/' + path;
  return '/images/' + path.replace(/^\/+/, '');
}

/* ── Item Detail Modal ── */
let currentItem = null;
function showItemModal(item) {
  currentItem = item;
  const imgEl = document.getElementById('modalImage');
  if (item.images && item.images.length > 0) {
    imgEl.src = getFullImagePath(item.images[0]);
  } else {
    imgEl.src = '';
  }
  document.getElementById('modalName').textContent = item.name;
  document.getElementById('modalDesc').textContent = item.desc || '';

  const variantsContainer = document.getElementById('modalVariants');
  const priceEl = document.getElementById('modalPrice');

  if (item.variants && item.variants.length > 0) {
    let html = `<select id="modalVariantSelect" onchange="updateModalPrice()">`;
    item.variants.forEach((v, i) => {
      html += `<option value="${i}" data-price="${v.price}">${v.size} — ₱${v.price} ${v.note ? '· ' + v.note : ''}</option>`;
    });
    html += `</select>`;
    variantsContainer.innerHTML = html;
    updateModalPrice();
  } else {
    variantsContainer.innerHTML = '';
    priceEl.textContent = item.price ? `₱${item.price}` : 'Contact us';
  }

  const addBtn = document.getElementById('modalAddBtn');
  addBtn.onclick = () => {
    if (item.variants && item.variants.length) {
      addVariantToCart(item.id, item.name, item.emoji);
    } else {
      addToCart(item.id, item.name, item.price, item.emoji);
    }
    closeItemModal();
  };

  document.getElementById('itemModal').style.display = 'flex';
}

function showItemModalById(id) {
  const dataSource = (window.isAdminMode && window.adminMenu) ? window.adminMenu : menu;
  let item = null;
  Object.values(dataSource).forEach(cat => {
    const found = cat.find(i => i.id === id);
    if (found) item = found;
  });
  if (item) showItemModal(item);
}

function updateModalPrice() {
  const sel = document.getElementById('modalVariantSelect');
  if (!sel) return;
  const price = sel.selectedOptions[0].getAttribute('data-price');
  document.getElementById('modalPrice').textContent = `₱${price}`;
}

function closeItemModal() {
  document.getElementById('itemModal').style.display = 'none';
}

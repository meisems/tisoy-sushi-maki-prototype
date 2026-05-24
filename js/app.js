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

  const tagHTML = item.tag === 'bestseller' ? `<span class="tag-best">Best Seller</span>`
                : item.tag === 'new' ? `<span class="tag-new">New</span>` : '';
  const spicy = item.tag === 'spicy' ? `<span class="tag-spicy">Spicy</span>` : '';

    // Image handling - Improved for external URLs
  let imgContent = `<span class="card-emoji-fallback">${item.emoji}</span>`;
  
  if (item.images && item.images.length > 0) {
    let imgSrc = item.images[0];

    // Base64 data URLs and /api/image paths need no modification
    if (imgSrc.startsWith('data:') || imgSrc.startsWith('/api/image')) {
      // use as-is
    } else if (imgSrc.startsWith('http')) {
      // external URL — no modification
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
  const safeN = item.name.replace(/'/g,"\\'");

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

    return `
  <div class="menu-card" ${cardClick}>
    <div class="menu-card-img">${tagHTML}${spicy}${imgContent}${adminControls}</div>
    <div class="card-body">
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <select class="variant-select" id="var-${item.id}" onchange="updateVariantPrice(${item.id},this)">${opts}</select>
      <div class="card-foot">
        <span class="item-price" id="price-${item.id}">${firstPrice ? '₱' + firstPrice : 'Contact us'}</span>
        <button class="add-btn" onclick="event.stopImmediatePropagation(); addVariantToCart(${item.id},'${safeN}','${item.emoji}')">＋</button>
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
        <button class="add-btn" onclick="event.stopImmediatePropagation(); addToCart(${item.id},'${safeN}',${item.price},'${item.emoji}')">＋</button>
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
  document.getElementById('secTitle').textContent = cat.label;
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
  if (path.startsWith('data:')) return path;       // base64
  if (path.startsWith('/api/image')) return path;  // stored image
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

/* ═══════════════════════════════════════════════════════
   STITCH INTEGRATION — New JS for stitch design pages
═══════════════════════════════════════════════════════ */

/* ── Build Stitch Category Tabs ── */
function buildStitchCats() {
  const container = document.getElementById('stitchCats');
  if (!container) return;
  container.innerHTML = '';

  // SVG icons for each category
  const catIcons = {
    bakedsushi: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="14" width="32" height="22" rx="4" stroke="currentColor" stroke-width="2.5"/><path d="M14 14 Q 24 8 34 14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M16 22h16M16 28h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 10 Q 24 4 38 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".4"/></svg>`,
    makirolls: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="3" fill="currentColor" opacity=".5"/><circle cx="16" cy="18" r="5" stroke="currentColor" stroke-width="2" opacity=".7"/></svg>`,
    platters: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="12" width="36" height="26" rx="4" stroke="currentColor" stroke-width="2.5"/><rect x="10" y="16" width="28" height="6" rx="2" stroke="currentColor" stroke-width="2"/><rect x="10" y="26" width="13" height="8" rx="2" stroke="currentColor" stroke-width="2"/><rect x="25" y="26" width="13" height="8" rx="2" stroke="currentColor" stroke-width="2"/></svg>`,
    kanisalad: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 36 Q24 14 38 36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="24" cy="36" rx="14" ry="4" stroke="currentColor" stroke-width="2"/><path d="M18 28 Q24 20 30 28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="18" r="4" stroke="currentColor" stroke-width="2"/></svg>`,
    harumakisalad: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="10" width="24" height="30" rx="12" stroke="currentColor" stroke-width="2.5"/><path d="M18 20 Q 24 16 30 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 26 Q 24 22 30 26" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M18 32 Q 24 28 30 32" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".3"/></svg>`,
  };

  const defaultIcon = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="24" r="6" stroke="currentColor" stroke-width="2"/></svg>`;

  categories.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.className = 'stitch-cat-btn' + (idx === 0 ? ' active' : '');
    btn.id = 'sc-' + c.id;
    const iconKey = c.id.replace(/[^a-z]/gi,'').toLowerCase();
    const icon = catIcons[iconKey] || catIcons[c.id] || defaultIcon;
    btn.innerHTML = `${icon}<span>${c.label}</span>`;
    btn.onclick = () => setActiveCat(c.id);
    container.appendChild(btn);
  });
}

/* ── Override setActiveCat to also update stitch tabs ── */
const _origSetActiveCat = window.setActiveCat || setActiveCat;
function setActiveCatStitch(id) {
  _origSetActiveCat(id);
  // Update stitch tabs
  document.querySelectorAll('.stitch-cat-btn').forEach(b => b.classList.remove('active'));
  const sc = document.getElementById('sc-' + id);
  if (sc) {
    sc.classList.add('active');
    sc.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/* ── Nav Delivery/Pickup Toggle ── */
function toggleDeliveryNav() {
  const pill = document.getElementById('navTogglePill');
  const label = document.getElementById('navDeliveryLabel');
  if (!pill) return;
  if (orderType === 'delivery') {
    setOrderType('pickup');
    pill.classList.add('pickup');
    if (label) label.textContent = 'Pick-Up / Delivery';
  } else {
    setOrderType('delivery');
    pill.classList.remove('pickup');
    if (label) label.textContent = 'Delivery / Pick-Up';
  }
}

/* ── Open Stitch Checkout Page ── */
function openCheckoutPage() {
  if (!storeOpen) { showToast('🔴 Store is currently closed.'); return; }
  if (cartCount() === 0) { showToast('Your cart is empty!'); return; }
  closeCartDrawer();

  // Fill order items
  const items = cartItems();
  const tot = total();
  let itemsHTML = '';
  items.forEach(i => {
    itemsHTML += `<div class="osb-item"><span>${i.name} × ${i.qty}</span><span>₱${i.price * i.qty}</span></div>`;
  });
  const el = document.getElementById('checkoutOrderItems');
  if (el) el.innerHTML = itemsHTML;
  const st = document.getElementById('checkoutSubtotal');
  if (st) st.textContent = '₱' + tot;
  const tt = document.getElementById('checkoutTotal');
  if (tt) tt.textContent = '₱' + tot;

  document.getElementById('checkoutPage').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutPage() {
  document.getElementById('checkoutPage').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Payment Method Selection (Stitch) ── */
let stitchPayMethod = 'cod';
function selectPayMethod(el, method) {
  document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  stitchPayMethod = method;
  const cardFields = document.getElementById('cardFields');
  if (cardFields) cardFields.classList.toggle('show', method === 'card');
}

/* ── Place Order (Stitch checkout) ── */
window.placeOrderStitch = function() {
  try {
    const fname = document.getElementById('fname')?.value.trim() || '';
    const lname = document.getElementById('lname')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const addr = document.getElementById('deliveryAddress')?.value.trim() || '';
    const barangay = document.getElementById('barangay')?.value.trim() || '';
    const notes = document.getElementById('notes')?.value.trim() || '';

    if (!fname || !lname) return showToast('⚠️ Please enter your full name');
    if (!phone) return showToast('⚠️ Please enter your mobile number');
    if (orderType === 'delivery' && !addr) return showToast('⚠️ Please enter your delivery address');
    if (orderType === 'delivery' && !barangay) return showToast('⚠️ Please select your Barangay/Area');

    const orderNum = '#TSM-' + Date.now().toString().slice(-6);

    // Build WA/FB message
    let msg = `🍣 *NEW ORDER — Tisoy Sushi Maki*\n\n`;
    msg += `📌 Order No.: ${orderNum}\n`;
    msg += `👤 Customer: ${fname} ${lname}\n`;
    msg += `📞 Contact: ${phone}\n`;
    if (orderType === 'delivery') {
      msg += `📍 Address: ${addr}\n`;
      if (barangay) msg += `📍 Area: ${barangay}\n`;
    }
    msg += `🚚 Type: ${orderType.toUpperCase()}\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n🛒 ORDER ITEMS:\n\n`;
    cartItems().forEach(item => {
      msg += `• ${item.name} × ${item.qty} = ₱${item.price * item.qty}\n`;
    });
    msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 Total: ₱${total()}\n`;
    msg += `💳 Payment: ${stitchPayMethod.toUpperCase()}`;
    if (notes) msg += `\n📝 Notes: ${notes}`;

    const fbUrl = `https://www.facebook.com/messages/t/61556171585372?text=${encodeURIComponent(msg)}`;
    window.open(fbUrl, '_blank');

    // Fill confirmation page
    const items = cartItems();
    const tot = total();
    let confHTML = '';
    items.forEach(i => {
      confHTML += `<div class="csb-item"><span>${i.name} × ${i.qty}</span><span>₱${i.price * i.qty}</span></div>`;
    });
    const ci = document.getElementById('confirmSummaryItems');
    if (ci) ci.innerHTML = confHTML;
    const cs = document.getElementById('confirmSubtotal');
    if (cs) cs.textContent = '₱' + tot;
    const ct = document.getElementById('confirmTotal');
    if (ct) ct.textContent = '₱' + tot;
    const ca = document.getElementById('confirmAddress');
    if (ca) ca.textContent = (addr || 'Pick-up') + (barangay ? ', ' + barangay : '');
    const con = document.getElementById('confirmOrderNum');
    if (con) con.textContent = 'Order Number: ' + orderNum;

    // Set tracking times
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit'});
    const elR = document.getElementById('orderReceivedTime');
    if (elR) elR.textContent = timeStr;
    const elP = document.getElementById('preparingTime');
    const prepTime = new Date(now.getTime() + 5 * 60000).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});
    if (elP) elP.textContent = prepTime;

    // Clear cart
    cart = {};
    renderCart();
    closeCheckoutPage();

    // Open confirmation page
    document.getElementById('confirmPage').classList.add('open');
    document.body.style.overflow = 'hidden';
    showToast('🎉 Order sent! Check Facebook for confirmation.');

  } catch (err) {
    console.error('Place Order Error:', err);
    showToast('❌ Error occurred. Please try again.');
  }
};

/* ── Close Confirmation Page ── */
window.closeConfirmPage = function() {
  document.getElementById('confirmPage').classList.remove('open');
  document.body.style.overflow = '';
  // Clear form
  ['fname','lname','phone','deliveryAddress','barangay','notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
};

/* ── Open/Close Tracking Page ── */
window.openTrackingPage = function() {
  const eta = new Date(Date.now() + 40 * 60000);
  const etaStr = eta.toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit'});
  const etaEl = document.getElementById('trackingETA');
  const etaPEl = document.getElementById('trackingETAPanel');
  if (etaEl) etaEl.textContent = etaStr;
  if (etaPEl) etaPEl.textContent = 'ETA: ' + etaStr;
  document.getElementById('trackingPage').classList.add('open');
};

window.closeTrackingPage = function() {
  document.getElementById('trackingPage').classList.remove('open');
  // Show review modal after a moment
  setTimeout(() => openReviewModal(), 400);
};

/* ── Review Modal ── */
let sushiRatingVal = 4;

window.openReviewModal = function() {
  document.getElementById('reviewModal').classList.add('open');
};

window.closeReviewModal = function() {
  document.getElementById('reviewModal').classList.remove('open');
};

window.setSushiRating = function(val) {
  sushiRatingVal = val;
  document.querySelectorAll('.sushi-roll-btn').forEach((btn, i) => {
    btn.classList.toggle('lit', i < val);
  });
};

window.updateSlider = function(slider, val) {
  const pct = ((val - 1) / 4) * 100;
  slider.style.setProperty('--pct', pct + '%');
  const stars = slider.parentElement.querySelector('.rsr-stars');
  if (stars) {
    const filled = Math.round(Number(val));
    stars.innerHTML = '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }
};

window.submitReview = function() {
  showToast('🍣 Thank you for your review! Salamat!');
  closeReviewModal();
};

/* ── Override openCheckout to use stitch checkout page ── */
window.openCheckout = function() { openCheckoutPage(); };

/* Hook into DOMContentLoaded additions */
document.addEventListener('DOMContentLoaded', () => {
  buildStitchCats();

  // Override setActiveCat globally for stitch tabs
  window.setActiveCat = function(id) {
    // Call original logic
    activeCat = id;
    document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('visible'));
    const sec = document.getElementById('sec-' + id);
    if (sec) sec.classList.add('visible');

    // Update desktop cats
    document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
    const dc = document.getElementById('dc-' + id);
    if (dc) dc.classList.add('active');

    // Update mobile cats
    document.querySelectorAll('.m-cat-btn').forEach(c => c.classList.remove('active'));
    const mc = document.getElementById('mc-' + id);
    if (mc) mc.classList.add('active');

    // Update stitch cats
    document.querySelectorAll('.stitch-cat-btn').forEach(b => b.classList.remove('active'));
    const sc = document.getElementById('sc-' + id);
    if (sc) {
      sc.classList.add('active');
      sc.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Update section title
    const cat = categories.find(c => c.id === id);
    if (cat) {
      const th = document.getElementById('secTitle');
      const td = document.getElementById('secDesc');
      if (th) th.textContent = cat.label;
      if (td) td.textContent = cat.desc || '';
    }
  };

  // Initialize nav delivery toggle state
  const pill = document.getElementById('navTogglePill');
  if (pill && orderType === 'pickup') pill.classList.add('pickup');
});

/* ── Hero Image Slideshow ── */
(function() {
  const heroImages = [
    'images/FB_IMG_1778471059522.jpg',
    'images/FB_IMG_1778471046379.jpg',
    'images/FB_IMG_1778471044176.jpg',
    'images/FB_IMG_1778471040426.jpg',
    'images/FB_IMG_1778470820675.jpg',
  ];
  let heroIdx = 0;
  
  function rotateHeroImage() {
    const img = document.getElementById('heroImg');
    if (!img) return;
    img.classList.add('fade-out');
    setTimeout(() => {
      heroIdx = (heroIdx + 1) % heroImages.length;
      img.src = heroImages[heroIdx];
      img.classList.remove('fade-out');
    }, 1000);
  }
  
  // Start rotation after page load
  document.addEventListener('DOMContentLoaded', () => {
    setInterval(rotateHeroImage, 5000);
  });
})();

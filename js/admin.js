/* ══════════════════════════════════════
   admin.js — Store Status + Full Inline Menu Editing
══════════════════════════════════════ */

let isAdminMode = false;
let adminMenu = null;

async function initAdmin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') !== 'tisoy2025') return;

  console.log('✅ Admin Mode Activated');
  isAdminMode = true;
  window.isAdminMode = true;

  // Show admin buttons
  const adminControls = document.getElementById('adminControls');
  if (adminControls) adminControls.style.display = 'block';

  // Add .visible class so the fixed-position fabs actually appear
  const adminFab = document.getElementById('adminFab');
  const addMenuFab = document.getElementById('addMenuFab');
  if (adminFab) adminFab.classList.add('visible');
  if (addMenuFab) addMenuFab.classList.add('visible');

  // Load menu
  try {
    const res = await fetch('/api/menu');
    const data = await res.json();
    adminMenu = data && Object.keys(data).length > 0 
      ? data 
      : JSON.parse(JSON.stringify(menu || {}));
  } catch (e) {
    console.warn('Using local menu data');
    adminMenu = JSON.parse(JSON.stringify(menu || {}));
  }

  window.adminMenu = adminMenu;
  if (typeof buildSections === 'function') buildSections();

  // buildSections() wipes all .menu-section elements (none have .visible yet).
  // Re-apply the active category so the correct section becomes visible again.
  const restoreCat = (typeof activeCat !== 'undefined' && activeCat) ? activeCat : 'bakedsushi';

  // Prefer window.setActiveCat (may be the stitch-aware override); fall back to
  // the module-level setActiveCat which also updates secTitle / secDesc.
  const setActive = window.setActiveCat || (typeof setActiveCat === 'function' ? setActiveCat : null);
  if (setActive) {
    setActive(restoreCat);
  } else {
    // Minimal fallback: at least show the right section
    document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('visible'));
    const sec = document.getElementById('sec-' + restoreCat);
    if (sec) sec.classList.add('visible');
  }
}

function checkAdminAccess() {
  return isAdminMode === true;
}

// ==================== STORE STATUS ====================
function toggleAdminPanel() {
  if (!checkAdminAccess()) return;
  const panel = document.getElementById('adminPanel');
  if (panel) panel.classList.toggle('open');
}

function toggleOwnerClosed() {
  if (!checkAdminAccess()) return;
  const tog = document.getElementById('adminToggle');
  const dot = document.getElementById('adminDot');
  const area = document.getElementById('adminMsgArea');

  const isOn = tog.classList.toggle('on');
  dot.classList.toggle('off', isOn);
  area.classList.toggle('show', isOn);
}

async function applyOwnerStatus() {
  if (!checkAdminAccess()) return;

  const isClosed = document.getElementById('adminToggle').classList.contains('on');
  const msg = document.getElementById('adminMsgInput').value.trim();

  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_closed: isClosed ? '1' : '0',
        store_message: msg || 'We are temporarily unavailable.'
      })
    });
  } catch (e) {
    showToast('⚠️ Failed to save status');
  }

  document.getElementById('adminPanel').classList.remove('open');
  if (typeof checkStoreStatus === 'function') checkStoreStatus();
  showToast(isClosed ? '🔴 Store is now CLOSED' : '✅ Store is now OPEN');
}

// ==================== ADMIN ITEM EDITING ====================

function getAdminItem(catId, itemId) {
  if (!adminMenu || !adminMenu[catId]) return null;
  return adminMenu[catId].find(item => item.id === itemId);
}

function editItemInline(catId, itemId) {
  if (!checkAdminAccess()) return;
  const item = getAdminItem(catId, itemId);
  if (!item) return alert("Item not found");

  let html = `
    <input type="hidden" id="editCatId" value="${catId}">
    <input type="hidden" id="editItemId" value="${itemId}">
    
    <div class="fg">
      <label>Item Photo</label>
      <div class="img-tabs">
        <button type="button" class="img-tab active" onclick="switchImgTab('edit','upload')">⬆️ Upload File</button>
        <button type="button" class="img-tab" onclick="switchImgTab('edit','link')">🔗 Link URL</button>
      </div>

      <!-- Upload panel -->
      <div id="edit-panel-upload" class="img-panel">
        <div class="img-dropzone" id="edit-dropzone"
          onclick="document.getElementById('editFileInput').click()"
          ondragover="event.preventDefault();this.classList.add('drag-over')"
          ondragleave="this.classList.remove('drag-over')"
          ondrop="handleImgDrop(event,'edit')">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          <span>Click or drag &amp; drop an image here</span>
          <small>JPG, PNG, WEBP · max 10 MB</small>
        </div>
        <input type="file" id="editFileInput" accept="image/*" style="display:none" onchange="handleImgFile(event,'edit')">
      </div>

      <!-- Link panel -->
      <div id="edit-panel-link" class="img-panel" style="display:none;">
        <input id="editImageUrl" type="text" value="${item.images && item.images[0] ? item.images[0] : ''}" placeholder="https://... or images/filename.jpg" oninput="updateImgPreview('edit',this.value)">
      </div>

      <!-- Shared preview -->
      <div id="edit-img-preview" class="img-preview-box">
        ${item.images && item.images[0]
          ? `<img src="${item.images[0]}" alt="preview"><button type="button" class="img-clear-btn" onclick="clearImgPreview('edit')">✕ Remove</button>`
          : `<span class="img-placeholder">No image selected</span>`}
      </div>
      <input type="hidden" id="editFinalImage" value="${item.images && item.images[0] ? item.images[0] : ''}">
    </div>

    <div class="fg">
      <label>Item Name *</label>
      <input id="editName" type="text" value="${(item.name || '').replace(/"/g, '&quot;')}">
    </div>
    <div class="fg">
      <label>Description</label>
      <textarea id="editDesc" rows="3">${(item.desc || '')}</textarea>
    </div>`;

  if (!item.variants || item.variants.length === 0) {
    html += `
      <div class="fg">
        <label>Price (₱)</label>
        <input id="editPrice" type="number" value="${item.price || ''}">
      </div>`;
  } else {
    html += `<h4 style="margin:20px 0 12px; color:var(--primary);">Price per Size</h4>`;
    item.variants.forEach((v, i) => {
      html += `
        <div class="fg">
          <label>${v.size}${v.note ? ` (${v.note})` : ''}</label>
          <input type="number" class="variant-price-input" data-index="${i}" value="${v.price || ''}">
        </div>`;
    });
  }

  html += `
    <div class="fg">
      <label>Item Badge / Category Tag</label>
      <select id="editTag" style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:'Nunito',sans-serif;font-size:.9rem;background:var(--bg-input);color:var(--text-main);">
        <option value="" ${!item.tag ? 'selected' : ''}>— None —</option>
        <option value="bestseller" ${item.tag === 'bestseller' ? 'selected' : ''}>⭐ Best Seller</option>
        <option value="new" ${item.tag === 'new' ? 'selected' : ''}>✨ New Item</option>
        <option value="spicy" ${item.tag === 'spicy' ? 'selected' : ''}>🌶️ Spicy</option>
      </select>
      <small style="color:var(--text-muted);font-size:.73rem;margin-top:5px;display:block;">
        <b>Best Seller</b> &amp; <b>New</b> show a green banner (top-left) · <b>Spicy</b> shows a red badge (top-right)
      </small>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeAdminEditModal()">Cancel</button>
      <button class="btn-primary" onclick="saveEditedItem()">Save Changes</button>
    </div>`;

  document.getElementById('editModalBody').innerHTML = html;
  document.getElementById('adminEditModal').style.display = 'flex';
}

async function saveEditedItem() {
  if (!checkAdminAccess()) return;
  const catId = document.getElementById('editCatId').value;
  const itemId = parseInt(document.getElementById('editItemId').value);
  const item = getAdminItem(catId, itemId);
  if (!item) return alert("Item not found");

  item.name = document.getElementById('editName').value.trim();
  item.desc = document.getElementById('editDesc').value.trim();

  // Save tag
  const tagVal = document.getElementById('editTag').value;
  if (tagVal) { item.tag = tagVal; } else { delete item.tag; }

  // If an image was picked via file upload, push it to /api/image first
  let finalImg = document.getElementById('editFinalImage').value.trim();
  if (finalImg === '__pending__') {
    finalImg = await _uploadImageData('edit');
    if (!finalImg) return; // upload failed — toast already shown, modal stays open
  }
  if (finalImg) item.images = [finalImg];

  if (!item.variants || item.variants.length === 0) {
    const price = parseInt(document.getElementById('editPrice').value);
    if (!isNaN(price)) item.price = price;
  } else {
    document.querySelectorAll('.variant-price-input').forEach(input => {
      const index = parseInt(input.dataset.index);
      const price = parseInt(input.value);
      if (!isNaN(price) && item.variants[index]) {
        item.variants[index].price = price;
      }
    });
  }

  const ok = await saveAdminMenu();
  buildSections();
  if (ok) {
    closeAdminEditModal();
    showToast("✅ Changes saved!");
  }
  // If ok is false, the modal stays open and saveAdminMenu already showed the error toast
}

function closeAdminEditModal() {
  document.getElementById('adminEditModal').style.display = 'none';
}

async function toggleItemVisibility(catId, itemId) {
  if (!checkAdminAccess()) return;
  const item = getAdminItem(catId, itemId);
  if (!item) return;

  item.available = item.available === false ? true : false;
  await saveAdminMenu();
  buildSections();
}

async function deleteItemInline(catId, itemId) {
  if (!checkAdminAccess()) return;
  if (!confirm("Delete this item permanently?")) return;

  if (adminMenu[catId]) {
    adminMenu[catId] = adminMenu[catId].filter(item => item.id !== itemId);
    await saveAdminMenu();
    buildSections();
    showToast("🗑️ Item deleted");
  }
}

async function saveAdminMenu() {
  if (!checkAdminAccess()) return false;
  try {
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminMenu)
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.status);
      console.error('saveAdminMenu server error:', errText);
      showToast(`⚠️ Save failed (${res.status}) — image may be too large`);
      return false;
    }
    return true;
  } catch (e) {
    showToast('⚠️ Failed to save menu — check connection');
    console.error(e);
    return false;
  }
}

// ==================== ADD NEW MENU ITEM ====================

function showAddMenuModal() {
  if (!checkAdminAccess()) return;

  const html = `
    <div class="fg">
      <label>Category *</label>
      <select id="newCatId">
        ${categories.map(cat => `<option value="${cat.id}">${cat.emoji} ${cat.label}</option>`).join('')}
      </select>
    </div>

    <div class="fg">
      <label>Item Name *</label>
      <input id="newName" type="text" placeholder="e.g. Spicy Tuna Maki">
    </div>

    <div class="fg">
      <label>Description</label>
      <textarea id="newDesc" rows="3" placeholder="Short description..."></textarea>
    </div>

    <div class="fg">
      <label>Item Photo</label>
      <div class="img-tabs">
        <button type="button" class="img-tab active" onclick="switchImgTab('new','upload')">⬆️ Upload File</button>
        <button type="button" class="img-tab" onclick="switchImgTab('new','link')">🔗 Link URL</button>
      </div>

      <!-- Upload panel -->
      <div id="new-panel-upload" class="img-panel">
        <div class="img-dropzone" id="new-dropzone"
          onclick="document.getElementById('newFileInput').click()"
          ondragover="event.preventDefault();this.classList.add('drag-over')"
          ondragleave="this.classList.remove('drag-over')"
          ondrop="handleImgDrop(event,'new')">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          <span>Click or drag &amp; drop an image here</span>
          <small>JPG, PNG, WEBP · max 10 MB</small>
        </div>
        <input type="file" id="newFileInput" accept="image/*" style="display:none" onchange="handleImgFile(event,'new')">
      </div>

      <!-- Link panel -->
      <div id="new-panel-link" class="img-panel" style="display:none;">
        <input id="newImageUrl" type="text" placeholder="https://... or images/new-item.jpg" oninput="updateImgPreview('new',this.value)">
      </div>

      <!-- Shared preview -->
      <div id="new-img-preview" class="img-preview-box">
        <span class="img-placeholder">No image selected</span>
      </div>
      <input type="hidden" id="newFinalImage" value="">
    </div>

    <div class="fg">
      <label>Pricing Type</label>
      <select id="newPriceType" onchange="toggleVariantFields()">
        <option value="single">Single Price</option>
        <option value="variants">Multiple Sizes / Variants</option>
      </select>
    </div>

    <div id="singlePriceGroup" class="fg">
      <label>Price (₱)</label>
      <input id="newPrice" type="number" placeholder="199">
    </div>

    <div id="variantsGroup" class="fg" style="display:none;">
      <h4>Variants (Size + Price)</h4>
      <div id="variantInputs"></div>
      <button onclick="addVariantField()" class="btn-secondary" style="margin-top:8px;">+ Add Size/Variant</button>
    </div>

    <div class="fg">
      <label>Item Badge / Category Tag</label>
      <select id="newTag" style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:'Nunito',sans-serif;font-size:.9rem;background:var(--bg-input);color:var(--text-main);">
        <option value="">— None —</option>
        <option value="bestseller">⭐ Best Seller</option>
        <option value="new">✨ New Item</option>
        <option value="spicy">🌶️ Spicy</option>
      </select>
      <small style="color:var(--text-muted);font-size:.73rem;margin-top:5px;display:block;">
        <b>Best Seller</b> &amp; <b>New</b> show a green banner (top-left) · <b>Spicy</b> shows a red badge (top-right)
      </small>
    </div>

    <div class="modal-actions" style="margin-top:20px;">
      <button class="btn-secondary" onclick="closeAddMenuModal()">Cancel</button>
      <button class="btn-primary" onclick="saveNewMenuItem()">✅ Add Item</button>
    </div>
  `;

  document.getElementById('addMenuBody').innerHTML = html;
  document.getElementById('addMenuModal').style.display = 'flex';
  addVariantField();
}

function toggleVariantFields() {
  const type = document.getElementById('newPriceType').value;
  document.getElementById('singlePriceGroup').style.display = type === 'single' ? 'block' : 'none';
  document.getElementById('variantsGroup').style.display = type === 'variants' ? 'block' : 'none';
}

let variantCounter = 0;

function addVariantField() {
  variantCounter++;
  const container = document.getElementById('variantInputs');
  const div = document.createElement('div');
  div.className = 'fg';
  div.style.marginBottom = '8px';
  div.innerHTML = `
    <div style="display:flex; gap:8px;">
      <input type="text" placeholder="Size (e.g. Small)" class="variant-size" style="flex:1;">
      <input type="number" placeholder="Price" class="variant-price" style="width:100px;">
      <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary" style="padding:0 10px;">×</button>
    </div>
  `;
  container.appendChild(div);
}

function closeAddMenuModal() {
  document.getElementById('addMenuModal').style.display = 'none';
  variantCounter = 0;
}

async function saveNewMenuItem() {
  if (!checkAdminAccess() || !window.adminMenu) return;

  const catId = document.getElementById('newCatId').value;
  const name = document.getElementById('newName').value.trim();
  const desc = document.getElementById('newDesc').value.trim();

  if (!name || !catId) {
    alert("Name and Category are required!");
    return;
  }

  // If an image was picked via file upload, push it to /api/image first
  let imageUrl = document.getElementById('newFinalImage').value.trim();
  if (imageUrl === '__pending__') {
    imageUrl = await _uploadImageData('new');
    if (!imageUrl) return; // upload failed — toast already shown, modal stays open
  }

  let newItem = {
    id: Date.now(),
    name: name,
    desc: desc || '',
    emoji: '🍣',
    images: imageUrl ? [imageUrl] : []
  };

  // Save tag if selected
  const newTag = document.getElementById('newTag').value;
  if (newTag) newItem.tag = newTag;

  const priceType = document.getElementById('newPriceType').value;

  if (priceType === 'single') {
    const price = parseInt(document.getElementById('newPrice').value) || 0;
    newItem.price = price;
  } else {
    const sizes = [];
    document.querySelectorAll('#variantInputs > div').forEach(div => {
      const sizeInput = div.querySelector('.variant-size');
      const priceInput = div.querySelector('.variant-price');
      if (sizeInput && priceInput) {
        const size = sizeInput.value.trim();
        const price = parseInt(priceInput.value) || 0;
        if (size) sizes.push({ size, price });
      }
    });
    if (sizes.length === 0) {
      alert("Add at least one variant!");
      return;
    }
    newItem.variants = sizes;
  }

  if (!window.adminMenu[catId]) window.adminMenu[catId] = [];
  window.adminMenu[catId].push(newItem);

  const ok = await saveAdminMenu();
  buildSections();
  if (ok) {
    closeAddMenuModal();
    showToast(`✅ "${name}" added!`);
  }
}

// ==================== IMAGE UPLOAD HELPERS ====================

/** Switch between Upload / Link tabs in a modal (prefix = 'edit' or 'new') */
function switchImgTab(prefix, tab) {
  document.getElementById(`${prefix}-panel-upload`).style.display = tab === 'upload' ? 'block' : 'none';
  document.getElementById(`${prefix}-panel-link`).style.display  = tab === 'link'   ? 'block' : 'none';
  document.querySelectorAll(`#${prefix === 'edit' ? 'adminEditModal' : 'addMenuModal'} .img-tab`)
    .forEach(btn => btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tab === 'upload' ? 'upload' : 'link')));
}

/** Handle file chosen via the <input type="file"> */
function handleImgFile(event, prefix) {
  const file = event.target.files[0];
  if (!file) return;
  _storeImgFile(prefix, file);
}

/** Handle file dropped onto the dropzone */
function handleImgDrop(event, prefix) {
  event.preventDefault();
  document.getElementById(`${prefix}-dropzone`).classList.remove('drag-over');
  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return showToast('⚠️ Please drop an image file');
  _storeImgFile(prefix, file);
}

/** Store the pending file — resize+compress, keep base64 in memory until save */
function _storeImgFile(prefix, file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const MAX = 600;
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
      else        { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      // Store base64 in memory (not in DOM input) to avoid 414
      window[`_imgData_${prefix}`] = dataUrl;
      document.getElementById(`${prefix}FinalImage`).value = '__pending__';
      _showImgPreview(prefix, dataUrl, file.name);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/** Upload base64 to /api/image, returns the permanent URL or null on failure */
async function _uploadImageData(prefix) {
  const dataUrl = window[`_imgData_${prefix}`];
  if (!dataUrl) return null;

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;

  try {
    showToast('⬆️ Saving image…');
    const res = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mimeType: matches[1], data: matches[2] })
    });
    if (!res.ok) {
      showToast('⚠️ Image upload failed (' + res.status + ')');
      return null;
    }
    const result = await res.json();
    window[`_imgData_${prefix}`] = null;
    return result.url; // e.g. /api/image/img_1234567890
  } catch (err) {
    console.error('Image upload error:', err);
    showToast('⚠️ Image upload failed — check connection');
    return null;
  }
}

/** Called when URL input changes */
function updateImgPreview(prefix, url) {
  window[`_pendingUpload_${prefix}`] = null;
  document.getElementById(`${prefix}FinalImage`).value = url;
  if (url) _showImgPreview(prefix, url, '');
  else _clearPreviewBox(prefix);
}

function _showImgPreview(prefix, src, filename) {
  const box = document.getElementById(`${prefix}-img-preview`);
  box.innerHTML = `
    <img src="${src}" alt="preview" onerror="this.parentElement.innerHTML='<span class=\\'img-placeholder\\'>⚠️ Could not load image</span>'">
    ${filename ? `<div class="img-filename">${filename}</div>` : ''}
    <button type="button" class="img-clear-btn" onclick="clearImgPreview('${prefix}')">✕ Remove</button>
  `;
}

function clearImgPreview(prefix) {
  window[`_imgData_${prefix}`] = null;
  const finalEl = document.getElementById(`${prefix}FinalImage`);
  if (finalEl) finalEl.value = '';
  const urlEl = document.getElementById(`${prefix}ImageUrl`);
  if (urlEl) urlEl.value = '';
  _clearPreviewBox(prefix);
}

function _clearPreviewBox(prefix) {
  document.getElementById(`${prefix}-img-preview`).innerHTML = '<span class="img-placeholder">No image selected</span>';
}

// ==================== GLOBAL ACCESS & INIT ====================
window.initAdmin = initAdmin;
window.toggleAdminFeedback   = toggleAdminFeedback;
window.loadAdminFeedback     = loadAdminFeedback;
window.toggleFeedbackFeature = toggleFeedbackFeature;
window.deleteAdminFeedback   = deleteAdminFeedback;
window.toggleAdminPanel = toggleAdminPanel;
window.toggleOwnerClosed = toggleOwnerClosed;
window.applyOwnerStatus = applyOwnerStatus;
window.showAddMenuModal = showAddMenuModal;
window.closeAddMenuModal = closeAddMenuModal;
window.saveNewMenuItem = saveNewMenuItem;
window.addVariantField = addVariantField;
window.toggleVariantFields = toggleVariantFields;
window.editItemInline = editItemInline;
window.saveEditedItem = saveEditedItem;
window.closeAdminEditModal = closeAdminEditModal;
window.toggleItemVisibility = toggleItemVisibility;
window.deleteItemInline = deleteItemInline;
window.switchImgTab = switchImgTab;
window.handleImgFile = handleImgFile;
window.handleImgDrop = handleImgDrop;
window.updateImgPreview = updateImgPreview;
window.clearImgPreview = clearImgPreview;

document.addEventListener('DOMContentLoaded', initAdmin);

// ==================== ADMIN FEEDBACK MANAGEMENT ====================

let _feedbackOpen = false;

function toggleAdminFeedback() {
  _feedbackOpen = !_feedbackOpen;
  const body    = document.getElementById('adminFeedbackBody');
  const chevron = document.querySelector('.feedback-chevron');
  if (body)    body.style.display    = _feedbackOpen ? 'block' : 'none';
  if (chevron) chevron.classList.toggle('open', _feedbackOpen);
  if (_feedbackOpen) loadAdminFeedback();
}

async function loadAdminFeedback() {
  const list = document.getElementById('adminFeedbackList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem;padding:6px 0">Loading…</p>';

  try {
    const res  = await fetch('/api/feedback/all');
    const data = await res.json();

    // Update count badge
    const badge = document.getElementById('feedbackBadge');
    if (badge) {
      badge.textContent = data.length;
      badge.style.display = data.length > 0 ? 'inline' : 'none';
    }

    if (!data.length) {
      list.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem;padding:6px 0">No feedback yet.</p>';
      return;
    }

    list.innerHTML = data.map(fb => {
      const stars   = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
      const date    = new Date(fb.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
      const featCls = fb.featured ? 'feature-on' : '';
      const featLbl = fb.featured ? '⭐ Featured' : '☆ Feature';
      return `
        <div class="admin-fb-card" id="afc-${fb._id}">
          <div class="admin-fb-card-top">
            <span class="admin-fb-stars">${stars}</span>
            <span class="admin-fb-name">${fb.name || 'Anonymous'}</span>
            <span class="admin-fb-date">${date}</span>
          </div>
          <div class="admin-fb-text">"${fb.comment}"</div>
          <div class="admin-fb-actions">
            <button class="admin-fb-btn ${featCls}" onclick="toggleFeedbackFeature('${fb._id}', this)">${featLbl}</button>
            <button class="admin-fb-btn del-btn" onclick="deleteAdminFeedback('${fb._id}')">🗑️ Delete</button>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem">Could not load feedback.</p>';
  }
}

async function toggleFeedbackFeature(id, btn) {
  try {
    const res  = await fetch(`/api/feedback/${id}/toggle`, { method: 'POST' });
    const data = await res.json();
    if (btn) {
      btn.classList.toggle('feature-on', data.featured);
      btn.textContent = data.featured ? '⭐ Featured' : '☆ Feature';
    }
    // Refresh the public strip
    if (typeof loadFeaturedReviews === 'function') loadFeaturedReviews();
    showToast(data.featured ? '⭐ Review featured!' : 'Review unfeatured');
  } catch (e) {
    showToast('⚠️ Could not update review');
  }
}

async function deleteAdminFeedback(id) {
  if (!confirm('Delete this feedback permanently?')) return;
  try {
    await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
    document.getElementById('afc-' + id)?.remove();
    if (typeof loadFeaturedReviews === 'function') loadFeaturedReviews();
    showToast('🗑️ Feedback deleted');
  } catch (e) {
    showToast('⚠️ Could not delete feedback');
  }
}

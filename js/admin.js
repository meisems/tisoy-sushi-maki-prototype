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
      <label>Image URL</label>
      <input id="editImageUrl" type="text" value="${item.images && item.images[0] ? item.images[0] : ''}" placeholder="images/filename.jpg or full URL">
      <div id="imagePreview" style="margin-top:10px; text-align:center;">
        ${item.images && item.images[0] ? 
          `<img src="${item.images[0]}" style="max-height:180px; max-width:100%; border-radius:12px; border:1px solid #ddd;">` : 
          '<p style="color:#999;">No image yet</p>'}
      </div>
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

  const newImageUrl = document.getElementById('editImageUrl').value.trim();
  if (newImageUrl) item.images = [newImageUrl];

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

  await saveAdminMenu();
  buildSections();
  closeAdminEditModal();
  showToast("✅ Changes saved successfully!");
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
  if (!checkAdminAccess()) return;
  try {
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminMenu)
    });
  } catch (e) {
    showToast('⚠️ Failed to save menu');
    console.error(e);
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
      <label>Image URL / Path</label>
      <input id="newImageUrl" type="text" placeholder="images/new-item.jpg or full https:// url">
      <div id="newImagePreview" style="margin-top:10px; text-align:center; min-height:100px;"></div>
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
  const imageUrl = document.getElementById('newImageUrl').value.trim();

  if (!name || !catId) {
    alert("Name and Category are required!");
    return;
  }

  let newItem = {
    id: Date.now(),
    name: name,
    desc: desc || '',
    emoji: '🍣',
    images: imageUrl ? [imageUrl] : []
  };

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

  await saveAdminMenu();
  buildSections();
  closeAddMenuModal();
  showToast(`✅ New item "${name}" added!`);
}

// ==================== GLOBAL ACCESS & INIT ====================
window.initAdmin = initAdmin;
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

document.addEventListener('DOMContentLoaded', initAdmin);

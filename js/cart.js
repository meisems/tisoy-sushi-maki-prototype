/* ══════════════════════════════════════
   cart.js — Cart state & rendering
══════════════════════════════════════ */

/* ── Cart state (shared globals set in app.js) ──
   cart       = {}
   orderType  = 'delivery'
   storeOpen  = true
*/

/* ── Persist cart ── */
function saveCart() {
  localStorage.setItem('tsm_cart', JSON.stringify(cart));
  localStorage.setItem('tsm_order_type', orderType);
}
function loadCart() {
  const saved = localStorage.getItem('tsm_cart');
  if (saved) cart = JSON.parse(saved);
  const savedType = localStorage.getItem('tsm_order_type');
  if (savedType) orderType = savedType;
}

/* ── Helpers ── */
const cartItems   = () => Object.values(cart);
const cartCount   = () => cartItems().reduce((a, i) => a + i.qty, 0);
const subtotal    = () => cartItems().reduce((a, i) => a + (Number(i.price) || 0) * i.qty, 0); // ✅ NaN fix
const total       = () => subtotal(); // delivery fee is via Lalamove (TBD)

/* ── Mutations ── */
function addToCart(id, name, price, emoji) {
  if (!storeOpen) {
    showToast('🔴 Store is currently closed. Please come back during business hours.');
    return;
  }
  if (!cart[id]) cart[id] = { id, name, price, emoji, qty: 0 };
  cart[id].qty++;
  renderCart();
  showToast(`${emoji} ${name} added!`);
  const btn = document.getElementById('navCartBtn');
  btn.classList.add('pulse');
  setTimeout(() => btn.classList.remove('pulse'), 350);
}

function updateQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  renderCart();
}

function clearCart() {
  if (!cartCount()) return;
  if (!confirm('Remove all items from your cart?')) return;
  cart = {};
  renderCart();
  showToast('🗑️ Cart cleared.');
}

/* ── Render ── */
function renderCart() {
  const items = cartItems();
  const cnt   = cartCount();
  const sub   = subtotal();
  const tot   = total();

  // Navbar badge
  const nc = document.getElementById('navCartCount');
  nc.textContent = cnt;
  nc.classList.toggle('hidden', cnt === 0);

  // Order type label
  const typeLabel = orderType === 'delivery' ? '🛵 Delivery'
                  : orderType === 'pickup'   ? '🚶 Pick Up'
                  : '🍽️ Dine-In';
  const otEl = document.getElementById('cartOrderType');
  if (otEl) otEl.textContent = typeLabel;

  // Floating cart button (mobile)
  const fb = document.getElementById('floatCart');
  if (cnt > 0) {
    fb.style.display = 'flex';
    document.getElementById('fcCount').textContent = cnt;
    document.getElementById('fcTotal').textContent = '₱' + tot;
  } else {
    fb.style.display = 'none';
  }

  // HTML blocks
  const bodyHTML = cnt === 0
    ? `<div class="cart-empty"><div class="e-icon">🍣</div><p>Your cart is empty.<br>Add your favorite sushi!</p></div>`
    : items.map(cartItemHTML).join('');
  const sumHTML = cnt > 0 ? cartSumHTML(sub, tot) : '';

  document.getElementById('desktopCartBd').innerHTML = bodyHTML;
  document.getElementById('desktopCartSum').innerHTML = sumHTML;
  document.getElementById('mobileCartBd').innerHTML  = bodyHTML;
  document.getElementById('mobileCartSum').innerHTML  = sumHTML;
  saveCart();
}

function cartItemHTML(item) {
  const price    = Number(item.price) || 0; // ✅ NaN fix
  const rowTotal = price * item.qty;
  return `
  <div class="cart-item">
    <div class="ci-emoji">${item.emoji}</div>
    <div class="ci-info">
      <h4>${item.name}</h4>
      <div class="ci-price">₱${price} each</div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="updateQty(${item.id},-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty(${item.id},1)">+</button>
        <button class="rm-btn" onclick="removeItem(${item.id})">🗑️</button>
      </div>
    </div>
    <div class="ci-total">₱${rowTotal}</div>
  </div>`;
}

function cartSumHTML(sub, tot) {
  return `
  <div class="cart-summary">
    <div class="sum-row"><span>Subtotal</span><span>₱${sub}</span></div>
    <div class="sum-row"><span>Delivery Fee</span><span style="color:#e67e00;font-weight:800;">Via Lalamove</span></div>
    <div class="sum-row total"><span>Items Total</span><span>₱${tot}</span></div>
    <button class="checkout-btn" onclick="openCheckout()">Proceed to Checkout →</button>
    <button class="clear-cart-btn" onclick="clearCart()">🗑️ Clear Cart</button>
    <p class="cart-note">Delivery fee via Lalamove · Est. 30–60 min</p>
  </div>`;
}

function buildWAMsg() {
  const items = cartItems();
  if (!items.length) return 'https://wa.me/639916758883';
  let msg = 'Hi Tisoy Sushi Maki! 🍣 I would like to order:\n\n';
  items.forEach(i => {
    const price = Number(i.price) || 0; // ✅ NaN fix
    msg += `• ${i.name} x${i.qty} — ₱${price * i.qty}\n`;
  });
  msg += `\n*Items Total: ₱${total()}*\n*Order Type: ${orderType}*`;
  return 'https://wa.me/639916758883?text=' + encodeURIComponent(msg);
}

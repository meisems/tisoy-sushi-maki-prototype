/* ══════════════════════════════════════
   store.js — Store hours & status logic
══════════════════════════════════════ */

const OPEN_HOUR  = 10; // 10:00 AM PH time
const CLOSE_HOUR = 21; //  9:00 PM PH time

function getPHTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
}

function isWithinBusinessHours() {
  const t = getPHTime();
  const mins = t.getHours() * 60 + t.getMinutes();
  return mins >= OPEN_HOUR * 60 && mins < CLOSE_HOUR * 60;
}

function formatPHTime(d) {
  return d.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila'
  });
}

// Fetch owner override from server instead of localStorage
async function getOwnerOverride() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.store_closed === '1') {
      return {
        closed: true,
        message: data.store_message || 'We are temporarily unavailable.'
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

function setOrderingDisabled(disabled) {
  document.body.classList.toggle('ordering-disabled', disabled);
}

function updateClosedTime(timeStr) {
  const el = document.getElementById('closedCurrentTime');
  if (el) el.textContent = 'Current PH Time: ' + timeStr;
}

function dismissClosedOverlay() {
  const overlay = document.getElementById('closedOverlay');
  overlay.classList.remove('show');
  overlay.dataset.dismissed = '1';
}

async function checkStoreStatus() {
  const override = await getOwnerOverride();
  const bar      = document.getElementById('storeStatusBar');
  const icon     = document.getElementById('storeStatusIcon');
  const msgEl    = document.getElementById('storeStatusMsg');
  const timeEl   = document.getElementById('storeStatusTime');
  const overlay  = document.getElementById('closedOverlay');
  const ph       = getPHTime();
  const timeStr  = formatPHTime(ph);

  // Owner override takes priority
  if (override && override.closed) {
    storeOpen = false;
    bar.className = 'store-status-bar owner-msg';
    icon.textContent = '⚠️';
    msgEl.textContent = override.message || 'We are temporarily unavailable. Sorry for the inconvenience!';
    timeEl.textContent = 'PH Time: ' + timeStr;

    document.getElementById('closedIcon').textContent  = '⚠️';
    document.getElementById('closedTitle').textContent = 'Temporarily Unavailable';
    document.getElementById('closedMsg').textContent   = override.message ||
      'The store is temporarily closed. Please check back later or message us on WhatsApp.';
    if (!overlay.dataset.dismissed) overlay.classList.add('show');
    setOrderingDisabled(true);
    updateClosedTime(timeStr);
    return;
  }

  if (!isWithinBusinessHours()) {
    storeOpen = false;
    bar.className = 'store-status-bar closed';
    icon.textContent = '🔴';
    const opens = ph.getHours() < OPEN_HOUR ? 'Opens at 10:00 AM today' : 'Opens at 10:00 AM tomorrow';
    msgEl.textContent = "We're currently CLOSED. " + opens + ' (Mon–Sun)';
    timeEl.textContent = 'Current PH Time: ' + timeStr;

    document.getElementById('closedIcon').textContent  = ph.getHours() >= OPEN_HOUR ? '🌙' : '🌅';
    document.getElementById('closedTitle').textContent = "We're Closed Right Now";
    document.getElementById('closedMsg').textContent   = ph.getHours() < OPEN_HOUR
      ? "Our kitchen isn't ready yet! We open at 10:00 AM."
      : 'Our kitchen has closed for the day. We\'ll be back tomorrow at 10:00 AM!';
    if (!overlay.dataset.dismissed) overlay.classList.add('show');
    setOrderingDisabled(true);
  } else {
    storeOpen = true;
    bar.className = 'store-status-bar'; // hidden
    overlay.classList.remove('show');
    setOrderingDisabled(false);
  }

  updateClosedTime(timeStr);
}

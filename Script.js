// GLOBAL STATE
let unlocked = 0;
let locked = 0;

// =======================
// NAVIGATION
// =======================
function openPage(page) {
  const content = document.getElementById("content");

  if (page === "home") {
    content.innerHTML = `
      <h3>🏠 Home</h3>
      <p>Welcome back 👋</p>
    `;
  }

  if (page === "wallet") {
    content.innerHTML = `
      <h3>💰 Wallet</h3>
      <p>Unlocked: ${unlocked} Chuk</p>
      <p>Locked: ${locked} Chuk</p>

      <button onclick="earnChuk()">+100 Earn</button>
      <button onclick="unlockChuk()">Unlock</button>
      <button onclick="exchangeChuk()">Exchange to Pi</button>
    `;
  }

  if (page === "live") {
    content.innerHTML = `
      <h3>📡 Live</h3>
      <p>Live streaming coming soon...</p>
    `;
  }

  if (page === "gift") {
    content.innerHTML = `
      <h3>🎁 Gift</h3>
      <button onclick="sendGift(5)">Heart (5)</button>
      <button onclick="sendGift(100)">Star (100)</button>
    `;
  }
}

// =======================
// FIREBASE SAVE
// =======================
async function saveData() {
  if (!window.currentUser) return;

  const { doc, setDoc } = await import(
    "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"
  );

  await setDoc(
    doc(window.db, "users", window.currentUser.uid),
    {
      unlocked: unlocked,
      locked: locked
    },
    { merge: true }
  );
}

// =======================
// ACTIONS
// =======================

// Earn
function earnChuk() {
  locked += 100;
  saveData();
  openPage("wallet");
}

// Unlock
function unlockChuk() {
  unlocked += locked;
  locked = 0;
  saveData();
  openPage("wallet");
}

// Send Gift
function sendGift(amount) {
  if (unlocked >= amount) {
    unlocked -= amount;
    alert("Gift sent 🎉");
  } else {
    alert("Saldo tidak cukup ❌");
  }

  saveData();
  openPage("wallet");
}

// Exchange
function exchangeChuk() {
  const rate = 10000;

  if (unlocked >= rate) {
    unlocked -= rate;
    alert("Berhasil tukar 10K Chuk → 1 Pi 🟡");
  } else {
    alert("Chuk tidak cukup ❌");
  }

  saveData();
  openPage("wallet");
}

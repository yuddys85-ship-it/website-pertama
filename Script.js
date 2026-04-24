let unlocked = 500;
let locked = 500;

function openPage(page) {
  let content = document.getElementById("content");

  if (page === "home") {
    content.innerHTML = "🏠 Home Page - Welcome back!";
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
  }

  if (page === "live") {
    content.innerHTML = "📡 Live Stream coming soon...";
  }

  if (page === "gift") {
    content.innerHTML = `
      <h3>🎁 Gift</h3>
      <button onclick="sendGift(5)">Heart (5)</button>
      <button onclick="sendGift(100)">Star (100)</button>
    `;
  }
}

function earnChuk() {
  locked += 100; // masuk ke locked dulu
  openPage("wallet");
}

function unlockChuk() {
  unlocked += locked;
  locked = 0;
  openPage("wallet");
}

function sendGift(amount) {
  if (unlocked >= amount) {
    unlocked -= amount;
    alert("Gift sent: " + amount + " Chuk 🎉");
  } else {
    alert("Saldo tidak cukup ❌");
  }
  openPage("wallet");
}
function exchangeChuk() {
  let rate = 10000; // 1 Pi = 10,000 Chuk

  if (unlocked >= rate) {
    unlocked -= rate;
    alert("Berhasil tukar 10,000 Chuk → 1 Pi 🟡");
  } else {
    alert("Chuk tidak cukup untuk exchange ❌");
  }

  openPage("wallet");
}
function loginPi() {
  alert("Login Pi berhasil (simulasi) ✅");
}

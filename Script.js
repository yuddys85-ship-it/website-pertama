let balance = 1000;

function openPage(page) {
  let content = document.getElementById("content");

  if (page === "home") {
    content.innerHTML = "🏠 Home Page - Welcome back!";
  }

  if (page === "wallet") {
    content.innerHTML = `
      <h3>💰 Wallet</h3>
      <p>Balance: ${balance} Chuk</p>
      <button onclick="earnChuk()">+100 Chuk</button>
      <button onclick="sendChuk()">-50 Chuk</button>
    `;
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
  balance += 100;
  openPage("wallet");
}

function sendChuk() {
  balance -= 50;
  openPage("wallet");
}

function sendGift(amount) {
  balance -= amount;
  alert("Gift sent: " + amount + " Chuk 🎉");
  openPage("wallet");
}

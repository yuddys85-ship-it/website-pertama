function openPage(page) {
  let content = document.getElementById("content");

  if (page === "home") {
    content.innerHTML = "🏠 Home Page - Welcome back!";
  }

  if (page === "wallet") {
    content.innerHTML = "💰 Wallet: 1,000 Chuk (demo)";
  }

  if (page === "live") {
    content.innerHTML = "📡 Live Stream coming soon...";
  }

  if (page === "gift") {
    content.innerHTML = "🎁 Send gifts to creators!";
  }
}

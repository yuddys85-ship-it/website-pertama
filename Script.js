import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

/* =======================
   FIREBASE INIT
======================= */
const firebaseConfig = {
  apiKey: "AIzaSyAVTEmz3KXZ8AUK5bV1eyGYeowZAVawLXA",
  authDomain: "chuk-apk-a8d8a.firebaseapp.com",
  projectId: "chuk-apk-a8d8a",
  storageBucket: "chuk-apk-a8d8a.firebasestorage.app",
  messagingSenderId: "387902539002",
  appId: "1:387902539002:web:b7d4543ef8a2cc2ea3f543"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =======================
   GLOBAL STATE (LEGEND)
======================= */
window.db = db;
window.currentUser = null;

window.state = {
  unlocked: 0,
  locked: 0,
  loading: false,
  lastEarn: 0,
  transactions: [],
  referralCode: ""
};

/* =======================
   UTIL: TRANSACTION
======================= */
function addTransaction(type, amount) {
  window.state.transactions.push({
    type,
    amount,
    time: Date.now()
  });
}

/* =======================
   COOLDOWN SYSTEM
======================= */
function canEarn() {
  return Date.now() - window.state.lastEarn > 5000;
}

/* =======================
   LOAD USER DATA
======================= */
async function loadUserData(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();

    window.state.unlocked = data.unlocked || 0;
    window.state.locked = data.locked || 0;
    window.state.transactions = data.transactions || [];
    window.state.referralCode = data.referralCode || user.uid.slice(0, 6);

    document.getElementById("userName").innerText =
      user.displayName || "User";

    openPage("wallet");
  }
}

/* =======================
   LOGIN SYSTEM
======================= */
window.loginPi = async function () {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    window.currentUser = user;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        name: user.displayName,
        email: user.email,
        unlocked: 500,
        locked: 500,
        referralCode: user.uid.slice(0, 6),
        transactions: []
      });
    }

    loadUserData(user);

  } catch (err) {
    alert("Login gagal ❌");
  }
};

/* =======================
   SAVE DATA
======================= */
async function saveData() {
  if (!window.currentUser) return;

  await setDoc(doc(db, "users", window.currentUser.uid), {
    unlocked: window.state.unlocked,
    locked: window.state.locked,
    transactions: window.state.transactions,
    referralCode: window.state.referralCode
  }, { merge: true });
}

/* =======================
   NAVIGATION SYSTEM
======================= */
window.openPage = function (page) {
  const c = document.getElementById("content");

  if (page === "home") {
    c.innerHTML = `
      <h3>🏠 Home</h3>
      <p>Welcome back ⚡</p>
    `;
  }

  if (page === "wallet") {
    c.innerHTML = `
      <h3>💰 Wallet LEGEND</h3>

      <p>Unlocked: ${window.state.unlocked}</p>
      <p>Locked: ${window.state.locked}</p>

      <button onclick="earnChuk()">+100 Earn</button>
      <button onclick="unlockChuk()">Unlock</button>
      <button onclick="exchangeChuk()">Exchange</button>

      <h4 style="margin-top:15px;">📊 Last Transactions</h4>

      ${window.state.transactions.slice(-5).map(t => `
        <div class="rank">
          <span>${t.type}</span>
          <span>${t.amount}</span>
        </div>
      `).join("")}
    `;
  }

  if (page === "live") {
    c.innerHTML = `
      <h3>📡 Live</h3>
      <p>Coming soon...</p>
    `;
  }

  if (page === "gift") {
    c.innerHTML = `
      <h3>🎁 Gift</h3>
      <button onclick="sendGift(5)">Heart</button>
      <button onclick="sendGift(100)">Star</button>
    `;
  }

  if (page === "leaderboard") {
    c.innerHTML = `
      <h3>🏆 Leaderboard</h3>
      <p>Coming in next update ⚡</p>
    `;
  }
};

/* =======================
   EARN SYSTEM (ANTI SPAM)
======================= */
window.earnChuk = async function () {
  if (!canEarn() || window.state.loading) {
    alert("Tunggu cooldown ⏳");
    return;
  }

  window.state.loading = true;

  window.state.locked += 100;
  window.state.lastEarn = Date.now();

  addTransaction("earn", 100);

  await saveData();

  window.state.loading = false;
  openPage("wallet");
};

/* =======================
   UNLOCK
======================= */
window.unlockChuk = async function () {
  if (window.state.loading) return;

  window.state.loading = true;

  window.state.unlocked += window.state.locked;
  window.state.locked = 0;

  addTransaction("unlock", window.state.unlocked);

  await saveData();

  window.state.loading = false;
  openPage("wallet");
};

/* =======================
   GIFT SYSTEM
======================= */
window.sendGift = async function (amount) {
  if (window.state.unlocked < amount) {
    alert("Saldo tidak cukup ❌");
    return;
  }

  window.state.unlocked -= amount;

  addTransaction("gift", amount);

  await saveData();
  openPage("wallet");
};

/* =======================
   EXCHANGE SYSTEM
======================= */
window.exchangeChuk = async function () {
  const rate = 10000;

  if (window.state.unlocked < rate) {
    alert("Chuk tidak cukup ❌");
    return;
  }

  window.state.unlocked -= rate;

  addTransaction("exchange", rate);

  await saveData();
  openPage("wallet");
};

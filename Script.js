import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  increment
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

window.db = db;
window.currentUser = null;

/* =======================
   STATE
======================= */
window.state = {
  unlocked: 0,
  locked: 0,
  transactions: [],
  lastEarn: 0
};

/* =======================
   AUTH AUTO DETECT
======================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.currentUser = user;
    document.getElementById("userName").innerText = user.displayName;

    listenUserRealtime(user.uid);
    openPage("wallet");
  }
});

/* =======================
   LOGIN
======================= */
window.loginPi = async function () {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

/* =======================
   REALTIME LISTENER (LEGEND CORE)
======================= */
function listenUserRealtime(uid) {
  const ref = doc(db, "users", uid);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    window.state.unlocked = data.unlocked || 0;
    window.state.locked = data.locked || 0;
    window.state.transactions = data.transactions || [];

    if (document.getElementById("content")) {
      openPage("wallet");
    }
  });
}

/* =======================
   SAVE / UPDATE SAFE
======================= */
async function ensureUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      unlocked: 500,
      locked: 500,
      referralCode: uid.slice(0, 6),
      transactions: []
    });
  }
}

/* =======================
   COOLDOWN SYSTEM
======================= */
function canEarn() {
  return Date.now() - window.state.lastEarn > 5000;
}

/* =======================
   TRANSACTION
======================= */
function addTransaction(type, amount) {
  window.state.transactions.push({
    type,
    amount,
    time: Date.now()
  });
}

/* =======================
   ACTIONS (LEGEND FINAL)
======================= */
window.earnChuk = async function () {
  if (!canEarn()) return alert("Cooldown ⏳");

  const uid = window.currentUser.uid;
  await updateDoc(doc(db, "users", uid), {
    locked: increment(100)
  });

  window.state.lastEarn = Date.now();
  addTransaction("earn", 100);
};

window.unlockChuk = async function () {
  const uid = window.currentUser.uid;

  await updateDoc(doc(db, "users", uid), {
    unlocked: increment(window.state.locked),
    locked: 0
  });

  addTransaction("unlock", window.state.locked);
};

window.sendGift = async function (amount) {
  const uid = window.currentUser.uid;

  if (window.state.unlocked < amount)
    return alert("Saldo tidak cukup ❌");

  await updateDoc(doc(db, "users", uid), {
    unlocked: increment(-amount)
  });

  addTransaction("gift", amount);
};

window.exchangeChuk = async function () {
  const rate = 10000;
  const uid = window.currentUser.uid;

  if (window.state.unlocked < rate)
    return alert("Chuk tidak cukup ❌");

  await updateDoc(doc(db, "users", uid), {
    unlocked: increment(-rate)
  });

  addTransaction("exchange", rate);
};

/* =======================
   NAVIGATION
======================= */
window.openPage = function (page) {
  const c = document.getElementById("content");

  if (page === "wallet") {
    c.innerHTML = `
      <h3>💰 LEGEND WALLET</h3>

      <p>Unlocked: ${window.state.unlocked}</p>
      <p>Locked: ${window.state.locked}</p>

      <button onclick="earnChuk()">+100 Earn</button>
      <button onclick="unlockChuk()">Unlock</button>
      <button onclick="exchangeChuk()">Exchange</button>

      <h4 style="margin-top:15px;">📊 Transactions</h4>

      ${window.state.transactions.slice(-5).map(t => `
        <div class="rank">
          <span>${t.type}</span>
          <span>${t.amount}</span>
        </div>
      `).join("")}
    `;
  }

  if (page === "home") {
    c.innerHTML = "<h3>🏠 Home</h3><p>Legend System Active ⚡</p>";
  }

  if (page === "gift") {
    c.innerHTML = `
      <h3>🎁 Gift</h3>
      <button onclick="sendGift(5)">Heart</button>
      <button onclick="sendGift(100)">Star</button>
    `;
  }

  if (page === "live") {
    c.innerHTML = "<h3>📡 Live</h3><p>Coming soon</p>";
  }
};

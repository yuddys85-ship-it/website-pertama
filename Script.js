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
  updateDoc,
  increment,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

/* =======================
   FIREBASE CONFIG
======================= */
const firebaseConfig = {
  apiKey: "AIzaSyAVTEmz3KXZ8AUK5bV1eyGYeowZAVawLXA",
  authDomain: "chuk-apk-a8d8a.firebaseapp.com",
  projectId: "chuk-apk-a8d8a",
  storageBucket: "chuk-apk-a8d8a.firebasestorage.app",
  messagingSenderId: "387902539002",
  appId: "1:387902539002:web:b7d4543ef8a2cc2ea3f543"
};

/* =======================
   INIT FIREBASE
======================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =======================
   GLOBAL STATE
======================= */
window.currentUser = null;
window.db = db;

window.state = {
  unlocked: 0,
  locked: 0
};

/* =======================
   LOGIN GOOGLE
======================= */
window.loginPi = async function () {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    window.currentUser = user;

    document.getElementById("userName").innerText = user.displayName;

    await ensureUser(user.uid);

    listenRealtime(user.uid);

    openPage("wallet");

  } catch (err) {
    alert("Login gagal ❌");
    console.log(err);
  }
};

/* =======================
   AUTO LOGIN DETECT
======================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.currentUser = user;
    document.getElementById("userName").innerText = user.displayName;

    ensureUser(user.uid);
    listenRealtime(user.uid);
    openPage("wallet");
  }
});

/* =======================
   CREATE USER IF NOT EXISTS
======================= */
async function ensureUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      unlocked: 500,
      locked: 500,
      created: Date.now()
    });
  }
}

/* =======================
   REALTIME LISTENER
======================= */
function listenRealtime(uid) {
  const ref = doc(db, "users", uid);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    window.state.unlocked = data.unlocked || 0;
    window.state.locked = data.locked || 0;

    if (document.getElementById("content")) {
      openPage("wallet");
    }
  });
}

/* =======================
   NAVIGATION SYSTEM
======================= */
window.openPage = function (page) {
  const c = document.getElementById("content");

  if (page === "home") {
    c.innerHTML = "<h3>🏠 Home</h3><p>Welcome back!</p>";
  }

  if (page === "wallet") {
    c.innerHTML = `
      <h3>💰 Wallet</h3>

      <p>Unlocked: ${window.state.unlocked}</p>
      <p>Locked: ${window.state.locked}</p>

      <button onclick="earn()">+100 Earn</button>
      <button onclick="unlock()">Unlock</button>
      <button onclick="exchange()">Exchange</button>
    `;
  }

  if (page === "live") {
    c.innerHTML = "<h3>📡 Live</h3><p>Coming soon...</p>";
  }

  if (page === "gift") {
    c.innerHTML = `
      <h3>🎁 Gift</h3>
      <button onclick="gift(5)">Heart</button>
      <button onclick="gift(100)">Star</button>
    `;
  }
};

/* =======================
   ACTIONS
======================= */
window.earn = async function () {
  const uid = window.currentUser.uid;

  await updateDoc(doc(db, "users", uid), {
    locked: increment(100)
  });
};

window.unlock = async function () {
  const uid = window.currentUser.uid;

  await updateDoc(doc(db, "users", uid), {
    unlocked: increment(window.state.locked),
    locked: 0
  });
};

window.gift = async function (amount) {
  const uid = window.currentUser.uid;

  if (window.state.unlocked < amount) {
    return alert("Saldo tidak cukup ❌");
  }

  await updateDoc(doc(db, "users", uid), {
    unlocked: increment(-amount)
  });
};

window.exchange = async function () {
  const rate = 10000;
  const uid = window.currentUser.uid;

  if (window.state.unlocked < rate) {
    return alert("Chuk tidak cukup ❌");
  }

  await updateDoc(doc(db, "users", uid), {
    unlocked: increment(-rate)
  });

  alert("Tukar sukses 🟡");
};

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

/* =========================
   FIREBASE CONFIG
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyAVTEmz3KXZ8AUK5bV1eyGYeowZAVawLXA",
  authDomain: "chuk-apk-a8d8a.firebaseapp.com",
  projectId: "chuk-apk-a8d8a",
  storageBucket: "chuk-apk-a8d8a.firebasestorage.app",
  messagingSenderId: "387902539002",
  appId: "1:387902539002:web:b7d4543ef8a2cc2ea3f543"
};

/* =========================
   INIT FIREBASE
========================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   GLOBAL STATE
========================= */
window.currentUser = null;

let state = {
  unlocked: 0,
  locked: 0
};

/* =========================
   LOGIN GOOGLE
========================= */
window.loginPi = async function () {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    window.currentUser = user;
    document.getElementById("userName").innerText = user.displayName;

    await createUserIfNotExist(user.uid);
    listenUser(user.uid);

    openPage("wallet");

  } catch (err) {
    console.log(err);
    alert("Login gagal ❌");
  }
};

/* =========================
   AUTO LOGIN
========================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.currentUser = user;
    document.getElementById("userName").innerText = user.displayName;

    createUserIfNotExist(user.uid);
    listenUser(user.uid);
  }
});

/* =========================
   CREATE USER
========================= */
async function createUserIfNotExist(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      unlocked: 500,
      locked: 500,
      createdAt: Date.now()
    });
  }
}

/* =========================
   REALTIME LISTENER
========================= */
function listenUser(uid) {
  const ref = doc(db, "users", uid);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    state.unlocked = data.unlocked || 0;
    state.locked = data.locked || 0;

    openPage("wallet");
  });
}

/* =========================
   NAVIGATION
========================= */
window.openPage = function (page) {
  const content = document.getElementById("content");

  if (!content) return;

  if (page === "home") {
    content.innerHTML = "<h3>🏠 Home</h3><p>Welcome back 👋</p>";
  }

  if (page === "wallet") {
    content.innerHTML = `
      <h3>💰 Wallet</h3>

      <p>Unlocked: ${state.unlocked}</p>
      <p>Locked: ${state.locked}</p>

      <button onclick="earn()">+100 Earn</button>
      <button onclick="unlock()">Unlock</button>
      <button onclick="exchange()">Exchange</button>
    `;
  }

  if (page === "live") {
    content.innerHTML = "<h3>📡 Live</h3><p>Coming soon...</p>";
  }

  if (page === "gift") {
    content.innerHTML = `
      <h3>🎁 Gift</h3>
      <button onclick="gift(5)">Heart (5)</button>
      <button onclick="gift(100)">Star (100)</button>
    `;
  }
};

/* =========================
   ACTIONS
========================= */
window.earn = async function () {
  if (!window.currentUser) return;

  await updateDoc(doc(db, "users", window.currentUser.uid), {
    locked: increment(100)
  });
};

window.unlock = async function () {
  if (!window.currentUser) return;

  await updateDoc(doc(db, "users", window.currentUser.uid), {
    unlocked: increment(state.locked),
    locked: 0
  });
};

window.gift = async function (amount) {
  if (!window.currentUser) return;

  if (state.unlocked < amount) {
    return alert("Saldo tidak cukup ❌");
  }

  await updateDoc(doc(db, "users", window.currentUser.uid), {
    unlocked: increment(-amount)
  });
};

window.exchange = async function () {
  if (!window.currentUser) return;

  const rate = 10000;

  if (state.unlocked < rate) {
    return alert("Chuk tidak cukup ❌");
  }

  await updateDoc(doc(db, "users", window.currentUser.uid), {
    unlocked: increment(-rate)
  });

  alert("Tukar berhasil 🟡");
};

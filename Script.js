// =========================
// DEBUG
// =========================
console.log("SCRIPT READY 🚀");

// =========================
// IMPORT FIREBASE
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

// =========================
// FIREBASE CONFIG
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyAVTEmz3KXZ8AUK5bV1eyGYeowZAVawLXA",
  authDomain: "chuk-apk-a8d8a.firebaseapp.com",
  projectId: "chuk-apk-a8d8a",
  storageBucket: "chuk-apk-a8d8a.firebasestorage.app",
  messagingSenderId: "387902539002",
  appId: "1:387902539002:web:b7d4543ef8a2cc2ea3f543"
};

// =========================
// INIT FIREBASE
// =========================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =========================
// GLOBAL STATE
// =========================
window.currentUser = null;

let state = {
  unlocked: 0,
  locked: 0
};

// =========================
// LOGIN UNIVERSAL (HP + PC)
// =========================
window.loginPi = async function () {
  const provider = new GoogleAuthProvider();

  try {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      // HP → redirect (lebih stabil)
      await signInWithRedirect(auth, provider);
    } else {
      // PC → popup
      const result = await signInWithPopup(auth, provider);
      handleLogin(result.user);
    }
  } catch (err) {
    console.log(err);
    alert("Login gagal ❌");
  }
};

// =========================
// HANDLE REDIRECT RESULT (HP)
// =========================
getRedirectResult(auth).then((result) => {
  if (result && result.user) {
    handleLogin(result.user);
  }
});

// =========================
// AUTO LOGIN
// =========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    handleLogin(user);
  }
});

// =========================
// HANDLE LOGIN USER
// =========================
async function handleLogin(user) {
  window.currentUser = user;

  const nameBox = document.getElementById("userName");
  if (nameBox) {
    nameBox.innerText = user.displayName;
  }

  await createUserIfNotExist(user.uid);
  listenUser(user.uid);

  openPage("wallet");
}

// =========================
// CREATE USER
// =========================
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

// =========================
// REALTIME LISTENER
// =========================
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

// =========================
// NAVIGATION
// =========================
window.openPage = function (page) {
  const content = document.getElementById("content");
  if (!content) return;

  if (page === "home") {
    content.innerHTML = "<h3>🏠 Home</h3><p>Welcome back 👋</p>";
  }

  if (page === "wallet") {
    content.innerHTML = `
      <h3>💰 Wallet</h3>

      <p>Unlocked: ${state.unlocked || 0}</p>
      <p>Locked: ${state.locked || 0}</p>

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

// =========================
// ACTIONS
// =========================
window.earn = async function () {
  if (!window.currentUser) return alert("Login dulu ❌");

  await updateDoc(doc(db, "users

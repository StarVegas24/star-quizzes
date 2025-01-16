import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Перевірка рівня доступу користувача
async function checkAccess(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists() && userDoc.data().role === "teacher") {
    document.getElementById("content").style.display = "block";
    loadFolders(uid);
  } else {
    document.getElementById("error").style.display = "block";
  }
}

// Завантаження папок з питаннями
async function loadFolders(uid) {
  const querySnapshot = await getDocs(
    collection(db, "teachers", uid, "folders")
  );
  const foldersContainer = document.getElementById("folders");
  querySnapshot.forEach((doc) => {
    const folder = doc.data();
    const folderElement = document.createElement("div");
    folderElement.className = "folder";
    folderElement.innerHTML = `<a href="folder.html?uid=${uid}&folderId=${doc.id}">${folder.name}</a>`;
    foldersContainer.appendChild(folderElement);
  });
}

// Додавання обробника подій для кнопки додавання тесту
document.getElementById("addTestBtn").addEventListener("click", () => {
  const uid = new URLSearchParams(window.location.search).get("uid");
  window.location.href = `addTest.html?uid=${uid}`;
});

// Отримання uid користувача з URL
const uid = new URLSearchParams(window.location.search).get("uid");
if (uid) {
  checkAccess(uid);
} else {
  document.getElementById("error").style.display = "block";
}

// Функція для виходу користувача
function logout() {
  signOut(auth)
    .then(() => {
      window.location.href = "auth.html"; // Перенаправлення на сторінку входу після виходу
    })
    .catch((error) => {
      console.error("Помилка при виході: ", error);
    });
}

document.getElementById("resultsBtn").addEventListener("click", () => {
  window.location.href = `testResults.html?uid=${uid}`;
});

// Додавання обробника подій для кнопки виходу
document.getElementById("logoutBtn").addEventListener("click", logout);

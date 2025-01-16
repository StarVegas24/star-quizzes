import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
// Додавання обробника подій для кнопки виходу
document.getElementById("logoutBtn").addEventListener("click", logout);

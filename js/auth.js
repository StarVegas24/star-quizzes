import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-lite.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

async function changeRole(user) {
  let role = "";
  do {
    role = prompt("Виберіть свою роль: вчитель (teacher) або учень (student)");
  } while (role !== "teacher" && role !== "student");
  await setDoc(doc(db, "users", user.uid), { role });
}

async function googleSignIn() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await changeRole(user);
    }
    handleUserRedirect(user);
  } catch (error) {
    console.error(error);
  }
}

async function emailSignUp(email, password, role) {
  console.log(`Sign up (email) ${email} ${password} ${role}`);
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // console.log(userCredential);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), { role });
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      handleUserRedirect(user);
    } else {
      console.error("Роль користувача не збережено.");
    }
  } catch (error) {
    console.error(error);
  }
}

async function emailSignIn(email, password) {
  console.log(`Sign in (email) ${email} ${password}`);
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      handleUserRedirect(user);
    } else {
      changeRole(user);
    }
  } catch (error) {
    alert("Ви ввели неправильний логін або пароль");
  }
}

// Функція для перенаправлення користувача на відповідну сторінку
async function handleUserRedirect(user) {
  console.log(`Redirecting user: ${user.uid}`);
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists()) {
    const role = userDoc.data().role;

    if (role === "teacher") {
      window.location.replace(`teacher.html?uid=${user.uid}`);
    } else if (role === "student") {
      window.location.replace(`student.html?uid=${user.uid}`);
    } else {
      alert("Невідома роль користувача.");
      changeRole(user);
      handleUserRedirect(user);
    }
  } else {
    alert("Користувача не знайдено в базі даних.");
  }
}

document
  .getElementById("googleSignInBtn")
  .addEventListener("click", googleSignIn);

document.getElementById("emailSignUpBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.querySelector('input[name="role"]:checked').value;
  // console.log(role);
  emailSignUp(email, password, role);
});

document.getElementById("emailSignInBtn").addEventListener("click", () => {
  const email = document.getElementById("emailLogin").value;
  const password = document.getElementById("passwordLogin").value;
  emailSignIn(email, password);
});

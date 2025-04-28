// Import Firebase modules (Ensure this is in a module context)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvebCBe0pcDMBrIVpDlydvpmz37KYYTJc",
  authDomain: "innohub-51f1e.firebaseapp.com",
  projectId: "innohub-51f1e",
  storageBucket: "innohub-51f1e.appspot.com",
  messagingSenderId: "689639186724",
  appId: "1:689639186724:web:efe973cbd8e2f19ecf93b1",
  measurementId: "G-CXBQCDS758"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");

  // Sidebar toggle
  hamburger?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadUserDetails(user.uid);
      loadUserActivitySummary(user.uid);
    } else {
      window.location.href = "/index.html";
    }
  });
});

// Load user data from Firestore
async function loadUserDetails(uid) {
  try {
    const userDocRef = doc(db, "Users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const role = userData?.role?.trim() || "";
      const currentPath = window.location.pathname;

      // Define expected path for each role
      const rolePaths = {
        "Investor": "/HTML/dashboard/investor.html",
        "Startup/Idea Pitcher": "/HTML/dashboard/startup.html",
        "Learner": "/HTML/dashboard/learner.html"  // Fixed typo here
      };

      const expectedPath = rolePaths[role] || "/HTML/dashboard/startup.html";

      // Normalize paths
      const cleanCurrentPath = currentPath.replace(/\/+$/, "");
      const cleanExpectedPath = expectedPath.replace(/\/+$/, "");

      console.log("Role:", role);
      console.log("Current:", cleanCurrentPath);
      console.log("Expected:", cleanExpectedPath);

      // Force redirect if current path is incorrect
      if (cleanCurrentPath !== cleanExpectedPath) {
        sessionStorage.setItem("redirected", "true");
        window.location.replace(expectedPath);
        return;
      }

      // Clear redirect flag if we're on the correct page
      sessionStorage.removeItem("redirected");

      // Display user info
      const userInfoEl = document.querySelector("#user-info");
      if (userInfoEl) {
        userInfoEl.innerHTML = `
          <h2>Welcome, ${userData.name}</h2>
          <p>Role: <strong>${userData.role}</strong></p>
          <p>Status: <strong>Free</strong></p>
        `;
      }
    } else {
      console.log("No such user document!");
    }
  } catch (error) {
    console.error("Error loading user details:", error);
  }
}

// Load user's idea count summary
async function loadUserActivitySummary(uid) {
  try {
    const ideasRef = collection(db, "ideas");
    const q = query(ideasRef, where("userId", "==", uid));
    const querySnapshot = await getDocs(q);

    const ideasCountEl = document.getElementById("ideas-count");
    if (ideasCountEl) {
      ideasCountEl.textContent = querySnapshot.size;
    }
  } catch (error) {
    console.error("Error loading activity summary:", error);
  }
}

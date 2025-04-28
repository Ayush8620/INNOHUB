// Import Firebase modules (Ensure this is in a module context)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

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

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');

  // Sidebar toggle
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Logout button functionality
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          // Redirect to login page after successful logout
          window.location.href = '/index.html';  // Adjust the URL as per your app's structure
        })
        .catch((error) => {
          console.error("Error signing out: ", error);
        });
    });
  }

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in, load user details
      loadUserDetails(user.uid);
    } else {
      window.location.href = '/index.html';
      console.error("No user is logged in.");
    }
  });
});

// Load user data from Firestore
async function loadUserDetails(uid) {
  const userDocRef = doc(db, "Users", uid); // Reference to the user's document in Firestore
  const userDocSnap = await getDoc(userDocRef); // Fetch the document snapshot

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    document.getElementById('loading-spinner').style.display = 'block';  // Show loading
    document.getElementById('loading-spinner').style.display = 'none';   // Hide loading after data is loaded

    // Display the user data
    document.querySelector("#user-details").innerHTML = `
      <p><strong>1. Full Name:</strong> ${userData.name}</p>
      <p><strong>2. Register as:</strong> ${userData.role}</p>
      <p><strong>3. DOB:</strong> ${userData.dob}</p>
      <p><strong>4. Aadhaar Number:</strong> ${userData.aadhaar}</p>
      <p><strong>5. PAN Number:</strong> ${userData.pan}</p>
      <p><strong>7. LinkedIn Account Link:</strong> <a href="${userData.linkedin}" target="_blank">LinkedIn Profile</a></p>
    `;
  } else {
    console.log("No such user document!");
  }
}
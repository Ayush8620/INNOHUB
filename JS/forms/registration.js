// Import Firebase functions from the SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Your actual Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);

// Check if the user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, allow them to submit an idea
    console.log("User signed in:", user.displayName);
  } else {
    // If the user is not logged in, redirect to login page
    window.location.href = '/HTML/login/login.html';
  }
});

// Handle form submission
const form = document.querySelector('.form-container');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Collect form data
  const formData = {
    name: document.getElementById('name').value,
    role: document.getElementById('role').value,
    dob: document.getElementById('dob').value,
    aadhaar: document.getElementById('aadhaar').value,
    pan: document.getElementById('pan').value,
    linkedin: document.getElementById('linkedin').value,
    portfolio: document.getElementById('portfolio').files[0]?.name || 'No file uploaded'
  };

  // Get the UID of the authenticated user
  const user = auth.currentUser;
  if (user) {
    try {
      // Create a document with the user's UID as the document ID and set the form data
      await setDoc(doc(db, "Users", user.uid), formData);
      alert("Registered successfully! Please log in again.");
      window.location.href = "/HTML/login/login.html";
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Registration failed.");
    }
  }
});

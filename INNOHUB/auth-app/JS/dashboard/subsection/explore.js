import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// Firebase configuration
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

const exploreGrid = document.getElementById("investorGrid");
const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");
const approachModal = document.getElementById("approachModal");
const closeModal = document.getElementById("closeModal");
const sendRequestBtn = document.getElementById("sendRequestBtn");

// Modal handling for opening and closing
function openModal() {
  approachModal.style.display = "flex";
}

closeModal.addEventListener("click", () => {
  approachModal.style.display = "none";
});

// Sidebar toggle
hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// Fetch Investors from Firestore
async function fetchInvestors() {
  const usersRef = collection(db, "Users");
  const q = query(usersRef, where("role", "==", "Investor"));
  const snapshot = await getDocs(q);

  exploreGrid.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "explore-card";
    card.innerHTML = `
      <h4>${data.name || "Unnamed Investor"}</h4>
      <p><strong>LinkedIn:</strong> <a href="${data.linkedin}" target="_blank">${data.linkedin}</a></p>
      <p><strong>DOB:</strong> ${data.dob || "N/A"}</p>
      <p><strong>Portfolio:</strong> ${data.portfolio || "Not uploaded"}</p>
      <button class="approach-btn">Approach</button>
    `;
    exploreGrid.appendChild(card);

    // Add event listener for the "Approach" button to open modal
    const approachBtn = card.querySelector(".approach-btn");
    approachBtn.addEventListener("click", () => {
      openModal();
      const investorId = doc.id;

      // Set up send request button click to send a request with the default message
      sendRequestBtn.onclick = () => sendRequest(investorId);
    });
  });
}

// Send request to the investor
async function sendRequest(investorId) {
  // Default request message
  const requestText = "You have received a new investment request from a pitcher.";

  // Get the logged-in user's UID
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  if (!userId) {
    alert("You must be logged in to send a request.");
    return;
  }

  try {
    // Send request data to Firestore
    await addDoc(collection(db, "Request-from-pitcherId"), {
      InvestorId: investorId,
      message: requestText, // Using the default message
      timestamp: serverTimestamp(),
      PitcherId: userId, // Using logged-in user's UID
      Status: "Pending"
    });

    // Send notification to the investor
    await addDoc(collection(db, 'notifications'), {
      toUserId: investorId, // Investor to be notified
      fromUserId: userId, // Pitcher who sent the request
      type: 'request', // Type of notification
      message: 'You have received a new investment request from a pitcher.',
      timestamp: serverTimestamp(),
      seen: false // Notification initially unread
    });

    alert("Request sent successfully!");
    approachModal.style.display = "none"; // Close the modal
  } catch (error) {
    console.error("Error sending request: ", error);
    alert("Failed to send the request. Please try again.");
  }
}

// Call the fetchInvestors function to load the data on page load
fetchInvestors();

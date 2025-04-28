import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvebCBe0pcDMBrIVpDlydvpmz37KYYTJc",
  authDomain: "innohub-51f1e.firebaseapp.com",
  projectId: "innohub-51f1e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let ideasContainer, viewModal, closeViewModal, sendRequestBtn, sidebar, hamburger;
let currentUserId = null;
let currentIdeaId = null;
let currentPitcherId = null;

document.addEventListener('DOMContentLoaded', () => {
  ideasContainer = document.getElementById('ideasContainer');
  viewModal = document.getElementById('viewModal');
  closeViewModal = document.getElementById('closeViewModal');
  sendRequestBtn = document.getElementById('sendRequestBtn');
  sidebar = document.getElementById('sidebar');
  hamburger = document.getElementById('hamburger');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  if (closeViewModal) {
    closeViewModal.addEventListener('click', () => {
      viewModal.style.display = 'none';
    });
  }

  if (sendRequestBtn) {
    sendRequestBtn.addEventListener('click', async () => {
      if (!currentUserId || !currentPitcherId || !currentIdeaId) return;

      const alreadyRequested = await hasAlreadyRequested(currentUserId, currentPitcherId, currentIdeaId);
      if (alreadyRequested) {
        alert("You have already sent a request for this idea.");
        return;
      }

      await addDoc(collection(db, 'Request-from-InvestorId'), {
        InvestorId: currentUserId,
        PitcherId: currentPitcherId,
        ideaId: currentIdeaId,
        timestamp: serverTimestamp(),
        Status: "Pending"
      });

      await addDoc(collection(db, 'notifications'), {
        toUserId: currentPitcherId,
        fromUserId: currentUserId,
        ideaId: currentIdeaId,
        type: 'request',
        message: 'You have received a new investment request on your idea.',
        timestamp: serverTimestamp(),
        seen: false
      });

      alert("Request sent!");
      sendRequestBtn.textContent = "Request Sent";
      sendRequestBtn.disabled = true;

      if (viewModal) {
        viewModal.style.display = 'none';
      }
    });
  }

  // Auth & load ideas
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '/HTML/login/login.html';
    } else {
      currentUserId = user.uid;
      await loadIdeas();
    }
  });
});

// Check if user already sent a request
async function hasAlreadyRequested(investorId, pitcherId, ideaId) {
  const q = query(
    collection(db, 'Request-from-InvestorId'),
    where('InvestorId', '==', investorId),
    where('PitcherId', '==', pitcherId),
    where('ideaId', '==', ideaId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Load and display ideas with user names
async function loadIdeas() {
  const ideasSnapshot = await getDocs(collection(db, 'ideas'));
  const usersSnapshot = await getDocs(collection(db, 'Users'));

  const userMap = {};
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    userMap[doc.id] = data.name || "Unknown User";
  });

  let ideas = [];
  ideasSnapshot.forEach(doc => {
    const data = doc.data();
    ideas.push({ id: doc.id, ...data, userName: userMap[data.userId] || "Unknown User" });
  });

  ideas.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  if (ideasContainer) {
    ideasContainer.innerHTML = '';
    ideas.forEach(idea => renderIdeaCard(idea));
  }
}

// Render idea card
function renderIdeaCard(idea) {
  const card = document.createElement('div');
  card.className = 'explore-card';
  card.setAttribute('data-id', idea.id);

  card.innerHTML = `
    <h4>${idea.idea_name}</h4>
    <p>${idea.description}</p>
    <p><strong>Category:</strong> ${idea.category}</p>
    <p><strong>Pitcher:</strong> ${idea.userName}</p>
    <p><strong>Votes:</strong> ${idea.voteCount || 0}</p>
    <button class="vote-btn">Vote</button>
    <button class="view-btn">View Pitch</button>
  `;

  const voteBtn = card.querySelector('.vote-btn');
  const viewBtn = card.querySelector('.view-btn');

  if (voteBtn) {
    voteBtn.addEventListener('click', () => handleVote(idea.id));
  }

  if (viewBtn) {
    viewBtn.addEventListener('click', () => openModal(idea));
  }

  if (ideasContainer) {
    ideasContainer.appendChild(card);
  }

  checkIfVoted(idea.id, voteBtn);
}

// Check if user already voted
async function checkIfVoted(ideaId, button) {
  const q = query(collection(db, 'votes'), where('userId', '==', currentUserId), where('ideaId', '==', ideaId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty && button) {
    button.textContent = "Voted";
    button.disabled = true;
  }
}

// Handle voting
async function handleVote(ideaId) {
  const ideaRef = doc(db, 'ideas', ideaId);

  await addDoc(collection(db, 'votes'), {
    userId: currentUserId,
    ideaId: ideaId,
    timestamp: serverTimestamp()
  });

  await updateDoc(ideaRef, {
    voteCount: increment(1)
  });

  await loadIdeas();
}

// Open idea details modal and check request status
async function openModal(idea) {
  currentIdeaId = idea.id;
  currentPitcherId = idea.userId;

  const viewIdeaDetails = document.getElementById('viewIdeaDetails');
  if (viewIdeaDetails) {
    viewIdeaDetails.innerHTML = `
      <p><strong>Idea Name:</strong> ${idea.idea_name}</p>
      <p><strong>Description:</strong> ${idea.description}</p>
      <p><strong>Category:</strong> ${idea.category}</p>
      <p><strong>Pitcher:</strong> ${idea.userName}</p>
    `;
  }

  if (sendRequestBtn) {
    const alreadyRequested = await hasAlreadyRequested(currentUserId, currentPitcherId, currentIdeaId);
    if (alreadyRequested) {
      sendRequestBtn.textContent = "Request Sent";
      sendRequestBtn.disabled = true;
    } else {
      sendRequestBtn.textContent = "Send Request";
      sendRequestBtn.disabled = false;
    }
  }

  if (viewModal) {
    viewModal.style.display = 'flex';
  }
}

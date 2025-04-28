import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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
const auth = getAuth();

// Listen for auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.uid);
    fetchContacts(user.uid);

    const storedContactId = localStorage.getItem("selectedContactId");
    if (storedContactId) {
      openChat(storedContactId);
      highlightSelectedContact(storedContactId);
    } else {
      showNoContactMessage();
    }
  } else {
    console.log("No user is logged in.");
  }
});

// Show default message
const showNoContactMessage = () => {
  const chatHeader = document.getElementById("chat-header");
  const chatMessages = document.getElementById("chat-messages");

  chatHeader.textContent = "No Contact Selected";
  chatMessages.innerHTML = `
    <div style="text-align:center; padding: 2rem; color: #777;">
      👈 Select a contact to start chatting.
    </div>
  `;
};

// Fetch chat contacts
const fetchContacts = async (userUID) => {
  const contactsList = document.getElementById("chat-list");
  const q = query(collection(db, "Request-from-InvestorId"), where("Status", "==", "Accepted"));
  const addedContacts = new Set();

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;

    querySnapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      const contactId = data.PitcherId === userUID ? data.InvestorId : data.PitcherId;

      if (addedContacts.has(contactId)) return;
      addedContacts.add(contactId);

      const userDoc = await getDoc(doc(db, "Users", contactId));
      if (userDoc.exists()) {
        const contactName = userDoc.data().name;
        const contactItem = document.createElement("li");
        contactItem.textContent = contactName;
        contactItem.setAttribute("data-id", contactId);

        contactItem.addEventListener("click", () => {
          openChat(contactId, contactName);
          localStorage.setItem("selectedContactId", contactId);
          highlightSelectedContact(contactId);
        });

        contactsList.appendChild(contactItem);
      }
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
};

// Highlight selected contact
const highlightSelectedContact = (contactId) => {
  const items = document.querySelectorAll("#chat-list li");
  items.forEach((item) => {
    item.classList.remove("selected-contact");
    if (item.getAttribute("data-id") === contactId) {
      item.classList.add("selected-contact");
    }
  });
};

// Store unsubscribe functions
let unsubscribeOutgoing = null;
let unsubscribeIncoming = null;

// Open chat and fetch both incoming and outgoing messages in real-time
const openChat = async (contactId, contactName = "") => {
  if (contactName) {
    document.getElementById("chat-header").textContent = contactName;
  }

  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = ""; // Clear existing messages

  const userUID = auth.currentUser.uid;
  const userChatRef = collection(db, "Chats", userUID, "messages");
  const contactChatRef = collection(db, "Chats", contactId, "messages");

  // Remove old listeners if any
  if (unsubscribeOutgoing) unsubscribeOutgoing();
  if (unsubscribeIncoming) unsubscribeIncoming();

  const allMessages = [];

  const renderMessages = () => {
    chatMessages.innerHTML = "";
    allMessages.sort((a, b) => a.timestamp - b.timestamp);

    allMessages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add(message.type === "incoming" ? "incoming" : "outgoing");
      messageDiv.textContent = message.message;
      chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  unsubscribeOutgoing = onSnapshot(
    query(userChatRef, where("to", "==", contactId)),
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          allMessages.push({
            ...data,
            type: "outgoing",
            timestamp: data.timestamp?.toDate?.() || new Date(),
          });
        }
      });
      renderMessages();
    }
  );

  unsubscribeIncoming = onSnapshot(
    query(contactChatRef, where("to", "==", userUID)),
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (!allMessages.find((msg) =>
            msg.timestamp?.getTime() === data.timestamp?.toDate?.().getTime() &&
            msg.message === data.message
          )) {
            allMessages.push({
              ...data,
              type: "incoming",
              timestamp: data.timestamp?.toDate?.() || new Date(),
            });
          }
        }
      });
      renderMessages();
    }
  );

  highlightSelectedContact(contactId);
};

// Send a message
const sendMessage = async () => {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();
  const contactId = localStorage.getItem("selectedContactId");
  const userUID = auth.currentUser.uid;

  if (!message || !contactId || !userUID) return;

  const chatRef = collection(db, "Chats", userUID, "messages");

  try {
    const timestamp = new Date();
    await setDoc(doc(chatRef, `${timestamp.getTime()}`), {
      message,
      from: userUID,
      to: contactId,
      type: "outgoing",
      timestamp
    });

    // Removed duplicate manual append — real-time listener will handle it
    messageInput.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

document.getElementById("send-btn").addEventListener("click", sendMessage);

// Sidebar toggle
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

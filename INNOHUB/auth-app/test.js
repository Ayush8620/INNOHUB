// Fetch notifications for the logged-in user
const q = query(collection(db, 'notifications'), where('toUserId', '==', user.uid), orderBy('timestamp', 'desc'));
const querySnapshot = await getDocs(q);

querySnapshot.forEach((doc) => {
  const data = doc.data();
  // Show `data.message` in your notifications UI
});

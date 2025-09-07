let userComplaints = [];

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    db.collection("complaints")
      .where("userId", "==", user.uid)
      .orderBy("timestamp", "desc")
      .onSnapshot(snapshot => {
        userComplaints = [];
        snapshot.forEach(doc => userComplaints.push(doc.data()));
        applyFilters();
      });
  }
});

function submitComplaint(e) {
  e.preventDefault();
  const text = document.getElementById("complaintText").value;
  const file = document.getElementById("complaintImage").files[0];

  if (file) {
    const ref = storage.ref("complaints/" + Date.now() + "_" + file.name);
    ref.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => saveComplaint(text, url));
    });
  } else {
    saveComplaint(text, null);
  }
}

function saveComplaint(text, imageUrl) {
  const user = auth.currentUser;
  db.collection("complaints").add({
    userId: user.uid,
    user: user.email,
    text: text,
    image: imageUrl,
    status: "Pending",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("Complaint submitted!");
    document.getElementById("complaintText").value = "";
    document.getElementById("complaintImage").value = "";
  });
}

function applyFilters() {
  const search = document.getElementById("searchBox").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const tbody = document.querySelector("#complaintsTable tbody");
  tbody.innerHTML = "";

  userComplaints
    .filter(c => (status === "All" || c.status === status))
    .filter(c => c.text.toLowerCase().includes(search))
    .forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.text}</td>
        <td>${c.image ? `<img src="${c.image}">` : "No Image"}</td>
        <td>${c.timestamp ? c.timestamp.toDate().toLocaleString() : "Pending..."}</td>
        <td>${c.status || "Pending"}</td>`;
      tbody.appendChild(row);
    });
}

function logout() { auth.signOut().then(() => window.location.href = "index.html"); }

let allComplaints = [];

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else if (user.email !== "admin@city.com") {
    alert("Access Denied!");
    window.location.href = "dashboard.html";
  } else {
    db.collection("complaints").orderBy("timestamp", "desc").onSnapshot(snapshot => {
      allComplaints = [];
      snapshot.forEach(doc => allComplaints.push({ id: doc.id, ...doc.data() }));
      applyFilters();
    });
  }
});

function applyFilters() {
  const search = document.getElementById("searchBox").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const tbody = document.querySelector("#complaintsTable tbody");
  tbody.innerHTML = "";

  allComplaints
    .filter(c => (status === "All" || c.status === status))
    .filter(c => c.text.toLowerCase().includes(search))
    .forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.user || "Unknown"}</td>
        <td>${c.text}</td>
        <td>${c.image ? `<img src="${c.image}">` : "No Image"}</td>
        <td>${c.timestamp ? c.timestamp.toDate().toLocaleString() : "Pending..."}</td>
        <td>${c.status || "Pending"}</td>
        <td>
          <button onclick="resolveComplaint('${c.id}')">✔ Resolve</button>
          <button onclick="deleteComplaint('${c.id}')">🗑 Delete</button>
        </td>`;
      tbody.appendChild(row);
    });
}

function resolveComplaint(id) {
  db.collection("complaints").doc(id).update({ status: "Resolved" });
}
function deleteComplaint(id) {
  db.collection("complaints").doc(id).delete();
}
function logout() { auth.signOut().then(() => window.location.href = "index.html"); }

// Export Excel
function exportToExcel() {
  const worksheetData = allComplaints.map(c => ({
    User: c.user || "Unknown",
    Description: c.text,
    Status: c.status || "Pending",
    Submitted_At: c.timestamp ? c.timestamp.toDate().toLocaleString() : "Pending..."
  }));
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, worksheet, "Complaints");
  XLSX.writeFile(wb, "complaints_report.xlsx");
}

// Export PDF
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Complaint Report", 14, 15);
  const tableData = allComplaints.map(c => [
    c.user || "Unknown",
    c.text,
    c.status || "Pending",
    c.timestamp ? c.timestamp.toDate().toLocaleString() : "Pending..."
  ]);
  doc.autoTable({
    head: [["User", "Description", "Status", "Submitted At"]],
    body: tableData,
    startY: 25,
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [22, 160, 133] }
  });
  doc.save("complaints_report.pdf");
}

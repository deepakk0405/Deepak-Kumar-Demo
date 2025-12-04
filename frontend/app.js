document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('attendance-form');
  const list = document.getElementById('attendance-list');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('studentName').value;
    if (!name) return;

    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    loadAttendance();
    form.reset();
  });

  async function loadAttendance() {
    list.innerHTML = '';
    const res = await fetch('/api/attendance');
    const data = await res.json();

    data.forEach((student) => {
      const li = document.createElement('li');
      li.textContent = `${student.name} - ${student.date} [${student.type || "manual"}]`;
      list.appendChild(li);
    });
  }

  loadAttendance();

  // Face Recognition Attendance
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captureBtn = document.getElementById('capture');

  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { video.srcObject = stream; });
  }

  captureBtn.addEventListener('click', async () => {
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    const studentName = prompt("Enter student name for attendance:");
    if (!studentName) return;

    const res = await fetch('/api/face-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: studentName, image: imageData })
    });

    const data = await res.json();
    if (data.success) {
      alert("Attendance marked!");
    } else {
      alert(`Attendance failed: ${data.error}`);
    }

    loadAttendance();
  });

  // QR Generation
  document.getElementById('genQR').addEventListener('click', async () => {
    const name = document.getElementById('qrStudentName').value;
    if (!name) return;

    const res = await fetch(`/api/generate-qr?name=${encodeURIComponent(name)}`);
    const data = await res.json();

    document.getElementById('qr').innerHTML =
      `<img src="${data.qrUrl}" alt="QR Code for ${name}" />`;
  });
});

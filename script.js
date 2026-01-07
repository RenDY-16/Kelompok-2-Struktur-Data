/* ------------------------- Struktur Data ------------------------- */
// Kelas Node untuk struktur data Double Linked List
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

// Kelas Double Linked List untuk menyimpan data secara berantai
class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  append(data) {
    const node = new Node(data);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.length++;
    return node;
  }
  toArray() {
    const arr = [];
    let curr = this.head;
    while (curr) {
      arr.push(curr);
      curr = curr.next;
    }
    return arr;
  }
  findById(id) {
    let curr = this.head;
    while (curr) {
      if (curr.data.id === id) return curr;
      curr = curr.next;
    }
    return null;
  }
  remove(node) {
    if (!node) return;
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    this.length--;
  }
}

// Kelas Queue untuk menampung antrian
class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) {
    this.items.push(item);
  }
  dequeue() {
    return this.items.shift();
  }
  isEmpty() {
    return this.items.length === 0;
  }
  clear() {
    this.items = [];
  }
  toArray() {
    return this.items.slice();
  }
}

// Inisialisasi struktur data
const daftarTugas = new DoublyLinkedList();       // Menyimpan semua tugas
const daftarCatatan = new DoublyLinkedList();     // Menyimpan semua catatan
const antrianDeadline = new Queue();              // Menyimpan tugas yang mendekati deadline

// ---------------------- Persistensi Data (localStorage) ----------------------
// Fungsi untuk menyimpan data tugas, catatan, dan penghitung ID ke localStorage
function simpanData() {
  try {
    // konversi isi linked list menjadi array data mentah
    const tugasArr = daftarTugas.toArray().map(node => node.data);
    const catatanArr = daftarCatatan.toArray().map(node => node.data);
    // simpan array dan penghitung ke localStorage sebagai string JSON
    localStorage.setItem('daftarTugas', JSON.stringify(tugasArr));
    localStorage.setItem('daftarCatatan', JSON.stringify(catatanArr));
    localStorage.setItem('penghitungTugas', penghitungTugas.toString());
    localStorage.setItem('penghitungCatatan', penghitungCatatan.toString());
  } catch (e) {
    console.error('Gagal menyimpan data ke localStorage:', e);
  }
}

// Fungsi untuk memuat data dari localStorage dan merekonstruksi struktur data
function muatData() {
  try {
    // baca dan parse array tugas dan catatan
    const savedTasks = localStorage.getItem('daftarTugas');
    const savedNotes = localStorage.getItem('daftarCatatan');
    if (savedTasks) {
      const tasksArray = JSON.parse(savedTasks);
      tasksArray.forEach(item => {
        // setiap item sudah berupa objek tugas lengkap (id, name, desc, deadline, status)
        daftarTugas.append(item);
      });
    }
    if (savedNotes) {
      const notesArray = JSON.parse(savedNotes);
      notesArray.forEach(item => {
        // setiap item sudah berupa objek catatan (id, title, content)
        daftarCatatan.append(item);
      });
    }
    // Pulihkan penghitung jika tersedia, jika tidak gunakan id terbesar + 1
    const savedPenghitungTugas = localStorage.getItem('penghitungTugas');
    if (savedPenghitungTugas !== null) {
      penghitungTugas = parseInt(savedPenghitungTugas, 10);
    } else {
      const arr = daftarTugas.toArray();
      if (arr.length > 0) {
        const maxId = Math.max(...arr.map(n => n.data.id));
        penghitungTugas = maxId + 1;
      }
    }
    const savedPenghitungCatatan = localStorage.getItem('penghitungCatatan');
    if (savedPenghitungCatatan !== null) {
      penghitungCatatan = parseInt(savedPenghitungCatatan, 10);
    } else {
      const arr = daftarCatatan.toArray();
      if (arr.length > 0) {
        const maxId = Math.max(...arr.map(n => n.data.id));
        penghitungCatatan = maxId + 1;
      }
    }
  } catch (e) {
    console.error('Gagal memuat data dari localStorage:', e);
  }
}

// ---------------------- Penghapusan Tugas Selesai ----------------------
// Fungsi untuk menghapus semua tugas yang statusnya menandakan sudah selesai.
// Status yang dianggap selesai adalah "Telah dikerjakan" atau "Selesai".
function hapusTugasSelesai() {
  let current = daftarTugas.head;
  while (current) {
    // simpan referensi ke node berikutnya sebelum ada kemungkinan perubahan
    const nextNode = current.next;
    const status = current.data.status;
    if (status === 'Telah dikerjakan' || status === 'Selesai') {
      // hapus node dari linked list
      daftarTugas.remove(current);
    }
    current = nextNode;
  }
}

// Variabel untuk simpul yang sedang dipilih
let simpulTugasDipilih = null;
let simpulCatatanDipilih = null;

/* ------------------------- Fungsi Navigasi Halaman ------------------------- */
// Menampilkan halaman berdasarkan ID dan menyembunyikan yang lainnya
function tampilkanHalaman(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

/* ------------------------- Fungsi Tugas ------------------------- */
// Penghitung ID untuk tugas
let penghitungTugas = 1;

// Menambahkan tugas baru ke daftarTugas
function tambahTugas(nama, deskripsi, batasWaktu) {
  const tugas = {
    id: penghitungTugas++,
    name: nama,
    desc: deskripsi,
    deadline: batasWaktu,
    status: 'Belum dikerjakan'
  };
  daftarTugas.append(tugas);
  perbaruiAntrianDeadline();
  // simpan perubahan ke localStorage setelah menambah tugas
  simpanData();
}

const nomorWhatsApp = '+6287770693898';
// Mengirim notifikasi melalui WhatsApp ketika deadline mendekati
function kirimNotifikasiWhatsApp(tugas) {
  const pesan = encodeURIComponent(`Pengingat: Tugas "${tugas.name}" akan segera berakhir pada ${tugas.deadline}.`);
  // Membuka tab/jendela WhatsApp baru dengan pesan yang sudah terisi.
  const url = `https://wa.me/${nomorWhatsApp}?text=${pesan}`;
  // buka WhatsApp di tab baru dengan pesan yang sudah terisi
  window.open(url, '_blank');
}

function perbaruiAntrianDeadline() {
  antrianDeadline.clear();
  const hariIni = new Date();
  const segera = new Date();
  segera.setDate(hariIni.getDate() + 3); 
  daftarTugas.toArray().forEach(node => {
    const d = new Date(node.data.deadline);
    if (node.data.deadline) {
      if (d >= hariIni && d <= segera) {
        antrianDeadline.enqueue(node.data);
        const selisih = (d - hariIni) / (1000 * 60 * 60 * 24);
        if (selisih <= 1) {
          kirimNotifikasiWhatsApp(node.data);
        }
      }
    }
  });
  tampilkanAntrianDeadline();
}

// Menampilkan antrian deadline pada dashboard
function tampilkanAntrianDeadline() {
  const container = document.getElementById('queueTasks');
  const listDiv = document.getElementById('queueList');
  const items = antrianDeadline.toArray();
  if (items.length > 0) {
    container.style.display = 'block';
    listDiv.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'queue-item';
      div.textContent = `${item.name} — Deadline: ${item.deadline}`;
      listDiv.appendChild(div);
    });
  } else {
    container.style.display = 'none';
  }
}

// Menampilkan tabel status tugas
function tampilkanTabelStatus() {
  const tbody = document.getElementById('statusTable').querySelector('tbody');
  tbody.innerHTML = '';
  daftarTugas.toArray().forEach(node => {
    const tr = document.createElement('tr');
    tr.dataset.id = node.data.id;
    tr.innerHTML = `<td>${node.data.id}</td><td>${node.data.name}</td><td>${node.data.deadline || '-'}</td><td>${node.data.status}</td><td>${node.data.desc || '-'}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('statusButtons').style.display = 'none';
  simpulTugasDipilih = null;
}

// Menampilkan tabel deadline tugas
function tampilkanTabelDeadline() {
  const tbody = document.getElementById('deadlineTable').querySelector('tbody');
  tbody.innerHTML = '';
  daftarTugas.toArray().forEach(node => {
    const tr = document.createElement('tr');
    tr.dataset.id = node.data.id;
    tr.innerHTML = `<td>${node.data.id}</td><td>${node.data.name}</td><td>${node.data.deadline || '-'}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('deadlineForm').style.display = 'none';
  simpulTugasDipilih = null;
}

// Penghitung ID untuk catatan
let penghitungCatatan = 1;

// Menambahkan catatan baru ke daftarCatatan
function tambahCatatan(judul, isi) {
  const catatan = {
    id: penghitungCatatan++,
    title: judul,
    content: isi
  };
  daftarCatatan.append(catatan);
}

// Menampilkan tabel catatan untuk diedit
function tampilkanTabelEditCatatan() {
  const tbody = document.getElementById('editCatatanTable').querySelector('tbody');
  tbody.innerHTML = '';
  daftarCatatan.toArray().forEach(node => {
    const tr = document.createElement('tr');
    tr.dataset.id = node.data.id;
    tr.innerHTML = `<td>${node.data.id}</td><td>${node.data.title}</td>`;
    tbody.appendChild(tr);
  });
}

// Menampilkan tabel catatan untuk dilihat
function tampilkanTabelLihatCatatan() {
  const tbody = document.getElementById('lihatCatatanTable').querySelector('tbody');
  tbody.innerHTML = '';
  daftarCatatan.toArray().forEach(node => {
    const tr = document.createElement('tr');
    tr.dataset.id = node.data.id;
    tr.innerHTML = `<td>${node.data.id}</td><td>${node.data.title}</td>`;
    tbody.appendChild(tr);
  });
}

// Navigasi dari dashboard ke manajemen dan catatan
document.getElementById('toManajemen').addEventListener('click', () => {
  tampilkanHalaman('manajemenMenu');
});
document.getElementById('toCatatan').addEventListener('click', () => {
  tampilkanHalaman('catatanMenu');
});

// Navigasi melalui tautan di navbar
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-go');
    if (target) {
      // Jika menavigasi ke halaman manajemen atau catatan, kita tidak perlu memuat ulang daftar
      if (target === 'dashboard') {
        tampilkanHalaman('dashboard');
      } else if (target === 'manajemenMenu') {
        tampilkanHalaman('manajemenMenu');
      } else if (target === 'catatanMenu') {
        tampilkanHalaman('catatanMenu');
      }
    }
  });
});

// Tombol kembali menggunakan atribut data-back
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-back');
    tampilkanHalaman(target);
    if (target === 'dashboard') {
      simpulTugasDipilih = null;
      simpulCatatanDipilih = null;
    }
  });
});

// Navigasi menu manajemen tugas
document.getElementById('toInputTugas').addEventListener('click', () => {
  tampilkanHalaman('inputTugasPage');
});
document.getElementById('toStatusTugas').addEventListener('click', () => {
  tampilkanTabelStatus();
  tampilkanHalaman('statusTugasPage');
});
document.getElementById('toDeadlineTugas').addEventListener('click', () => {
  tampilkanTabelDeadline();
  tampilkanHalaman('deadlineTugasPage');
});

// Navigasi menu catatan
document.getElementById('toInputCatatan').addEventListener('click', () => {
  tampilkanHalaman('inputCatatanPage');
});
document.getElementById('toEditCatatan').addEventListener('click', () => {
  tampilkanTabelEditCatatan();
  tampilkanHalaman('editCatatanSelectPage');
});
document.getElementById('toLihatCatatan').addEventListener('click', () => {
  tampilkanTabelLihatCatatan();
  tampilkanHalaman('lihatCatatanPage');
});

// Tambah tugas baru
document.getElementById('submitTask').addEventListener('click', () => {
  const nama = document.getElementById('taskName').value.trim();
  const deskripsi = document.getElementById('taskDesc').value.trim();
  const batasWaktu = document.getElementById('taskDeadline').value;
  const alertBox = document.getElementById('taskAlert');
  if (!nama) {
    alertBox.textContent = 'Nama tugas tidak boleh kosong.';
    alertBox.style.display = 'block';
    return;
  }
  alertBox.style.display = 'none';
  tambahTugas(nama, deskripsi, batasWaktu);
  document.getElementById('taskName').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskDeadline').value = '';
  alert('Tugas berhasil ditambahkan');
});

// Klik baris pada tabel status
document.getElementById('statusTable').addEventListener('click', (e) => {
  const baris = e.target.closest('tr');
  if (!baris || !baris.dataset.id) return;
  const id = parseInt(baris.dataset.id);
  simpulTugasDipilih = daftarTugas.findById(id);
  document.querySelectorAll('#statusTable tbody tr').forEach(r => r.style.backgroundColor = '#d1d1d1');
  baris.style.backgroundColor = '#b8e6ff';
  document.getElementById('statusButtons').style.display = 'flex';
});

// Ubah status tugas melalui tombol status
document.getElementById('statusButtons').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn || !simpulTugasDipilih) return;
  const status = btn.getAttribute('data-status');
  // perbarui status pada simpul terpilih
  simpulTugasDipilih.data.status = status;
  // Jika status menandakan tugas telah selesai, hapus tugas dari daftar
  if (status === 'Telah dikerjakan' || status === 'Selesai') {
    // hapus semua tugas yang selesai
    hapusTugasSelesai();
    // reset simpul terpilih karena bisa jadi sudah terhapus
    simpulTugasDipilih = null;
    // perbarui antrian deadline dan tampilan tabel
    perbaruiAntrianDeadline();
    tampilkanTabelStatus();
    alert('Tugas selesai dihapus');
  } else {
    // jika tidak selesai, cukup tampilkan tabel yang diperbarui
    tampilkanTabelStatus();
    alert('Status tugas diperbarui');
  }
  // simpan perubahan (baik status maupun penghapusan) ke localStorage
  simpanData();
});

// Klik baris pada tabel deadline
document.getElementById('deadlineTable').addEventListener('click', (e) => {
  const baris = e.target.closest('tr');
  if (!baris || !baris.dataset.id) return;
  const id = parseInt(baris.dataset.id);
  simpulTugasDipilih = daftarTugas.findById(id);
  document.querySelectorAll('#deadlineTable tbody tr').forEach(r => r.style.backgroundColor = '#d1d1d1');
  baris.style.backgroundColor = '#b8e6ff';
  document.getElementById('deadlineForm').style.display = 'block';
});

// Perbarui deadline tugas
document.getElementById('updateDeadline').addEventListener('click', () => {
  if (!simpulTugasDipilih) return;
  const batasBaru = document.getElementById('newDeadline').value;
  if (!batasBaru) {
    document.getElementById('deadlineAlert').textContent = 'Masukkan tanggal deadline.';
    document.getElementById('deadlineAlert').style.display = 'block';
    return;
  }
  document.getElementById('deadlineAlert').style.display = 'none';
  simpulTugasDipilih.data.deadline = batasBaru;
  perbaruiAntrianDeadline();
  tampilkanTabelDeadline();
  alert('Deadline tugas diperbarui');
  // simpan perubahan deadline ke localStorage
  simpanData();
});

// Simpan catatan baru
document.getElementById('saveNote').addEventListener('click', () => {
  const judul = document.getElementById('noteTitle').value.trim();
  const isi = document.getElementById('noteContent').value.trim();
  const alertBox = document.getElementById('noteAlert');
  if (!judul) {
    alertBox.textContent = 'Judul catatan tidak boleh kosong.';
    alertBox.style.display = 'block';
    return;
  }
  alertBox.style.display = 'none';
  tambahCatatan(judul, isi);
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContent').value = '';
  alert('Catatan berhasil ditambahkan');
  // simpan perubahan catatan ke localStorage
  simpanData();
});

// Klik baris pada tabel edit catatan
document.getElementById('editCatatanTable').addEventListener('click', (e) => {
  const baris = e.target.closest('tr');
  if (!baris || !baris.dataset.id) return;
  const id = parseInt(baris.dataset.id);
  simpulCatatanDipilih = daftarCatatan.findById(id);
  document.getElementById('editNoteTitle').value = simpulCatatanDipilih.data.title;
  document.getElementById('editNoteContent').value = simpulCatatanDipilih.data.content;
  tampilkanHalaman('editCatatanFormPage');
});

// Perbarui catatan
document.getElementById('updateNote').addEventListener('click', () => {
  if (!simpulCatatanDipilih) return;
  const judul = document.getElementById('editNoteTitle').value.trim();
  const isi = document.getElementById('editNoteContent').value.trim();
  if (!judul) {
    alert('Judul catatan tidak boleh kosong.');
    return;
  }
  simpulCatatanDipilih.data.title = judul;
  simpulCatatanDipilih.data.content = isi;
  alert('Catatan diperbarui');
  // simpan perubahan catatan ke localStorage
  simpanData();
  tampilkanTabelEditCatatan();
  tampilkanHalaman('editCatatanSelectPage');
});

// Klik baris pada tabel lihat catatan
document.getElementById('lihatCatatanTable').addEventListener('click', (e) => {
  const baris = e.target.closest('tr');
  if (!baris || !baris.dataset.id) return;
  const id = parseInt(baris.dataset.id);
  const node = daftarCatatan.findById(id);
  document.getElementById('detailJudul').textContent = node.data.title;
  document.getElementById('detailIsi').textContent = node.data.content || '(kosong)';
  tampilkanHalaman('noteDetailPage');
});

// Inisialisasi antrian deadline setelah konten dimuat
document.addEventListener('DOMContentLoaded', () => {
  // Muat data dari localStorage jika tersedia
  muatData();
  // Hapus tugas yang sudah selesai (status "Telah dikerjakan" atau "Selesai") setelah data dimuat
  // sehingga tugas yang telah selesai dari sesi sebelumnya tidak muncul lagi.
  hapusTugasSelesai();
  // Simpan ulang data untuk menyinkronkan perubahan penghapusan dengan localStorage
  simpanData();
  // Perbarui antrian deadline berdasarkan data yang tersisa
  perbaruiAntrianDeadline();
});

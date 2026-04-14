/**
 * main.js — Logika Utama Form SSSD
 * Mengatur: Upload Foto, Koleksi Data, Modal Konfirmasi, dan Pemanggilan PDF
 */

document.addEventListener('DOMContentLoaded', () => {
  
    // ─── 1. REFERENSI ELEMEN ──────────────────────────────────────────
    const form          = document.getElementById('form-sssd');
    const fileInput     = document.getElementById('pasfoto');
    const previewImg    = document.getElementById('pasfoto-preview');
    const placeholder   = document.getElementById('upload-placeholder');
    
    // Tombol-tombol
    const btnPreview    = document.getElementById('btn-test-pdf'); // Tombol Cek Preview

    // Stepper / Pills
    const pill1 = document.getElementById('pill-1');
    const pill2 = document.getElementById('pill-2');
    const pill3 = document.getElementById('pill-3');

    // State Data
    let lastData = null;
    let lastNomor = null;
    window.fotoBase64 = ""; // Variabel global untuk menyimpan string gambar

    // ─── 2. LOGIKA UPLOAD FOTO ────────────────────────────────────────
    // Di dalam main.js pada bagian Event Listener fileInput.change
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;

            // --- VALIDASI FORMAT JPG ---
            // MIME Type untuk jpg/jpeg adalah image/jpeg
            const allowedTypes = ['image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                alert("Format file salah! Harap unggah foto dalam format JPG atau JPEG.");
                this.value = ""; // Reset input file
                if (previewImg) previewImg.classList.add('hidden'); // Sembunyikan preview lama
                if (placeholder) placeholder.style.display = 'block';
                return;
            }

            // --- VALIDASI UKURAN (Sudah ada sebelumnya) ---
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran foto terlalu besar! Maksimal 2MB.");
                this.value = "";
                return;
            }

            // Jika lolos semua validasi, baru jalankan FileReader
            const reader = new FileReader();
            reader.onload = (e) => {
                window.fotoBase64 = e.target.result;
                if (previewImg) {
                    previewImg.src = e.target.result;
                    previewImg.classList.remove('hidden');
                }
                if (placeholder) placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    }

    // ─── 3. FUNGSI KOLEKSI DATA ───────────────────────────────────────
    function collectFormData() {
        const fd = new FormData(form);
        const data = {};
        
        // Ambil semua entri dari FormData
        fd.forEach((value, key) => {
            data[key] = value;
        });

        // Tambahkan foto dari variabel global
        data.foto = window.fotoBase64;

        // Default value jika kosong agar PDF tidak berantakan
        data.nama_lengkap = data.nama_lengkap || 'NAMA LENGKAP';
        data.nik = data.nik || '0000000000000000';
        data.alamat = data.alamat || 'ALAMAT LENGKAP';
        
        return data;
    }

    function generateNomor() {
        return `SSSD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }


    // ─── 5. EVENT LISTENERS (TOMBOL) ──────────────────────────────────

    // A. Tombol Preview (Hanya generate PDF ke iframe, tanpa simpan)
    // Di dalam main.js
    if (btnPreview) {
        btnPreview.addEventListener('click', (e) => {
            // 1. Mencegah form ter-submit secara default
            e.preventDefault(); 

            // 2. CEK VALIDASI
            // Jika form.checkValidity() bernilai FALSE (berarti ada yang kosong)
                if (!form.checkValidity()) {
                        form.reportValidity(); 
                        return; // Berhenti jika belum lengkap
                    }

            // 3. JALANKAN PREVIEW (Hanya jika lolos validasi di atas)
            const data = collectFormData();
            const nomor = "PREVIEW-" + Date.now();
            
            console.log("Validasi berhasil, memproses PDF...");
            
            if (typeof generatePDF === 'function') {
                generatePDF(data, nomor, { preview: true });
                
                // Tampilkan preview dan scroll ke sana
                const previewFrame = document.getElementById('pdf-preview');
                if (previewFrame) {
                    previewFrame.classList.remove('hidden');
                    previewFrame.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
  });
/**
 * pdf.js — generate surat pernyataan 1 halaman A4 via jsPDF
 * Dipanggil dari main.js setelah data dikonfirmasi
 */

function generatePDF(data, nomorFormulir, options = {}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 215, H = 330;
  const ML = 18, MR = W - 18, CW = MR - ML;

  // ── helpers ──────────────────────────────────────────────
  const txt = (x, y, str, size = 11, style = 'normal', align = 'left') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const opts = align !== 'left' ? { align } : {};
    doc.text(String(str ?? ''), x, y, opts);
  };

  const hline = (y, x1 = ML, x2 = MR, lw = 0.3, r = 0, g = 0, b = 0) => {
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(lw);
    doc.line(x1, y, x2, y);
  };

  const rect = (x, y, w, h, fillR, fillG, fillB, strokeR = 200, strokeG = 200, strokeB = 210, lw = 0.3) => {
    doc.setFillColor(fillR, fillG, fillB);
    doc.setDrawColor(strokeR, strokeG, strokeB);
    doc.setLineWidth(lw);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  };

  const fieldLine = (x, y, w, label, value = '') => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 110);
    doc.text(label, x, y);
    hline(y + 5.5, x, x + w, 0.3, 180, 180, 190);
    if (value) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(value, x, y + 4.5);
    }
  };

  // ── reset color ──
  const black = () => doc.setTextColor(17, 24, 39);
  const muted = () => doc.setTextColor(107, 114, 128);

  // ══════════════════════════════════════════════════════════
  // KOP SURAT
  // ══════════════════════════════════════════════════════════
  let y = 20;

  // logo kiri
  doc.addImage('./assets/logo-desa.png', 'PNG', ML, y - 12, 19, 23);

  // teks kop
  black();
  txt(W / 2, y - 4, 'PEMERINTAH KABUPATEN BOGOR', 12, 'bold', 'center');
  txt(W / 2, y - 0, 'KECAMATAN PAMIJAHAN', 12, 'bold', 'center');
  txt(W / 2, y + 5, 'DESA GUNUNGMENYAN', 16, 'bold', 'center');
  muted();
  txt(W / 2, y + 9, 'Jl. Kananga No.1 RT.001/004 Desa Gunungmenyan, Kecamatan Pamijahan, Kabupaten Bogor', 8.5, 'normal', 'center');

  y += 12;
  hline(y + 1, ML, MR, 0.3, 0, 0, 0);
  hline(y, ML, MR, 0.8, 0, 0, 0);

  // ══════════════════════════════════════════════════════════
  // JUDUL
  // ══════════════════════════════════════════════════════════
  y += 9;
  black();
  txt(W / 2, y, 'SURAT PERNYATAAN CALON PESERTA', 12, 'bold', 'center');
  muted();
  txt(W / 2, y + 5, 'Program Strategis Satu Sarjana Satu Desa — Kabupaten Bogor 2025–2029', 8.5, 'normal', 'center');

  y += 11;
  hline(y, ML, MR, 0.3, 200, 200, 210);

  // ── Nomor formulir ──
  y += 6;
  muted();
  txt(ML, y, `Nomor Formulir:`, 8);
  black();
  txt(ML + 28, y, nomorFormulir, 8, 'bold');
  muted();
  txt(MR, y, `Tanggal: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 8, 'normal', 'right');

  // ══════════════════════════════════════════════════════════
  // BOX DATA DIRI
  // ══════════════════════════════════════════════════════════
  const ROW_H    = 12;
  const HEADER_H = 10;
  const PAD_B    = 0;

  const dataDiriFields = [
    { label: 'Nama Lengkap',          value: data.nama_lengkap },
    { label: 'NIK / No. KK',          value: `${data.nik} / ${data.no_kk}` },
    { label: 'Tempat, Tanggal Lahir', value: `${data.tempat_lahir}, ${formatDate(data.tanggal_lahir)}` },
    { label: 'Jenis Kelamin / Agama', value: `${data.jenis_kelamin} / ${data.agama}` },
  ];

  const boxH = HEADER_H + (dataDiriFields.length * ROW_H) + PAD_B;

  // 1. Rect dulu
  rect(ML, y+5, CW, boxH+20, 247, 250, 252, 197, 210, 225);

  // 2. Header badge
  doc.setFillColor(26, 58, 107);
  doc.roundedRect(ML, y+2, 30, 5.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.text('DATA DIRI PESERTA', ML + 2, y + 5.5);

  // 3. Foto (di kanan)
  if (data.foto) {
    doc.addImage(data.foto, 'JPEG', MR - 40, y + 8, 30, 40);
  }

  // 4. FieldLine belakangan
  const startY = y + HEADER_H + 3;
  dataDiriFields.forEach((field, i) => {
    fieldLine(ML+2, startY + (i * ROW_H), CW - 60, field.label, field.value);
  });


  y += boxH * 0.95;

  // Box baru khusus Alamat (perlu ruang lebih)
  const ay = y + 8;
  fieldLine(ML + 2,           ay, (CW / 2) * 0.9 - 4, 'Alamat Lengkap', data.alamat);
  fieldLine(ML + 2 + CW/2*0.9,    ay, 10,           'RT',              data.rt);
  fieldLine(ML + 2 + CW/2*0.9 + 22, ay, 10,           'RW',              data.rw);
  fieldLine(ML + 2,           ay + 12, CW / 6,  'Dusun',           data.dusun || '—');
  fieldLine(ML + 2 + CW/6+3,  ay + 12, CW / 4 - 1,  'Telepon',         data.telepon);
  fieldLine(ML + 2 + (CW/2), ay + 12, CW / 2 - 4, 'Email',     data.email || '—');

  y += 30;

// ══════════════════════════════════════════════════════════
// BOX PRODI & PT
// ══════════════════════════════════════════════════════════
rect(ML, y+3, CW, 28, 247, 250, 252, 197, 210, 225);
doc.setFillColor(26, 58, 107);
doc.roundedRect(ML, y, 54, 5.5, 1, 1, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
doc.text('PILIHAN PRODI & PERGURUAN TINGGI', ML + 2, y + 3.8);

const py = y + 10;
const hw = (CW - 6) / 2;
fieldLine(ML + 2, py, hw, 'Program Studi', data.prodi);
fieldLine(ML + 2 + hw + 6, py, hw - 4, 'Perguruan Tinggi', data.perguruan_tinggi);
fieldLine(ML + 2, py + 13, CW - 4, 'Alasan Pemilihan Prodi', data.alasan_prodi || '—');

y += 33;

// ══════════════════════════════════════════════════════════
// BOX PENDIDIKAN TERAKHIR
// ══════════════════════════════════════════════════════════
rect(ML, y+3, CW, 28, 247, 250, 252, 197, 210, 225);
doc.setFillColor(26, 58, 107);
doc.roundedRect(ML, y, 38, 5.5, 1, 1, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
doc.text('PENDIDIKAN TERAKHIR', ML + 2, y + 3.8);

const ey = y + 10;
const hw2 = (CW - 6) / 2;
fieldLine(ML + 2,          ey,      hw2, 'Jenjang / Jurusan', `${data.jenjang} / ${data.jurusan}`);
fieldLine(ML + 2 + hw2 + 6, ey,     hw2 - 4, 'Nama Sekolah',  data.nama_sekolah);
fieldLine(ML + 2,          ey + 13, hw2, 'Kota Sekolah',      data.kota_sekolah);
fieldLine(ML + 2 + hw2 + 6, ey + 13, 30, 'Tahun Lulus',       data.tahun_lulus);
fieldLine(ML + 2 + hw2 + 40, ey + 13, hw2 - 38, 'No. Ijazah', data.no_ijazah || '—');

y += 33;

// BOX ORANG TUA / WALI
rect(ML, y+3, CW, 42, 247, 250, 252, 197, 210, 225);
doc.setFillColor(26, 58, 107);
doc.roundedRect(ML, y, 38, 5.5, 1, 1, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
doc.text('DATA ORANG TUA / WALI', ML + 2, y + 3.8);

const oy = y + 10;
const hw3 = (CW - 6) / 2;
fieldLine(ML + 2, oy, hw3, 'Nama Ayah / Wali', data.nama_ayah);
fieldLine(ML + 2 + hw3 + 6, oy, hw3 - 4, 'Pekerjaan Ayah / Wali', data.pekerjaan_ayah);
fieldLine(ML + 2, oy + 13, hw3, 'Nama Ibu', data.nama_ibu);
fieldLine(ML + 2 + hw3 + 6, oy + 13, hw3 - 4, 'Pekerjaan Ibu', data.pekerjaan_ibu);
fieldLine(ML + 2, oy + 26, CW / 2 - 4, 'Penghasilan Keluarga / Bulan', data.penghasilan);
fieldLine(ML + 2 + CW / 2 + 2, oy + 26, CW / 2 - 6, 'Jumlah Tanggungan', data.jml_tanggungan);

y += 30;  

// Pemisah Halaman
doc.addPage();
y = 20;


// ══════════════════════════════════════════════════════════
// SURAT PERNYATAAN
// ══════════════════════════════════════════════════════════
rect(ML, y+2, CW, 98, 247, 250, 252, 197, 210, 225);

doc.setFillColor(26, 58, 107);
doc.roundedRect(ML, y, 32, 5.5, 1, 1, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
doc.text('SURAT PERNYATAAN', ML + 2, y + 3.8);

y += 10;
black();
doc.setFontSize(9.5); doc.setFont('helvetica', 'normal');
doc.text('Yang bertanda tangan di bawah ini:', ML + 2, y);
y += 6;

const kv = (label, val) => {
  muted();
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(label, ML + 4, y);
  doc.text(':', ML + 30, y);
  black();
  doc.setFont('helvetica', 'bold');
  doc.text(val, ML + 33, y);
  y += 5;
};
kv('Nama', data.nama_lengkap);
kv('NIK', data.nik);
kv('Alamat', `${data.alamat}, RT ${data.rt}/RW ${data.rw}, Desa Gunungmenyan`);
kv('Program Studi', `${data.prodi} – ${data.perguruan_tinggi}`);

y += 2;
black();
doc.setFontSize(9.5); doc.setFont('helvetica', 'normal');
doc.text('Dengan ini menyatakan bersedia dan sanggup untuk:', ML + 2, y);
y += 5;

const items = [
  'Menempuh perkuliahan sesuai masa studi yang ditentukan perguruan tinggi.',
  'Mengembalikan seluruh biaya pendidikan kepada Pemerintah Desa apabila tidak dapat\nmenyelesaikan studi, mengundurkan diri, atau melampaui batas waktu studi.',
  'Mengabdi kepada Desa Gunungmenyan selama 2 (dua) kali masa studi setelah lulus.',
  'Mengganti biaya pendidikan apabila tidak melaksanakan kewajiban pengabdian.',
  'Menanggung biaya-biaya di luar yang ditetapkan oleh Pemerintah Desa.',
  'Menandatangani perjanjian kesepakatan dengan Pemerintah Desa dan perguruan tinggi.',
  'Menaati seluruh tata tertib dan peraturan yang berlaku.',
];

doc.setFontSize(10); doc.setFont('helvetica', 'normal');
items.forEach((item, i) => {
  const lines = item.split('\n');
  black();
  doc.text(`${i + 1}.`, ML + 4, y);
  lines.forEach((line, li) => {
    doc.text(line, ML + 9, y + li * 4.5);
  });
  y += lines.length > 1 ? 10 : 7;
});

y += 2;
muted();
doc.setFontSize(8); doc.setFont('helvetica', 'italic');
doc.text('Pernyataan ini dibuat dengan sadar, tanpa paksaan dari pihak manapun.', ML + 2, y);

y += 10; // extra margin sebelum tanda tangan

// ══════════════════════════════════════════════════════════
// KOLOM TANDA TANGAN — 4 box
// ══════════════════════════════════════════════════════════
const bw = (CW - 12) / 4;
const bh = 42;
const boxes = [
  { title: 'Hormat Saya', sub: 'Calon Peserta', x: ML },
  { title: 'Mengetahui', sub: 'Orang Tua / Wali', x: ML + bw + 4 },
  { title: 'Mengetahui', sub: 'Ketua RT', x: ML + 2 * (bw + 4) },
  { title: 'Mengetahui', sub: 'Ketua RW', x: ML + 3 * (bw + 4) },
];

boxes.forEach(b => {
  rect(b.x, y, bw, bh, 255, 255, 255, 197, 210, 225, 0.4);
  black();
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.text(b.title, b.x + bw / 2, y + 5, { align: 'center' });
  muted();
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text(b.sub, b.x + bw / 2, y + 9, { align: 'center' });

  // signature line
  hline(y + bh - 8, b.x + 3, b.x + bw - 3, 0.4, 150, 150, 160);
  muted();
  doc.setFontSize(6.5);
  doc.text('Nama & Tanda Tangan', b.x + bw / 2, y + bh - 4.5, { align: 'center' });
});

y += bh + 6;
// ══════════════════════════════════════════════════════════
// CHECKLIST LAMPIRAN BERKAS
// ══════════════════════════════════════════════════════════

rect(ML, y, CW, 22, 247, 250, 252, 197, 210, 225);
doc.setFillColor(26, 58, 107);
doc.roundedRect(ML, y - 3, 34, 5.5, 1, 1, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
doc.text('CHECKLIST LAMPIRAN', ML + 2, y + 0.8);

const cy = y + 7;
const attachments = [
  'Fotokopi KTP',
  'Fotokopi KK',
  'Fotokopi Ijazah Terakhir'
];

doc.setFontSize(9);
black();
attachments.forEach((item, i) => {
  // checkbox
  doc.setDrawColor(100, 100, 110);
  doc.setLineWidth(0.3);
  doc.rect(ML + 2, cy + (i * 5.5) - 2, 3, 3);
  // label
  doc.setFont('helvetica', 'normal');
  doc.text(item, ML + 8, cy + (i * 5.5));
});

y += 34;

// ══════════════════════════════════════════════════════════
// FOOTER HALAMAN
// ══════════════════════════════════════════════════════════
hline(y, ML, MR, 0.3, 200, 200, 210);
y += 4;
muted();
doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
doc.text('Juknis Bantuan Keuangan Desa – Program Satu Sarjana Satu Desa, Kabupaten Bogor 2025–2029', W / 2, y, { align: 'center' });
doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, MR, y, { align: 'right' });

// ── save / preview ──
  const safeName = (data.nama_lengkap || 'dokumen').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  
if (options.preview) {
    // Mode Preview: Tampilkan di iframe (desktop)
    const pdfData = doc.output('datauristring');
    const iframe = document.getElementById('pdf-preview');
    if (iframe) {
        iframe.src = pdfData;
        iframe.classList.remove('hidden');
    }
} else if (options.blob) {
    // Mode Mobile: Return blob untuk dibuka di tab baru
    return doc.output('blob');
} else {
    // Mode Final: Langsung Download
    doc.save(`Formulir_SSSD_${safeName}.pdf`);
}

// ── util ──────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}
}
"use client"

import React, { useState, useEffect } from 'react';
import { CartItem } from "@/hooks/useCart";
import { CustomerInfo } from "@/hooks/useCustomer";

/* Print Styles */
const printStyles = `
.print-only {
  display: none;
}

@media print {
  /* Sembunyikan semua elemen kecuali receipt-container */
  body * {
    visibility: hidden;
  }
  .receipt-container, .receipt-container * {
    visibility: visible;
  }
  
  /* Reset margin dan padding */
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    font-size: 14px !important;
  }
  
  /* Container utama untuk print */
  .receipt-container {
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    padding: 0;
    margin: 0;
    font-size: 14px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  /* Layout halaman print */
  .receipt-page-vertical {
    display: block !important;
    width: 100% !important;
  }
  
  /* Setiap receipt-section menjadi halaman A4 penuh */
  .receipt-section {
    width: 210mm !important;
    height: 296mm !important;
    min-height: 296mm !important;
    max-height: 296mm !important;
    margin: 0 !important;
    padding: 15mm !important;
    box-sizing: border-box;
    page-break-after: always !important;
    page-break-inside: avoid !important;
    break-after: page !important;
    position: relative;
    font-family: 'Courier New', monospace !important;
    font-size: 14px !important;
    overflow: hidden !important;
  }
  
  /* Hilangkan page-break setelah section terakhir */
  .receipt-section:last-of-type {
    page-break-after: auto !important;
  }
  
  /* Sembunyikan elemen yang tidak perlu */
  .print-controls,
  .horizontal-cut-line,
  header,
  footer,
  nav,
  aside {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* Pastikan gambar terlihat */
  .logo-image {
    visibility: visible !important;
    display: inline-block !important;
    opacity: 1 !important;
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  }

  /* Aturan halaman - Harus di luar @media print */
  @page {
    size: A4 portrait;
    margin: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

/* Layout untuk screen */
.receipt-container {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  width: 100%;
  background: white;
}

.receipt-page-vertical {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

@media screen {
  .receipt-page-vertical {
    max-width: 210mm;
    margin: 20px auto;
    padding: 20px;
    background: #f5f5f5;
  }
}

/* Receipt Section Styles */
.receipt-section {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 15mm;
  border: 1px solid #ddd;
  background: white;
  box-sizing: border-box;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Logo Styles */
.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.logo-image {
  height: 60px;
  width: auto;
  max-width: 100%;
}

.logo-placeholder {
  height: 60px;
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #333;
  background: #f0f0f0;
  font-size: 14px;
  color: #333;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.dealership-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.dealership-subtitle {
  font-size: 12px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

/* Header Layout */
.header-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 15px;
}

.header-info {
  text-align: right;
  font-size: 13px;
  line-height: 1.4;
  font-family: 'Courier New', monospace;
}

.receipt-title {
  font-weight: bold;
  font-size: 20px;
  margin: 15px 0;
  text-align: center;
  font-family: 'Courier New', monospace;
  text-decoration: underline;
}

.receipt-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin: 15px 0;
  padding: 8px 0;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  font-family: 'Courier New', monospace;
}

.copy-label {
  font-style: italic;
  font-size: 14px;
  font-weight: bold;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

/* Customer & Vehicle Info Grid */
.customer-vehicle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.info-section {
  margin-bottom: 0;
}

.section-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #000;
  padding-bottom: 4px;
  font-family: 'Courier New', monospace;
}

/* Data Pelanggan Styles */
.data-pelanggan {
  font-size: 13px;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
}

.data-pelanggan .info-row {
  display: flex;
  margin-bottom: 4px;
}

.data-pelanggan .info-label {
  font-weight: bold;
  min-width: 70px;
}

/* Data Kendaraan Styles */
.data-kendaraan {
  font-size: 13px;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
}

.data-kendaraan .info-row {
  display: flex;
  margin-bottom: 4px;
}

.data-kendaraan .info-label {
  font-weight: bold;
  min-width: 100px;
}

/* Payment Info Styles */
.payment-info {
  margin-top: 10px;
  padding: 8px;
  background-color: #f8f8f8;
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.payment-info .payment-label {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 13px;
}

.payment-info .payment-value {
  font-weight: bold;
  font-size: 14px;
  color: #000;
}

/* Table Styles */
.table-section {
  margin-bottom: 15px;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
  font-family: 'Courier New', monospace;
  line-height: 1.3;
}

.receipt-table th,
.receipt-table td {
  border: 1px solid #000;
  padding: 4px 8px;
  text-align: left;
  word-wrap: break-word;
  line-height: 1.3;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  vertical-align: middle;
}

.receipt-table th {
  font-weight: bold;
  background-color: #f0f0f0;
  font-size: 13px;
  padding: 6px 8px;
  font-family: 'Courier New', monospace;
  text-align: center;
}

.receipt-table .text-center {
  text-align: center;
}

.receipt-table .text-right {
  text-align: right;
}

.receipt-table .item-name {
  font-size: 12px;
  line-height: 1.3;
  font-family: 'Courier New', monospace;
}

.receipt-table .price-cell {
  font-size: 13px;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.subtotal-row td {
  font-weight: bold;
  background-color: #f0f0f0;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

/* Totals Section */
.totals-section {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #000;
  background-color: #f9f9f9;
}

.totals-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 3px 0;
  font-family: 'Courier New', monospace;
}

.total-row.grand-total {
  font-weight: bold;
  font-size: 15px;
  border-top: 2px solid #000;
  padding-top: 8px;
  margin-top: 8px;
  font-family: 'Courier New', monospace;
}

.terbilang-section {
  margin-top: 10px;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  font-size: 13px;
  line-height: 1.4;
  font-family: 'Courier New', monospace;
}

.terbilang-label {
  font-weight: bold;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  margin-right: 5px;
}

.terbilang-text {
  font-style: italic;
  font-weight: 500;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

/* Keterangan Section */
.keterangan-section {
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #000;
  font-size: 13px;
  line-height: 1.4;
  min-height: 60px;
  background-color: #f9f9f9;
  font-family: 'Courier New', monospace;
}

.keterangan-label {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.keterangan-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

/* Signature Section */
.signature-section {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  padding: 20px 0;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  font-family: 'Courier New', monospace;
}

.signature-box {
  text-align: center;
  width: 150px;
}

.signature-line {
  border-bottom: 1px solid #000;
  height: 40px;
  margin-bottom: 8px;
}

.signature-label {
  font-size: 13px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

/* Footer */
.receipt-footer {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 2px solid #000;
  font-size: 12px;
  line-height: 1.4;
  font-family: 'Courier New', monospace;
}

/* Horizontal Cut Line untuk preview screen */
.horizontal-cut-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  width: 100%;
  border-top: 3px dashed #999;
  border-bottom: 3px dashed #999;
  margin: 30px 0;
  background-color: #f8f8f8;
}

.cut-label {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

/* Print Controls */
.print-controls {
  text-align: center;
  margin: 20px auto;
  padding: 20px;
  max-width: 210mm;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 2px solid #ddd;
  font-family: 'Courier New', monospace;
}

@media print {
  .print-controls {
    display: none;
  }
}

.print-button {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin: 0 10px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  transition: background 0.3s;
}

.print-button:hover {
  background: #1a252f;
}
`;

// Fungsi untuk mengkonversi angka menjadi terbilang dalam bahasa Indonesia
function terbilang(angka: number): string {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh",
    "Sebelas"
  ];

  // Konversi angka menjadi integer (bulat)
  const angkaBulat = Math.floor(angka);

  if (angkaBulat < 12) {
    return bilangan[angkaBulat];
  } else if (angkaBulat < 20) {
    return terbilang(angkaBulat - 10) + " Belas";
  } else if (angkaBulat < 100) {
    const puluhan = Math.floor(angkaBulat / 10);
    const sisa = angkaBulat % 10;
    return terbilang(puluhan) + " Puluh" + (sisa > 0 ? " " + terbilang(sisa) : "");
  } else if (angkaBulat < 200) {
    return "Seratus" + (angkaBulat - 100 > 0 ? " " + terbilang(angkaBulat - 100) : "");
  } else if (angkaBulat < 1000) {
    const ratusan = Math.floor(angkaBulat / 100);
    const sisa = angkaBulat % 100;
    return terbilang(ratusan) + " Ratus" + (sisa > 0 ? " " + terbilang(sisa) : "");
  } else if (angkaBulat < 2000) {
    return "Seribu" + (angkaBulat - 1000 > 0 ? " " + terbilang(angkaBulat - 1000) : "");
  } else if (angkaBulat < 1000000) {
    const ribuan = Math.floor(angkaBulat / 1000);
    const sisa = angkaBulat % 1000;
    return terbilang(ribuan) + " Ribu" + (sisa > 0 ? " " + terbilang(sisa) : "");
  } else if (angkaBulat < 1000000000) {
    const jutaan = Math.floor(angkaBulat / 1000000);
    const sisa = angkaBulat % 1000000;
    return terbilang(jutaan) + " Juta" + (sisa > 0 ? " " + terbilang(sisa) : "");
  } else if (angkaBulat < 1000000000000) {
    const milyaran = Math.floor(angkaBulat / 1000000000);
    const sisa = angkaBulat % 1000000000;
    return terbilang(milyaran) + " Milyar" + (sisa > 0 ? " " + terbilang(sisa) : "");
  }

  return "Angka Terlalu Besar";
}

// Komponen ReceiptSection
interface PrintReceiptProps {
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  biayaLain: number;
  total: number;
  keterangan?: string;
  paymentTypeName?: string;
  bankName?: string;
  cardNumber?: string;
  mechanics?: any[];
}

interface ReceiptData {
  nomor: string;
  tanggal: string;
  namaPelanggan: string;
  telpPelanggan: string;
  noPolisi: string;
  merkType: string;
  kilometer: string;
  mekanik?: string;
  serviceItems: Array<{
    no: number;
    nama: string;
    qty: string;
    harga_satuan: string;
    diskon: string;
    harga_netto: string;
  }>;
  parts: Array<{
    no: number;
    nama: string;
    qty: string;
    harga_satuan: string;
    diskon: string;
    harga_netto: string;
  }>;
  subtotalJasa: string;
  subtotalParts: string;
  dpp: string;
  biayaLain: string;
  grandTotal: string;
  grandTotalNumber: number;
  terbilang: string;
  keterangan?: string;
  paymentTypeName?: string;
  bankName?: string;
  cardNumber?: string;
}

const ReceiptSection = ({ data, label }: { data: ReceiptData; label: string }) => {
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');
  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = logoSrc;
    img.onload = () => console.log('Logo loaded successfully');
    img.onerror = () => {
      console.log('Logo failed to load, using fallback');
      setLogoError(true);
    };
  }, [logoSrc]);

  return (
    <div className="receipt-section">
      {/* Header dengan logo dan alamat */}
      <div className="header-content">
        <div className="logo-section">
          {!logoError ? (
            <img
              src={logoSrc}
              alt="Sunda Service Logo"
              className="logo-image"
              onError={() => setLogoError(true)}
              crossOrigin="anonymous"
              loading="eager"
            />
          ) : (
            <div className="logo-placeholder">
              SUNDA SERVIS
            </div>
          )}
          <div className="logo-text">
            <div className="dealership-name">SUNDA SERVIS</div>
            <div className="dealership-subtitle">Automotive Service & Maintenance</div>
          </div>
        </div>

        <div className="header-info">
          <div style={{ fontWeight: 'bold' }}>Jln Panjunan No.112</div>
          <div>Cirebon</div>
          <div>Telp: 0813-7000-368</div>
        </div>
      </div>

      {/* Judul dan Metadata */}
      <div className="receipt-title">NOTA</div>
      <div className="receipt-meta">
        <div><strong>Nomor:</strong> {data.nomor}</div>
        <div><strong>Tanggal:</strong> {data.tanggal}</div>
        <div className="copy-label">{label}</div>
      </div>

      {/* Grid Data Pelanggan dan Kendaraan */}
      <div className="customer-vehicle-grid">
        {/* Data Pelanggan */}
        <div className="info-section">
          <div className="section-title">Data Pelanggan</div>
          <div className="data-pelanggan">
            <div className="info-row">
              <span className="info-label">Nama:</span>
              <span>{data.namaPelanggan}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Telp:</span>
              <span>{data.telpPelanggan}</span>
            </div>
          </div>
        </div>

        {/* Data Kendaraan - Hanya nama kendaraan dan tipe bayar */}
        <div className="info-section">
          <div className="section-title">Data Kendaraan</div>
          <div className="data-kendaraan">
            <div className="info-row">
              <span className="info-label">Kendaraan:</span>
              <span>{data.merkType}</span>
            </div>
            {/* Payment Info - tampilkan di bagian kendaraan */}
            {data.paymentTypeName && (
              <div className="payment-info">
                <div className="payment-label">TIPE PEMBAYARAN:</div>
                <div className="payment-value">
                  {data.paymentTypeName.toUpperCase()}
                  {data.bankName ? ` - ${data.bankName}` : ''}
                  {data.cardNumber ? ` (${data.cardNumber})` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Items */}
      {data.serviceItems.length > 0 && (
        <div className="table-section">
          <div className="section-title">Jenis / Item Pekerjaan</div>
          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No</th>
                <th>Nama Pekerjaan</th>
                <th style={{ width: '50px' }}>Qty</th>
                <th style={{ width: '110px' }}>Harga Satuan</th>
                <th style={{ width: '80px' }}>Diskon</th>
                <th style={{ width: '110px' }}>Harga Netto</th>
              </tr>
            </thead>
            <tbody>
              {data.serviceItems.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{item.no}</td>
                  <td className="item-name">{item.nama}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right price-cell">{item.harga_satuan}</td>
                  <td className="text-right">{item.diskon}</td>
                  <td className="text-right price-cell">{item.harga_netto}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="subtotal-row">
                <td colSpan={5} className="text-right"><strong>Subtotal Jasa:</strong></td>
                <td className="text-right"><strong>{data.subtotalJasa}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Parts */}
      {data.parts.length > 0 && (
        <div className="table-section">
          <div className="section-title">Pengadaan Suku Cadang & Material</div>
          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No</th>
                <th>Nama Suku Cadang</th>
                <th style={{ width: '50px' }}>Qty</th>
                <th style={{ width: '110px' }}>Harga Satuan</th>
                <th style={{ width: '80px' }}>Diskon</th>
                <th style={{ width: '110px' }}>Harga Netto</th>
              </tr>
            </thead>
            <tbody>
              {data.parts.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{item.no}</td>
                  <td className="item-name">{item.nama}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right price-cell">{item.harga_satuan}</td>
                  <td className="text-right">{item.diskon}</td>
                  <td className="text-right price-cell">{item.harga_netto}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="subtotal-row">
                <td colSpan={5} className="text-right"><strong>Subtotal Parts:</strong></td>
                <td className="text-right"><strong>{data.subtotalParts}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Totals */}
      <div className="totals-section">
        <div className="totals-grid">
          <div className="total-row">
            <span>Harga DPP:</span>
            <span>{data.dpp}</span>
          </div>
          <div className="total-row">
            <span>Biaya Lain:</span>
            <span>{data.biayaLain}</span>
          </div>
          <div className="total-row grand-total">
            <span>GRAND TOTAL:</span>
            <span>{data.grandTotal}</span>
          </div>
        </div>

        {/* Terbilang */}
        <div className="terbilang-section">
          <span className="terbilang-label">TERBILANG:</span>
          <span className="terbilang-text">
            {data.terbilang} Rupiah
          </span>
        </div>
      </div>

      {/* Keterangan */}
      {data.keterangan && (
        <div className="keterangan-section">
          <div className="keterangan-label">KETERANGAN:</div>
          <div className="keterangan-text">
            {data.keterangan}
          </div>
        </div>
      )}

      {/* Signature Section */}
      <div className="signature-section">
        <div className="signature-box">
          <div className="signature-line"></div>
          <div className="signature-label">Paraf Toko</div>
        </div>
        <div className="signature-box">
          <div className="signature-line"></div>
          <div className="signature-label">Paraf Pelanggan</div>
        </div>
      </div>

      {/* Footer */}
      <div className="receipt-footer">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>PERHATIAN / ATTENTION:</div>
        <div style={{ marginBottom: '5px' }}>
          Pembayaran ini sah apabila pada Nota Bengkel ini telah ditanda tangani oleh kasir kami,
          dan tanpa coretan. Perusahaan tidak bertanggung jawab atas uang yang dibayarkan yang
          tidak disertai bukti seperti tersebut diatas.
        </div>
        <div style={{ fontStyle: 'italic', fontSize: '11px' }}>
          Catatan: Bila masih ada hal-hal yang kurang berkenan dalam perbaikan,
          serahkan kembali kendaraan Anda sebelum meninggalkan bengkel atau tidak lebih dari 7 hari.
        </div>
      </div>
    </div>
  );
};

export function PrintReceipt({
  invoiceNumber,
  date,
  customer,
  items,
  subtotal,
  biayaLain,
  total,
  keterangan = '',
  paymentTypeName,
  bankName,
  cardNumber,
  mechanics = []
}: PrintReceiptProps) {
  const cartServices = items.filter(item => item.type === "service");
  const cartParts = items.filter(item => item.type === "part");

  const handlePrint = () => {
    // Sembunyikan elemen yang tidak perlu saat print
    const elementsToHide = document.querySelectorAll('header, footer, nav, aside, .sidebar, .navbar');
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Tunggu semua gambar terload
    const images = document.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(promises).then(() => {
      setTimeout(() => {
        window.print();

        // Restore elements setelah print
        setTimeout(() => {
          elementsToHide.forEach(el => {
            (el as HTMLElement).style.display = '';
          });
        }, 100);
      }, 200);
    });
  };

  // Hitung grand total
  const grandTotalNumber = total + biayaLain;

  // Konversi ke terbilang
  const terbilangText = terbilang(grandTotalNumber);

  // Prepare receipt data
  const receiptData: ReceiptData = {
    nomor: invoiceNumber,
    tanggal: new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    namaPelanggan: customer.name || '-',
    telpPelanggan: customer.phone || '-',
    noPolisi: customer.platNomor || '-',
    merkType: customer.mobil || '-',
    kilometer: customer.kmMasuk || '0',
    mekanik: mechanics.length > 0 ? mechanics.map(m => m.name).join(', ') : undefined,
    serviceItems: cartServices.map((item, index) => ({
      no: index + 1,
      nama: item.name,
      qty: item.qty.toString(),
      harga_satuan: `Rp ${item.price.toLocaleString('id-ID')}`,
      diskon: `Rp ${item.discount.toLocaleString('id-ID')}`,
      harga_netto: `Rp ${((item.price * item.qty) - item.discount).toLocaleString('id-ID')}`
    })),
    parts: cartParts.map((item, index) => ({
      no: index + 1,
      nama: item.name,
      qty: item.qty.toString(),
      harga_satuan: `Rp ${item.price.toLocaleString('id-ID')}`,
      diskon: `Rp ${item.discount.toLocaleString('id-ID')}`,
      harga_netto: `Rp ${((item.price * item.qty) - item.discount).toLocaleString('id-ID')}`
    })),
    subtotalJasa: `Rp ${cartServices.reduce((sum, item) => sum + ((item.price * item.qty) - item.discount), 0).toLocaleString('id-ID')}`,
    subtotalParts: `Rp ${cartParts.reduce((sum, item) => sum + ((item.price * item.qty) - item.discount), 0).toLocaleString('id-ID')}`,
    dpp: `Rp ${subtotal.toLocaleString('id-ID')}`,
    biayaLain: `Rp ${biayaLain.toLocaleString('id-ID')}`,
    grandTotal: `Rp ${grandTotalNumber.toLocaleString('id-ID')}`,
    grandTotalNumber: grandTotalNumber,
    terbilang: terbilangText,
    keterangan: keterangan,
    paymentTypeName: paymentTypeName,
    bankName: bankName,
    cardNumber: cardNumber
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="print-controls">
        <button className="print-button" onClick={handlePrint}>
          🖨️ CETAK NOTA (2 HALAMAN)
        </button>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Akan mencetak 2 halaman terpisah: Halaman 1 untuk Toko, Halaman 2 untuk Pelanggan
        </div>
      </div>

      <div className="receipt-container">
        <div className="receipt-page-vertical">
          <ReceiptSection
            data={receiptData}
            label="UNTUK TOKO"
          />

          <div className="horizontal-cut-line">
            <div className="cut-label">Halaman 2 - Untuk Pelanggan</div>
          </div>

          <ReceiptSection
            data={receiptData}
            label="UNTUK PELANGGAN"
          />
        </div>
      </div>
    </>
  );
}
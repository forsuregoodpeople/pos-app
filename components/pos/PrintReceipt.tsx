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
  
  /* FONT KONSISTEN: Gunakan ukuran yang sama untuk semua elemen print */
  body {
    font-size: 14px !important;
  }
  
  /* Pastikan receipt-container menempati seluruh halaman tanpa overflow */
  .receipt-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
    font-size: 14px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  /* Sembunyikan elemen yang tidak perlu saat print */
  .print-controls,
  .horizontal-cut-line,
  header,
  footer,
  nav,
  aside {
    display: none !important;
    visibility: hidden !important;
  }
  
  .print-only {
    visibility: visible !important;
    display: block !important;
  }

  /* PERBAIKAN: Pastikan gambar terlihat saat print */
  .logo-image {
    visibility: visible !important;
    display: inline-block !important;
    opacity: 1 !important;
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* PERBAIKAN PENTING: Pastikan setiap receipt-section menjadi halaman terpisah */
  .receipt-section {
    width: 100%;
    min-height: 279mm !important;
    max-height: 279mm !important;
    margin: 0 !important;
    padding: 10mm !important;
    box-sizing: border-box;
    border: 1px solid #000;
    page-break-after: always !important;
    page-break-inside: avoid !important;
    break-after: page !important;
    break-inside: avoid !important;
    overflow: hidden !important;
    position: relative;
    font-size: 14px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  /* Hapus page-break setelah section terakhir */
  .receipt-section:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }
  
  .horizontal-cut-line {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  @page {
    size: A4 portrait;
    margin: 8mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* FONT KONSISTEN: Semua elemen menggunakan font yang sama */
  .receipt-table {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    line-height: 1.3 !important;
  }
  
  .receipt-table th,
  .receipt-table td {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    padding: 4px 6px !important;
    line-height: 1.3 !important;
    vertical-align: middle !important;
  }
  
  .receipt-table .item-name {
    font-size: 11px !important;
    font-family: 'Courier New', monospace !important;
    line-height: 1.3 !important;
  }
  
  .receipt-table .price-cell {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    line-height: 1.3 !important;
  }
  
  .section-title {
    font-size: 15px !important;
    font-family: 'Courier New', monospace !important;
    margin-bottom: 4px !important;
  }
  
  .receipt-title {
    font-size: 18px !important;
    font-family: 'Courier New', monospace !important;
    margin: 8px 0 !important;
  }
  
  .info-grid {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .totals-grid {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .total-row {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .total-row.grand-total {
    font-size: 14px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .receipt-footer {
    font-size: 12px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .keterangan-section {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    margin: 5px 3px !important;
    padding: 5px 8px !important;
  }
  
  .header-info {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .receipt-meta {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .copy-label {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .keterangan-label {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .keterangan-text {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .signature-label {
    font-size: 12px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .dealership-name {
    font-size: 16px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .dealership-subtitle {
    font-size: 11px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .receipt-table th,
  .receipt-table td {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    padding: 4px 6px !important;
    line-height: 1.3 !important;
    vertical-align: middle !important;
  }
  
  .receipt-table .item-name {
    font-size: 11px !important;
    font-family: 'Courier New', monospace !important;
    line-height: 1.3 !important;
  }
  
  .receipt-table .price-cell {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    line-height: 1.3 !important;
  }
  
  .receipt-table .price-cell {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    line-height: 1.3 !important;
    font-weight: 500 !important;
  }
  
  .receipt-table th {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    line-height: 1.3 !important;
    font-weight: bold !important;
    padding: 5px 6px !important;
  }
  
  .section-title {
    font-size: 15px !important;
    font-family: 'Courier New', monospace !important;
    margin-bottom: 4px !important;
  }
  
  .receipt-title {
    font-size: 18px !important;
    font-family: 'Courier New', monospace !important;
    margin: 8px 0 !important;
  }
  
  .info-grid {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .totals-grid {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .total-row {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .total-row.grand-total {
    font-size: 14px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .receipt-footer {
    font-size: 12px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .keterangan-section {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    margin: 5px 3px !important;
    padding: 5px 8px !important;
  }
  
  .header-info {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .receipt-meta {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .copy-label {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .receipt-table th {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .keterangan-label {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .keterangan-text {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .signature-label {
    font-size: 12px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .dealership-name {
    font-size: 16px !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .dealership-subtitle {
    font-size: 11px !important;
    font-family: 'Courier New', monospace !important;
  }

  /* Style untuk terbilang saat print tanpa border */
  .terbilang-section {
    font-size: 12px !important;
    font-family: 'Courier New', monospace !important;
    margin-top: 5px !important;
    padding: 2px 0 !important;
    border: none !important;
    background: none !important;
  }
  
  .terbilang-label {
    font-size: 12px !important;
    font-family: 'Courier New', monospace !important;
    font-weight: bold !important;
  }
  
  .terbilang-text {
    font-size: 12px !important;
    font-family: 'Courier New', monospace !important;
    font-style: italic !important;
  }
}

/* FONT KONSISTEN: Gunakan font yang sama untuk semua elemen */
.receipt-container {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  width: 100%;
}

/* Layout untuk screen */
.receipt-page-vertical {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

@media screen {
  .receipt-page-vertical {
    flex-direction: column;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
}

@media print {
  .receipt-page-vertical {
    display: block !important;
    width: 100% !important;
    gap: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}

.receipt-section {
  width: 100%;
  margin: 0;
  padding: 15px;
  border: 1px solid #000;
  background: white;
  box-sizing: border-box;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

@media screen {
  .receipt-section {
    margin-bottom: 20px;
    max-width: 550px;
    margin-left: auto;
    margin-right: auto;
    min-height: auto !important;
    height: auto !important;
  }
}

/* Logo Styles */
.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-image {
  height: 50px;
  width: auto;
  max-width: 100%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.logo-placeholder {
  height: 50px;
  width: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  background: #f0f0f0;
  font-size: 12px;
  color: #666;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.logo-text {
  text-align: left;
  font-family: 'Courier New', monospace;
}

.dealership-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 2px;
  font-family: 'Courier New', monospace;
}

.dealership-subtitle {
  font-size: 11px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.header-info {
  text-align: right;
  font-size: 13px;
  line-height: 1.3;
  font-family: 'Courier New', monospace;
}

.receipt-title {
  font-weight: bold;
  font-size: 18px;
  margin: 6px 0;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.receipt-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-top: 6px;
  padding: 6px 0;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  font-family: 'Courier New', monospace;
}

.copy-label {
  font-style: italic;
  font-size: 13px;
  font-weight: bold;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.info-section {
  margin-bottom: 10px;
}

.section-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 4px;
  border-bottom: 1px solid #000;
  padding-bottom: 2px;
  font-family: 'Courier New', monospace;
}

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 20px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Courier New', monospace;
}

.info-label {
  font-weight: bold;
  white-space: nowrap;
  min-width: fit-content;
  font-family: 'Courier New', monospace;
}

.info-value {
  flex: 1;
  text-align: right;
  word-break: break-word;
  overflow-wrap: break-word;
  font-family: 'Courier New', monospace;
}

.info-item.full-width {
  grid-column: span 2;
}

.table-section {
  margin-bottom: 10px;
}

/* Tabel dengan font konsisten */
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
  padding: 5px 8px;
  font-family: 'Courier New', monospace;
  line-height: 1.3;
}

.receipt-table .text-center {
  text-align: center;
}

.receipt-table .text-right {
  text-align: right;
}

.receipt-table .item-name {
  font-size: 11px;
  line-height: 1.3;
  font-family: 'Courier New', monospace;
  vertical-align: middle;
}

.receipt-table .price-cell {
  font-size: 13px;
  font-weight: 500;
  font-family: 'Courier New', monospace;
  line-height: 1.3;
  vertical-align: middle;
}

.subtotal-row td {
  font-weight: bold;
  background-color: #f0f0f0;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  line-height: 1.3;
  vertical-align: middle;
}

.totals-section {
  margin-bottom: 10px;
}

.totals-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 2px 0;
  font-family: 'Courier New', monospace;
}

.total-row.grand-total {
  font-weight: bold;
  font-size: 14px;
  border-top: 1px solid #000;
  padding-top: 4px;
  margin-top: 4px;
  font-family: 'Courier New', monospace;
}

/* Style untuk terbilang tanpa border */
.terbilang-section {
  margin-top: 8px;
  padding: 2px 0;
  font-size: 13px;
  line-height: 1.3;
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

.signature-section {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
  padding: 10px 0;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  font-family: 'Courier New', monospace;
}

.signature-box {
  text-align: center;
  width: 130px;
  font-family: 'Courier New', monospace;
}

.signature-line {
  border-bottom: 1px solid #000;
  height: 30px;
  margin-bottom: 4px;
}

.signature-label {
  font-size: 12px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.receipt-footer {
  margin-top: 10px;
  border-top: 1px solid #000;
  padding-top: 6px;
  font-size: 12px;
  line-height: 1.3;
  font-family: 'Courier New', monospace;
}

.keterangan-section {
  margin: 6px 3px;
  padding: 6px 8px;
  border: 1px solid #000;
  font-size: 13px;
  line-height: 1.3;
  min-height: 60px;
  background-color: #f9f9f9;
  font-family: 'Courier New', monospace;
}

.keterangan-label {
  font-weight: bold;
  margin-bottom: 3px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

  .keterangan-text {
    white-space: pre-wrap;
    word-wrap: break-word;
    min-height: 50px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 4px;
    background-color: white;
    border: 1px solid #ddd;
  }
  
  .keterangan-text textarea {
    font-size: 13px !important;
    font-family: 'Courier New', monospace !important;
    border: 1px solid #000 !important;
    padding: 4px !important;
    resize: none !important;
    width: 100% !important;
    box-sizing: border-box !important;
    background-color: white !important;
  }

.horizontal-cut-line {
  display: none;
}

@media screen {
  .horizontal-cut-line {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 0;
    width: 100%;
    border-top: 2px dashed #666;
    border-bottom: 2px dashed #666;
    margin: 15px 0;
    background-color: #f5f5f5;
  }
  
  .cut-label {
    margin-top: 6px;
    font-size: 13px;
    color: #666;
    font-weight: bold;
    font-family: 'Courier New', monospace;
  }
}

.print-controls {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  font-family: 'Courier New', monospace;
}

@media print {
  .print-controls {
    display: none;
  }
}

.print-button {
  background: #007acc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin: 0 10px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.print-button:hover {
  background: #005a9e;
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

// Komponen ReceiptSection dan PrintReceipt dengan font konsisten
interface PrintReceiptProps {
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  biayaLain: number;
  total: number;
  keterangan?: string;
  mechanics?: any[];
}

interface ReceiptData {
  nomor: string;
  tanggal: string;
  namaPelanggan: string;
  telpPelanggan: string;
  npwpPelanggan: string;
  noSpp: string;
  noPolisi: string;
  merkType: string;
  noRangka: string;
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
  grandTotalNumber: number; // Tambah properti untuk angka (bukan string)
  terbilang: string; // Tambah properti untuk terbilang
  garansi?: string;
  keterangan?: string;
}

const ReceiptSection = ({ data, label }: { data: ReceiptData; label: string }) => {
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');
  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = logoSrc;
    img.onload = () => {
      console.log('Logo loaded successfully');
    };
    img.onerror = () => {
      console.log('Logo failed to load, using fallback');
      setLogoError(true);
    };
  }, [logoSrc]);

  return (
    <div className="receipt-section">
      {/* Header */}
      <div className="receipt-header">
        <div className="header-content">
          <div className="logo-section">
            {!logoError ? (
              <img
                src={logoSrc}
                alt="Sunda Service Logo"
                className="logo-image"
                onError={() => {
                  setLogoError(true);
                }}
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
        <div className="receipt-title">NOTA</div>
        <div className="receipt-meta">
          <div><strong>Nomor:</strong> {data.nomor}</div>
          <div><strong>Tanggal:</strong>{data.tanggal}</div>
          <div className="copy-label">{label}</div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="info-section">
        <div className="section-title">Data Pelanggan</div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Nama:</span>
            <span className="info-value">{data.namaPelanggan}</span>
          </div>
          <div className="info-item">
            <span className="info-value"><span className="info-label">Telp:</span>
              {data.telpPelanggan}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="info-section">
        <div className="section-title">Data Kendaraan</div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-value"><span className="info-label">No. Polisi:</span>{data.noPolisi}</span>
          </div>
          <div className="info-item">
            <span className="info-value"><span className="info-label">Kendaraan:</span>{data.merkType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Kilometer:</span>
            <span className="info-value">{data.kilometer} km</span>
          </div>
          {data.mekanik && (
            <div className="info-item full-width">
              <span className="info-label">Mekanik:</span>
              <span className="info-value">{data.mekanik}</span>
            </div>
          )}
        </div>
      </div>

      {/* Service Items */}
      {data.serviceItems.length > 0 && (
        <div className="table-section">
          <div className="section-title">Jenis / Item Pekerjaan</div>
          <table className="receipt-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '35px', fontSize: '13px' }}>No</th>
                <th className="text-left" style={{ fontSize: '11px' }}>Nama Pekerjaan</th>
                <th className="text-center" style={{ width: '45px', fontSize: '13px' }}>Qty</th>
                <th className="text-right" style={{ width: '95px', fontSize: '13px' }}>Harga Satuan</th>
                <th className="text-right" style={{ width: '65px', fontSize: '13px' }}>Diskon</th>
                <th className="text-right" style={{ width: '95px', fontSize: '13px' }}>Harga Netto</th>
              </tr>
            </thead>
            <tbody>
              {data.serviceItems.map((item, index) => (
                <tr key={index}>
                  <td className="text-center" style={{ fontSize: '13px' }}>{item.no}</td>
                  <td className="item-name" style={{ fontSize: '11px' }}>{item.nama}</td>
                  <td className="text-center" style={{ fontSize: '13px' }}>{item.qty}</td>
                  <td className="text-right price-cell" style={{ fontSize: '13px' }}>{item.harga_satuan}</td>
                  <td className="text-right" style={{ fontSize: '13px' }}>{item.diskon}</td>
                  <td className="text-right price-cell" style={{ fontSize: '13px' }}>{item.harga_netto}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="subtotal-row">
                <td colSpan={5} className="text-right" style={{ fontSize: '13px' }}><strong>Subtotal Jasa:</strong></td>
                <td className="text-right" style={{ fontSize: '13px' }}><strong>{data.subtotalJasa}</strong></td>
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
                <th className="text-center" style={{ width: '35px', fontSize: '13px' }}>No</th>
                <th className="text-left" style={{ fontSize: '11px' }}>Nama Suku Cadang</th>
                <th className="text-center" style={{ width: '45px', fontSize: '13px' }}>Qty</th>
                <th className="text-right" style={{ width: '95px', fontSize: '13px' }}>Harga Satuan</th>
                <th className="text-right" style={{ width: '65px', fontSize: '13px' }}>Diskon</th>
                <th className="text-right" style={{ width: '95px', fontSize: '13px' }}>Harga Netto</th>
              </tr>
            </thead>
            <tbody>
              {data.parts.map((item, index) => (
                <tr key={index}>
                  <td className="text-center" style={{ fontSize: '13px' }}>{item.no}</td>
                  <td className="item-name" style={{ fontSize: '11px' }}>{item.nama}</td>
                  <td className="text-center" style={{ fontSize: '13px' }}>{item.qty}</td>
                  <td className="text-right price-cell" style={{ fontSize: '13px' }}>{item.harga_satuan}</td>
                  <td className="text-right" style={{ fontSize: '13px' }}>{item.diskon}</td>
                  <td className="text-right price-cell" style={{ fontSize: '13px' }}>{item.harga_netto}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="subtotal-row">
                <td colSpan={5} className="text-right" style={{ fontSize: '13px' }}><strong>Subtotal Parts:</strong></td>
                <td className="text-right" style={{ fontSize: '13px' }}><strong>{data.subtotalParts}</strong></td>
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

        {/* Terbilang tanpa border/kotak */}
        <div className="terbilang-section">
          <span className="terbilang-label">TERBILANG:</span>
          <span className="terbilang-text">
            {data.terbilang} Rupiah
          </span>
        </div>
      </div>

      {/* Keterangan Section */}
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
          <div className="signature-label">Paraf Pelangan</div>
        </div>
      </div>

      {/* Footer */}
      <div className="receipt-footer">
        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>PERHATIAN / ATTENTION:</div>
        <div>
          Pembayaran ini sah apabila pada Nota Bengkel ini telah ditanda tangani oleh kasir kami,
          dan tanpa coretan. Perusahaan tidak bertanggung jawab atas uang yang dibayarkan yang
          tidak disertai bukti seperti tersebut diatas.
        </div>
      </div>

      {/* Catatan Penting */}
      <div style={{ marginTop: '6px', lineHeight: '1.3', padding: '5px', backgroundColor: '#f5f5f5', borderRadius: '3px', border: '1px solid #ddd', fontSize: '12px' }}>
        <strong>Catatan Penting:</strong> Bila masih ada hal-hal yang kurang berkenan dalam perbaikan,
        serahkan kembali kendaraan Anda sebelum meninggalkan bengkel atau tidak lebih dari 7 hari.
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
  mechanics = []
}: PrintReceiptProps) {
  const cartServices = items.filter(item => item.type === "service");
  const cartParts = items.filter(item => item.type === "part");

  const handlePrint = () => {
    const elementsToHide = document.querySelectorAll('header, footer, nav, aside, .sidebar, .navbar');
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

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

  // Convert data to match ReceiptData interface
  const receiptData: ReceiptData = {
    nomor: invoiceNumber,
    tanggal: new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    namaPelanggan: customer.name || '',
    telpPelanggan: customer.phone || '',
    npwpPelanggan: '00.000.000.0-000.000',
    noSpp: invoiceNumber,
    noPolisi: customer.platNomor || '',
    merkType: customer.mobil || '',
    noRangka: '',
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
    grandTotalNumber: grandTotalNumber, // Tambah properti untuk angka
    terbilang: terbilangText, // Tambah properti terbilang
    garansi: 'Garansi 1 bulan untuk suku cadang dan 3 bulan untuk jasa perbaikan',
    keterangan: keterangan
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div className="print-controls">
        <button className="print-button" onClick={handlePrint}>
          🖨️ CETAK NOTA
        </button>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Klik tombol di atas untuk mencetak kedua nota (Toko & Customer) dalam dua halaman terpisah
        </div>
      </div>

      <div className="receipt-container">
        <div className="receipt-page-vertical">
          <ReceiptSection
            data={receiptData}
            label="UNTUK TOKO"
          />
          <div className="horizontal-cut-line">
            <div className="cut-label">Batas Halaman</div>
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
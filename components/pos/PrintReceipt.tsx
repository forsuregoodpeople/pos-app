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
  body * {
    visibility: hidden;
  }
  .receipt-container, .receipt-container * {
    visibility: visible;
  }
  .receipt-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
    margin: 0;
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
    min-height: 275mm !important;
    height: 275mm !important;
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
  }
  
  /* Hapus page-break setelah section terakhir */
  .receipt-section:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }
  
  .horizontal-cut-line {
    display: none !important;
  }
  
  @page {
    size: A4 portrait;
    margin: 10mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Pastikan konten tidak terpotong */
  .receipt-table {
    font-size: 9px !important;
  }
  
  .section-title {
    font-size: 11px !important;
  }
  
  .receipt-title {
    font-size: 14px !important;
  }
  
  .info-grid {
    font-size: 9px !important;
  }
  
  .totals-grid {
    font-size: 10px !important;
  }
  
  .total-row.grand-total {
    font-size: 11px !important;
  }
  
  .receipt-footer {
    font-size: 8px !important;
  }
  
  .keterangan-section {
    font-size: 9px !important;
    margin: 4px 2px !important;
    padding: 4px 5px !important;
    min-height: 40px !important;
  }
}

/* Receipt Container Styles */
.receipt-container {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.3;
  width: 100%;
}

/* PERBAIKAN: Layout untuk screen */
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
  }
}

.receipt-section {
  width: 100%;
  margin: 0;
  padding: 15px;
  border: 1px solid #000;
  background: white;
  box-sizing: border-box;
}

@media screen {
  .receipt-section {
    margin-bottom: 20px;
    max-width: 500px;
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
  gap: 8px;
  margin-bottom: 8px;
}

.logo-image {
  height: 45px;
  width: auto;
  /* PERBAIKAN: Tambahkan properti untuk print */
  max-width: 100%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.logo-placeholder {
  height: 45px;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  background: #f0f0f0;
  font-size: 10px;
  color: #666;
}

.logo-text {
  text-align: left;
}

.dealership-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
}

.dealership-subtitle {
  font-size: 10px;
  font-weight: bold;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.header-info {
  text-align: right;
  font-size: 9px;
}

.receipt-title {
  font-weight: bold;
  font-size: 16px;
  margin: 6px 0;
  text-align: center;
}

.receipt-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  margin-top: 4px;
}

.copy-label {
  font-style: italic;
  font-size: 9px;
  font-weight: bold;
}

.info-section {
  margin-bottom: 8px;
}

.section-title {
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 3px;
  border-bottom: 1px solid #000;
  padding-bottom: 2px;
}

/* PERUBAHAN: Info grid dengan layout yang lebih rapat */
.info-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 5px; /* Reduced horizontal gap to make it tighter */
  font-size: 9px;
}

/* PERUBAHAN: Flex layout untuk item info agar lebih rapat */
.info-item {
  display: flex;
  align-items: center;
  gap: 4px; /* Reduced gap between label and value */
}

.info-label {
  font-weight: bold;
  white-space: nowrap;
  min-width: fit-content;
}

.info-value {
  flex: 1;
  text-align: right;
  word-break: break-word;
  overflow-wrap: break-word;
}

.info-item.full-width {
  grid-column: span 2;
}

.table-section {
  margin-bottom: 8px;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
  table-layout: fixed;
}

.receipt-table th,
.receipt-table td {
  border: 1px solid #000;
  padding: 2px 3px;
  text-align: left;
  word-wrap: break-word;
}

.receipt-table th {
  font-weight: bold;
  background-color: #f0f0f0;
}

.receipt-table .text-center {
  text-align: center;
}

.receipt-table .text-right {
  text-align: right;
}

.subtotal-row td {
  font-weight: bold;
  background-color: #f0f0f0;
}

.totals-section {
  margin-bottom: 8px;
}

.totals-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}

.total-row.grand-total {
  font-weight: bold;
  font-size: 11px;
  border-top: 1px solid #000;
  padding-top: 3px;
  margin-top: 3px;
}

.signature-section {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
}

.signature-box {
  text-align: center;
  width: 100px;
}

.signature-line {
  border-bottom: 1px solid #000;
  height: 25px;
  margin-bottom: 4px;
}

.signature-label {
  font-size: 9px;
}

.receipt-footer {
  margin-top: 8px;
  border-top: 1px solid #000;
  padding-top: 5px;
  font-size: 8px;
}

.keterangan-section {
  margin: 5px 3px;
  padding: 5px 6px;
  border: 1px solid #000;
  font-size: 10px;
  line-height: 1.3;
  min-height: 55px;
  background-color: #f9f9f9;
}

.keterangan-label {
  font-weight: bold;
  margin-bottom: 3px;
  font-size: 9px;
}

.keterangan-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 45px;
  font-family: 'Courier New', monospace;
  font-size: 9px;
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
    padding: 10px 0;
    width: 100%;
    border-top: 2px dashed #666;
    border-bottom: 2px dashed #666;
    margin: 10px 0;
  }
  
  .cut-label {
    margin-top: 5px;
    font-size: 11px;
    color: #666;
  }
}

.print-controls {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
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
}

.print-button:hover {
  background: #005a9e;
}
`;

// Komponen ReceiptSection dan PrintReceipt yang diperbaiki
interface PrintReceiptProps {
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  biayaLain: number;
  total: number;
  keterangan?: string;
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
  garansi?: string;
  keterangan?: string;
}

const ReceiptSection = ({ data, label }: { data: ReceiptData; label: string }) => {
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');
  const [logoError, setLogoError] = useState<boolean>(false);

  // PERBAIKAN: Preload gambar untuk memastikan tersedia saat print
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
                // PERBAIKAN: Tambahkan atribut penting untuk print
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
            <div style={{ fontSize: '10px' }}>Jln Panjunan No.112</div>
            <div style={{ fontSize: '10px' }}>Cirebon</div>
            <div style={{ fontSize: '10px' }}>Telp: (0231) 234997</div>
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
          {/* PERUBAHAN: Nomor telpon di-grid yang sama, lebih rapat */}
          <div className="info-item">
            <span className="info-value"><span className="info-label">No. Telpon: </span>
              {data.telpPelanggan}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="info-section">
        <div className="section-title">Data Kendaraan</div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">No. Polisi:</span>
            <span className="info-value">{data.noPolisi}</span>
          </div>
          {/* PERUBAHAN: Merk/Type mepet ke kanan */}
          <div className="info-item">
            <span className="info-value"><span className="info-label">Kendaraan: </span>{data.merkType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Kilometer:</span>
            <span className="info-value">{data.kilometer} km</span>
          </div>
        </div>
      </div>

      {/* Service Items - DIATAS Parts */}
      {data.serviceItems.length > 0 && (
        <div className="table-section">
          <div className="section-title">Jenis / Item Pekerjaan</div>
          <table className="receipt-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '25px' }}>No</th>
                <th className="text-left">Nama Pekerjaan</th>
                <th className="text-center" style={{ width: '25px' }}>Qty</th>
                <th className="text-right" style={{ width: '75px' }}>Harga Satuan</th>
                <th className="text-right" style={{ width: '50px' }}>Diskon</th>
                <th className="text-right" style={{ width: '75px' }}>Harga Netto</th>
              </tr>
            </thead>
            <tbody>
              {data.serviceItems.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{item.no}</td>
                  <td style={{ fontSize: '8px' }}>{item.nama}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right" style={{ fontSize: '8px' }}>{item.harga_satuan}</td>
                  <td className="text-right">{item.diskon}</td>
                  <td className="text-right" style={{ fontSize: '8px' }}>{item.harga_netto}</td>
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

      {/* Parts - DIBAWAH Service Items */}
      {data.parts.length > 0 && (
        <div className="table-section">
          <div className="section-title">Pengadaan Suku Cadang & Material</div>
          <table className="receipt-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '25px' }}>No</th>
                <th className="text-left">Nama Suku Cadang</th>
                <th className="text-center" style={{ width: '25px' }}>Qty</th>
                <th className="text-right" style={{ width: '75px' }}>Harga Satuan</th>
                <th className="text-right" style={{ width: '50px' }}>Diskon</th>
                <th className="text-right" style={{ width: '75px' }}>Harga Netto</th>
              </tr>
            </thead>
            <tbody>
              {data.parts.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{item.no}</td>
                  <td style={{ fontSize: '8px' }}>{item.nama}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right" style={{ fontSize: '8px' }}>{item.harga_satuan}</td>
                  <td className="text-right">{item.diskon}</td>
                  <td className="text-right" style={{ fontSize: '8px' }}>{item.harga_netto}</td>
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
      </div>

      {/* Keterangan Section - Textarea Besar */}
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
        <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '2px' }}>PERHATIAN / ATTENTION:</div>
        <div style={{ fontSize: '8px', lineHeight: '1.2' }}>
          Pembayaran ini sah apabila pada Nota Bengkel ini telah ditanda tangani oleh kasir kami,
          dan tanpa coretan. Perusahaan tidak bertanggung jawab atas uang yang dibayarkan yang
          tidak disertai bukti seperti tersebut diatas.
        </div>
      </div>

      {/* Catatan Penting */}
      <div style={{ fontSize: '8px', marginTop: '4px', lineHeight: '1.2' }}>
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
  keterangan = ''
}: PrintReceiptProps) {
  const cartServices = items.filter(item => item.type === "service");
  const cartParts = items.filter(item => item.type === "part");

  // PERBAIKAN: Fungsi print yang lebih baik
  const handlePrint = () => {
    // Pastikan gambar sudah dimuat sebelum print
    const images = document.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; 
      });
    });

    Promise.all(promises).then(() => {
      // Tunggu sebentar untuk memastikan render selesai
      setTimeout(() => {
        window.print();
      }, 100);
    });
  };

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
    grandTotal: `Rp ${(total + biayaLain).toLocaleString('id-ID')}`,
    garansi: 'Garansi 1 bulan untuk suku cadang dan 3 bulan untuk jasa perbaikan',
    keterangan: keterangan
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div className="print-controls">
        <button className="print-button" onClick={handlePrint}>
          🖨️ Cetak Nota
        </button>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Klik tombol di atas untuk mencetak kedua nota (Toko & Customer) dalam dua halaman terpisah
        </div>
      </div>

      <div className="receipt-container">
        <div className="receipt-page-vertical">
          <ReceiptSection data={receiptData} label="UNTUK TOKO" />
          <div className="horizontal-cut-line">
            <div className="cut-label">GARIS POTONG - Halaman 1 dari 2</div>
          </div>
          <ReceiptSection data={receiptData} label="UNTUK PELANGGAN" />
        </div>
      </div>
    </>
  );
}
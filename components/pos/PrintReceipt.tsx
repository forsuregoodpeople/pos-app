"use client"

import React from 'react';
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

  .receipt-page-vertical {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 297mm;
    margin: 0;
    padding: 5mm;
    gap: 3mm;
    page-break-after: always;
    box-sizing: border-box;
  }
  
  .receipt-section {
    width: 100%;
    min-height: 135mm;
    margin: 0;
    padding: 6px;
    box-sizing: border-box;
    border: 1px solid #000;
    page-break-inside: avoid;
    overflow: visible;
  }
  
  .horizontal-cut-line {
    display: none;
  }
  
  @page {
    size: A4 portrait;
    margin: 5mm;
  }
}

/* Receipt Container Styles */
.receipt-container {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.3;
  width: 100%;
}

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
    flex-direction: column !important;
    gap: 3mm !important;
  }
}

.receipt-section {
  width: 100%;
  margin: 0;
  padding: 12px;
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
  }
}

@media print {
  .receipt-section {
    max-width: none;
    margin: 0;
    min-height: 135mm;
    overflow: visible;
    font-size: 9px;
    line-height: 1.1;
    width: 100%;
    padding: 6px;
    border: 1px solid #000;
  }
  
  .receipt-table {
    font-size: 8px;
  }
  
  .section-title {
    font-size: 10px;
  }
  
  .receipt-title {
    font-size: 13px;
  }
  
  .info-grid {
    font-size: 8px;
  }
  
  .totals-grid {
    font-size: 9px;
  }
  
  .total-row.grand-total {
    font-size: 10px;
  }
  
  .receipt-footer {
    font-size: 7px;
  }
  
  .keterangan-section {
    font-size: 8px;
    margin: 3px 2px;
    padding: 3px 4px;
    min-height: 45px;
  }
}

/* Logo Styles */
.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.logo-image {
  height: 45px;
  width: auto;
}

.logo-text {
  text-align: left;
}

.dealership-name {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 2px;
}

.dealership-subtitle {
  font-size: 9px;
  font-weight: bold;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.header-info {
  text-align: right;
  font-size: 8px;
}

.receipt-title {
  font-weight: bold;
  font-size: 15px;
  margin: 4px 0;
  text-align: center;
}

.receipt-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  margin-top: 2px;
}

.copy-label {
  font-style: italic;
  font-size: 8px;
}

.info-section {
  margin-bottom: 6px;
}

.section-title {
  font-weight: bold;
  font-size: 10px;
  margin-bottom: 2px;
  border-bottom: 1px solid #000;
  padding-bottom: 1px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  font-size: 8px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  font-weight: bold;
  margin-right: 3px;
}

.info-value {
  flex: 1;
}

.table-section {
  margin-bottom: 6px;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
  table-layout: fixed;
}

.receipt-table th,
.receipt-table td {
  border: 1px solid #000;
  padding: 1px 2px;
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
  margin-bottom: 6px;
}

.totals-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
}

.total-row.grand-total {
  font-weight: bold;
  font-size: 10px;
  border-top: 1px solid #000;
  padding-top: 2px;
}

.signature-section {
  display: flex;
  justify-content: space-around;
  margin: 12px 0;
}

.signature-box {
  text-align: center;
  width: 90px;
}

.signature-line {
  border-bottom: 1px solid #000;
  height: 20px;
  margin-bottom: 3px;
}

.signature-label {
  font-size: 8px;
}

.receipt-footer {
  margin-top: 6px;
  border-top: 1px solid #000;
  padding-top: 4px;
  font-size: 7px;
}

.keterangan-section {
  margin: 4px 2px;
  padding: 4px 5px;
  border: 1px solid #000;
  font-size: 9px;
  line-height: 1.2;
  min-height: 50px;
  background-color: #f9f9f9;
}

.keterangan-label {
  font-weight: bold;
  margin-bottom: 2px;
  font-size: 8px;
}

.keterangan-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 40px;
  font-family: 'Courier New', monospace;
  font-size: 8px;
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
    padding: 8px 0;
    width: 100%;
    border-top: 2px dashed #666;
    border-bottom: 2px dashed #666;
    margin: 8px 0;
  }
  
  .cut-label {
    margin-top: 4px;
    font-size: 10px;
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
  return (
    <div className="receipt-section">
      {/* Header */}
      <div className="receipt-header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src="/images/logo.png"
              alt="Sunda Service Logo"
              className="logo-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="logo-text">
              <div className="dealership-name">SUNDA SERVIS</div>
            </div>
          </div>
          <div className="header-info">
            <div style={{ fontSize: '9px' }}>Jln Panjunan No.112</div>
            <div style={{ fontSize: '9px' }}>Cirebon</div>
            <div style={{ fontSize: '9px' }}>Telp: (0231) 234997</div>
            <div style={{ fontSize: '8px', marginTop: '1px' }}>NPWP: 00.000.000.0-000.000</div>
          </div>
        </div>
        <div className="receipt-title">NOTA BENGKEL</div>
        <div className="receipt-meta">
          <div><strong>Nomor:</strong> {data.nomor}</div>
          <div><strong>Tanggal:</strong> {data.tanggal}</div>
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
            <span className="info-label">No. Telpon:</span>
            <span className="info-value">{data.telpPelanggan}</span>
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
          <div className="info-item">
            <span className="info-label">Merk/Type:</span>
            <span className="info-value">{data.merkType}</span>
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
                <th className="text-center" style={{ width: '22px' }}>No</th>
                <th className="text-left">Nama Pekerjaan</th>
                <th className="text-center" style={{ width: '22px' }}>Qty</th>
                <th className="text-right" style={{ width: '70px' }}>Harga Satuan</th>
                <th className="text-right" style={{ width: '45px' }}>Diskon</th>
                <th className="text-right" style={{ width: '70px' }}>Harga Netto</th>
              </tr>
            </thead>
            <tbody>
              {data.serviceItems.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{item.no}</td>
                  <td style={{ fontSize: '7px' }}>{item.nama}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right" style={{ fontSize: '7px' }}>{item.harga_satuan}</td>
                  <td className="text-right">{item.diskon}</td>
                  <td className="text-right" style={{ fontSize: '7px' }}>{item.harga_netto}</td>
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
                <th className="text-center" style={{ width: '22px' }}>No</th>
                <th className="text-left">Nama Suku Cadang</th>
                <th className="text-center" style={{ width: '22px' }}>Qty</th>
                <th className="text-right" style={{ width: '70px' }}>Harga Satuan</th>
                <th className="text-right" style={{ width: '45px' }}>Diskon</th>
                <th className="text-right" style={{ width: '70px' }}>Harga Netto</th>
              </tr>
            </thead>
            <tbody>
              {data.parts.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{item.no}</td>
                  <td style={{ fontSize: '7px' }}>{item.nama}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right" style={{ fontSize: '7px' }}>{item.harga_satuan}</td>
                  <td className="text-right">{item.diskon}</td>
                  <td className="text-right" style={{ fontSize: '7px' }}>{item.harga_netto}</td>
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

      {/* Garansi */}
      {data.garansi && (
        <div style={{ fontSize: '8px', border: '1px solid #000', padding: '3px', marginBottom: '4px' }}>
          <strong>Garansi Perbaikan:</strong> {data.garansi}
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

      {/* Signature Section */}
      <div className="signature-section">
        <div className="signature-box">
          <div className="signature-line"></div>
          <div className="signature-label">Paraf Toko</div>
        </div>
        <div className="signature-box">
          <div className="signature-line"></div>
          <div className="signature-label">Paraf Customer</div>
        </div>
      </div>

      {/* Footer */}
      <div className="receipt-footer">
        <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '1px' }}>PERHATIAN / ATTENTION:</div>
        <div style={{ fontSize: '7px', lineHeight: '1.1' }}>
          Pembayaran ini sah apabila pada Nota Bengkel ini telah ditanda tangani oleh kasir kami,
          dan tanpa coretan. Perusahaan tidak bertanggung jawab atas uang yang dibayarkan yang
          tidak disertai bukti seperti tersebut diatas.
        </div>
      </div>

      {/* Keterangan Section - Textarea Besar */}
      <div className="keterangan-section">
        <div className="keterangan-label">KETERANGAN:</div>
        <div className="keterangan-text">
        </div>
      </div>

      {/* Catatan Penting */}
      <div style={{ fontSize: '7px', marginTop: '3px', lineHeight: '1.1', padding: '0 2px' }}>
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

  const handlePrint = () => {
    window.print();
  };

  // Convert data to match ReceiptData interface
  const receiptData: ReceiptData = {
    nomor: invoiceNumber,
    tanggal: new Date(date).toLocaleDateString('id-ID'),
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
      diskon: `${item.discount}%`,
      harga_netto: `Rp ${((item.price * item.qty) * (1 - item.discount / 100)).toLocaleString('id-ID')}`
    })),
    parts: cartParts.map((item, index) => ({
      no: index + 1,
      nama: item.name,
      qty: item.qty.toString(),
      harga_satuan: `Rp ${item.price.toLocaleString('id-ID')}`,
      diskon: `${item.discount}%`,
      harga_netto: `Rp ${((item.price * item.qty) * (1 - item.discount / 100)).toLocaleString('id-ID')}`
    })),
    subtotalJasa: `Rp ${cartServices.reduce((sum, item) => sum + ((item.price * item.qty) * (1 - item.discount / 100)), 0).toLocaleString('id-ID')}`,
    subtotalParts: `Rp ${cartParts.reduce((sum, item) => sum + ((item.price * item.qty) * (1 - item.discount / 100)), 0).toLocaleString('id-ID')}`,
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
          Klik tombol di atas untuk mencetak kedua nota (Toko & Customer) dalam satu halaman A4
        </div>
      </div>

      <div className="receipt-container">
        <div className="receipt-page-vertical">
          <ReceiptSection data={receiptData} label="UNTUK TOKO" />
          <div className="horizontal-cut-line">
            <div className="cut-label">GARIS POTONG</div>
          </div>
          <ReceiptSection data={receiptData} label="UNTUK PELANGGAN" />
        </div>
      </div>
    </>
  );
}
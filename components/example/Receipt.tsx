"use client"

import React from 'react';

/* Print Styles */
const printStyles = `
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
    height: auto;
  }
  
  .receipt-page-horizontal {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 0;
    gap: 2px;
    justify-content: center;
  }
  
  .vertical-cut-line {
    display: none;
  }
  
  .receipt-section {
    width: 100%;
    height: auto;
    overflow: visible;
    margin: 0;
    padding: 50px;
    box-sizing: border-box;
    border: 1px solid #000;
  }
  
  .vertical-dashed-line,
  .rotate-90 {
    display: none !important;
  }
  @page {
    size: A4 portrait;
    margin: 5mm;
  }
}

/* Receipt Container Styles */
.receipt-container {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  line-height: 1.2;
}

.receipt-page-horizontal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media screen {
  .receipt-page-horizontal {
    flex-direction: column;
  }
}

@media print {
  .receipt-page-horizontal {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
  
  .vertical-cut-line {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 30px;
    background: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 5px,
      #666 5px,
      #666 10px
    );
    position: relative;
  }
  
  .receipt-section {
    width: calc(50% - 15px);
    height: 100vh;
    overflow: hidden;
    margin: 0;
    padding: 15px;
    box-sizing: border-box;
  }
}

.receipt-section {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 10px;
  border: 1px solid #000;
}

@media screen {
  .receipt-section {
    margin-bottom: 20px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media print {
  .receipt-section {
    max-width: none;
    margin: 0;
    height: auto;
    overflow: visible;
    font-size: 7px;
    line-height: 1.0;
    width: 50%;
  }
}
  
  .receipt-table {
    font-size: 6px;
  }
  
  .section-title {
    font-size: 8px;
  }
  
  .receipt-title {
    font-size: 12px;
  }
  
  .info-grid {
    font-size: 6px;
  }
  
  .totals-grid {
    font-size: 7px;
  }
  
  .total-row.grand-total {
    font-size: 9px;
  }
  
  .receipt-footer {
    font-size: 5px;
  }
}
}
}
  
  .receipt-table {
    font-size: 7px;
  }
  
  .section-title {
    font-size: 9px;
  }
  
  .receipt-title {
    font-size: 14px;
  }
  
  .info-grid {
    font-size: 7px;
  }
  
  .totals-grid {
    font-size: 8px;
  }
  
  .total-row.grand-total {
    font-size: 10px;
  }
  
  .receipt-footer {
    font-size: 6px;
  }
}

.receipt-header {
  text-align: center;
  margin-bottom: 15px;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.logo-section {
  text-align: left;
}

.toyota-logo {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
}

.dealership-name {
  font-weight: bold;
  font-size: 10px;
}

.header-info {
  text-align: right;
  font-size: 8px;
}

.receipt-title {
  font-weight: bold;
  font-size: 16px;
  margin: 10px 0;
  text-align: center;
}

.receipt-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  margin-top: 5px;
}

.copy-label {
  font-style: italic;
  font-size: 8px;
}

.info-section {
  margin-bottom: 15px;
}

.section-title {
  font-weight: bold;
  font-size: 10px;
  margin-bottom: 5px;
  border-bottom: 1px solid #000;
  padding-bottom: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  font-size: 8px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  font-weight: bold;
  margin-right: 5px;
}

.info-value {
  flex: 1;
}

.table-section {
  margin-bottom: 15px;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
}

.receipt-table th,
.receipt-table td {
  border: 1px solid #000;
  padding: 2px 4px;
  text-align: left;
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
  margin-bottom: 15px;
}

.totals-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
}

.total-row.grand-total {
  font-weight: bold;
  font-size: 11px;
  border-top: 2px solid #000;
  padding-top: 3px;
}

.signature-section {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.signature-box {
  text-align: center;
  width: 120px;
}

.signature-line {
  border-bottom: 1px solid #000;
  height: 30px;
  margin-bottom: 5px;
}

.signature-label {
  font-size: 8px;
}

.receipt-footer {
  margin-top: 10px;
  border-top: 1px solid #000;
  padding-top: 8px;
  font-size: 7px;
}

.vertical-cut-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  width: 100%;
  position: relative;
}

.vertical-dashed-line {
  width: 2px;
  height: 100px;
  border-left: 2px dashed #666;
}

.rotate-90 {
  transform: rotate(90deg);
}

@media screen {
  .vertical-cut-line {
    border-top: 2px dashed #666;
    border-bottom: 2px dashed #666;
    padding: 20px 0;
    width: 100%;
    height: auto;
    background: none;
  }
  
  .vertical-dashed-line {
    display: none;
  }
  
  .rotate-90 {
    transform: none;
    margin-top: 10px;
  }
}
`;

interface ServiceItem {
    no: number;
    nama: string;
    qty: string;
    harga_satuan: string;
    diskon: string;
    harga_netto: string;
}

interface PartsItem {
    no: number;
    nama: string;
    qty: string;
    harga_satuan: string;
    diskon: string;
    harga_netto: string;
}

interface ReceiptData {
    nomor: string;
    tanggal: string;
    namaPelanggan: string;
    alamatPelanggan: string;
    telpPelanggan: string;
    npwpPelanggan: string;
    noSpp: string;
    noPolisi: string;
    merkType: string;
    noRangka: string;
    kilometer: string;
    serviceItems: ServiceItem[];
    parts: PartsItem[];
    subtotalJasa: string;
    subtotalParts: string;
    dpp: string;
    ppn: string;
    biayaLain: string;
    grandTotal: string;
    garansi?: string;
}

interface WorkshopReceiptProps {
    data: ReceiptData;
}

const ReceiptSection = ({ data, label }: { data: ReceiptData; label: string }) => {
    return (
        <div className="receipt-section">
            {/* Header */}
            <div className="receipt-header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="toyota-logo">ASTRIDO</div>
                        <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '2px' }}>Authorized TOYOTA Dealer</div>
                        <div className="dealership-name">PT. ASTRIDO JAYA MOBILINDO</div>
                    </div>
                    <div className="header-info">
                        <div style={{ fontSize: '9px' }}>Jl. PERJUANGAN NO. 33 A KEDOYA</div>
                        <div style={{ fontSize: '9px' }}>KEBON JERUK - JAKARTA BARAT</div>
                        <div style={{ fontSize: '9px' }}>Telp: (021) 5300118</div>
                        <div style={{ fontSize: '9px' }}>Fax: (021) 53663798</div>
                        <div style={{ fontSize: '8px' }}>SK Pengurusan Tgl 28 Februari 1992</div>
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
                        <span className="info-label">No. SPP:</span>
                        <span className="info-value">{data.noSpp}</span>
                    </div>
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

            {/* Service Items */}
            <div className="table-section">
                <div className="section-title">Jenis / Item Pekerjaan</div>
                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th className="text-center" style={{ width: '25px' }}>No</th>
                            <th className="text-left">Nama Pekerjaan</th>
                            <th className="text-center" style={{ width: '40px' }}>Qty</th>
                            <th className="text-right" style={{ width: '80px' }}>Harga Satuan</th>
                            <th className="text-right" style={{ width: '50px' }}>Diskon</th>
                            <th className="text-right" style={{ width: '85px' }}>Harga Netto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.serviceItems.map((item, index) => (
                            <tr key={index}>
                                <td className="text-center">{item.no}</td>
                                <td>{item.nama}</td>
                                <td className="text-center">{item.qty}</td>
                                <td className="text-right">{item.harga_satuan}</td>
                                <td className="text-right">{item.diskon}</td>
                                <td className="text-right">{item.harga_netto}</td>
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

            {/* Parts */}
            <div className="table-section">
                <div className="section-title">Pengadaan Suku Cadang & Material</div>
                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th className="text-center" style={{ width: '25px' }}>No</th>
                            <th className="text-left">Nama Suku Cadang</th>
                            <th className="text-center" style={{ width: '40px' }}>Qty</th>
                            <th className="text-right" style={{ width: '80px' }}>Harga Satuan</th>
                            <th className="text-right" style={{ width: '50px' }}>Diskon</th>
                            <th className="text-right" style={{ width: '85px' }}>Harga Netto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.parts.map((item, index) => (
                            <tr key={index}>
                                <td className="text-center">{item.no}</td>
                                <td>{item.nama}</td>
                                <td className="text-center">{item.qty}</td>
                                <td className="text-right">{item.harga_satuan}</td>
                                <td className="text-right">{item.diskon}</td>
                                <td className="text-right">{item.harga_netto}</td>
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

            {/* Garansi */}
            {data.garansi && (
                <div style={{ fontSize: '8px', border: '1px solid #000', padding: '4px', marginBottom: '8px' }}>
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
                        <span>PPN:</span>
                        <span>{data.ppn}</span>
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
                <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '3px' }}>PERHATIAN / ATTENTION:</div>
                <div style={{ fontSize: '8px', lineHeight: '1.3' }}>
                    Pembayaran ini sah apabila pada Nota Bengkel ini telah ditanda tangani oleh kasir kami,
                    dan tanpa coretan. Perusahaan tidak bertanggung jawab atas uang yang dibayarkan yang
                    tidak disertai bukti seperti tersebut diatas.

                </div>
            </div>
        </div>
    );
};

export default function WorkshopReceipt({ data }: WorkshopReceiptProps) {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: printStyles }} />
            <div className="receipt-container">
                <div className="receipt-page-horizontal">
                    <ReceiptSection data={data} label="UNTUK TOKO" />
                    <div className="vertical-cut-line">
                        <div className="vertical-dashed-line"></div>
                    </div>
                    <ReceiptSection data={data} label="UNTUK CUSTOMER" />
                </div>
            </div>
        </>
    );
}
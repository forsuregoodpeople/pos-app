"use client";

import { useState, useEffect } from "react";
import { Clock, Search, Car, Phone, Calendar, Receipt, Eye, Filter, Printer } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useTransaction, Transaction } from "@/hooks/useTransaction";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdvancedAIAnalysis } from "@/hooks/useAdvancedAIAnalysis";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { TransactionDetailModal } from "@/components/history/TransactionDetailModal";
import { PrintReceipt } from "@/components/pos/PrintReceipt";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [printTransaction, setPrintTransaction] = useState<Transaction | null>(null);
    const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("overview");
    const [keterangan, setKeterangan] = useState("");
    const [showKeteranganModal, setShowKeteranganModal] = useState(false);
    const [transactionToPrint, setTransactionToPrint] = useState<Transaction | null>(null);

    const { transactions, loading, error, reload } = useTransaction();

    const filteredTransactions = useTransactionFilters(
        transactions,
        searchQuery,
        customerTypeFilter,
        dateFilter,
        startDate,
        endDate
    );

    const aiAnalysisResponse = useAdvancedAIAnalysis(filteredTransactions);
    const aiData = aiAnalysisResponse.success ? aiAnalysisResponse.data : null;

    const handlePrintWithKeterangan = (transaction: Transaction) => {
        setTransactionToPrint(transaction);
        setKeterangan(transaction.keterangan || "");
        setShowKeteranganModal(true);
    };

    const handleConfirmPrint = () => {
        if (!transactionToPrint) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const subtotal = transactionToPrint.items.reduce((sum, item) => sum + ((item.price * item.qty) - (item.discount || 0)), 0);

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Nota - ${transactionToPrint.invoiceNumber}</title>
                <style>
                    @page { size: A4 portrait; margin: 10mm; }
                    body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.3; margin: 0; padding: 0; }
                    .receipt-section { width: 100%; min-height: 275mm; padding: 10mm; box-sizing: border-box; border: 1px solid #000; page-break-after: always; }
                    .receipt-section:last-child { page-break-after: auto; }
                    .logo-section { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
                    .logo-image { height: 45px; width: auto; }
                    .logo-text { text-align: left; }
                    .dealership-name { font-weight: bold; font-size: 14px; margin-bottom: 2px; }
                    .dealership-subtitle { font-size: 10px; font-weight: bold; }
                    .header-content { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
                    .header-info { text-align: right; font-size: 9px; }
                    .receipt-title { font-weight: bold; font-size: 16px; margin: 6px 0; text-align: center; }
                    .receipt-meta { display: flex; justify-content: space-between; align-items: center; font-size: 10px; margin-top: 4px; }
                    .copy-label { font-style: italic; font-size: 9px; font-weight: bold; }
                    .section-title { font-weight: bold; font-size: 11px; margin-bottom: 3px; border-bottom: 1px solid #000; padding-bottom: 2px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 9px; }
                    .receipt-table { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; }
                    .receipt-table th, .receipt-table td { border: 1px solid #000; padding: 2px 3px; text-align: left; word-wrap: break-word; }
                    .receipt-table th { font-weight: bold; background-color: #f0f0f0; }
                    .receipt-table .text-center { text-align: center; }
                    .receipt-table .text-right { text-align: right; }
                    .subtotal-row td { font-weight: bold; background-color: #f0f0f0; }
                    .totals-grid { display: flex; flex-direction: column; gap: 3px; }
                    .total-row { display: flex; justify-content: space-between; font-size: 10px; }
                    .total-row.grand-total { font-weight: bold; font-size: 11px; border-top: 1px solid #000; padding-top: 3px; margin-top: 3px; }
                    .signature-section { display: flex; justify-content: space-around; margin: 15px 0; }
                    .signature-box { text-align: center; width: 100px; }
                    .signature-line { border-bottom: 1px solid #000; height: 25px; margin-bottom: 4px; }
                    .signature-label { font-size: 9px; }
                    .receipt-footer { margin-top: 8px; border-top: 1px solid #000; padding-top: 5px; font-size: 8px; }
                    .keterangan-section { margin: 5px 3px; padding: 5px 6px; border: 1px solid #000; font-size: 10px; line-height: 1.3; min-height: 55px; background-color: #f9f9f9; }
                    .keterangan-label { font-weight: bold; margin-bottom: 3px; font-size: 9px; }
                    .keterangan-text { white-space: pre-wrap; word-wrap: break-word; min-height: 45px; font-family: 'Courier New', monospace; font-size: 9px; }
                </style>
            </head>
            <body>
                <div class="receipt-section">
                    <div class="receipt-header">
                        <div class="header-content">
                            <div class="logo-section">
                                <img src="/logo.png" alt="Sunda Service Logo" class="logo-image" />
                                <div class="logo-text">
                                    <div class="dealership-name">SUNDA SERVIS</div>
                                    <div class="dealership-subtitle">Automotive Service & Maintenance</div>
                                </div>
                            </div>
                            <div class="header-info">
                                <div style="font-size: 10px;">Jln Panjunan No.112</div>
                                <div style="font-size: 10px;">Cirebon</div>
                                <div style="font-size: 10px;">Telp: 0813-7000-368</div>
                            </div>
                        </div>
                        <div class="receipt-title">NOTA</div>
                        <div class="receipt-meta">
                            <div><strong>Nomor:</strong> ${transactionToPrint.invoiceNumber}</div>
                            <div><strong>Tanggal:</strong> ${new Date(transactionToPrint.savedAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                            <div class="copy-label">UNTUK TOKO</div>
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="section-title">Data Pelanggan</div>
                        <div class="info-grid">
                            <div><span class="info-label">Nama:</span> ${transactionToPrint.customer.name}</div>
                            <div><span class="info-label">No. Telpon:</span> ${transactionToPrint.customer.phone || ''}</div>
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="section-title">Data Kendaraan</div>
                        <div class="info-grid">
                            <div><span class="info-label">No. Polisi:</span> ${transactionToPrint.customer.platNomor || ''}</div>
                            <div><span class="info-label">Merk/Type:</span> ${transactionToPrint.customer.mobil || ''}</div>
                            <div><span class="info-label">Kilometer:</span> ${transactionToPrint.customer.kmMasuk || '0'} km</div>
                        </div>
                    </div>

                    ${transactionToPrint.items.filter(item => item.type === 'service').length > 0 ? `
                    <div class="table-section">
                        <div class="section-title">Jenis / Item Pekerjaan</div>
                        <table class="receipt-table">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width: 25px;">No</th>
                                    <th class="text-left">Nama Pekerjaan</th>
                                    <th class="text-center" style="width: 25px;">Qty</th>
                                    <th class="text-right" style="width: 75px;">Harga Satuan</th>
                                    <th class="text-right" style="width: 50px;">Diskon</th>
                                    <th class="text-right" style="width: 75px;">Harga Netto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactionToPrint.items.filter(item => item.type === 'service').map((item, index) => `
                                    <tr>
                                        <td class="text-center">${index + 1}</td>
                                        <td style="font-size: 8px;">${item.name}</td>
                                        <td class="text-center">${item.qty}</td>
                                        <td class="text-right" style="font-size: 8px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                                        <td class="text-right">Rp ${(item.discount || 0).toLocaleString('id-ID')}</td>
                                        <td class="text-right" style="font-size: 8px;">Rp ${((item.price * item.qty) - (item.discount || 0)).toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="subtotal-row">
                                    <td colspan="5" class="text-right"><strong>Subtotal Jasa:</strong></td>
                                    <td class="text-right"><strong>Rp ${transactionToPrint.items.filter(item => item.type === 'service').reduce((sum, item) => sum + ((item.price * item.qty) - (item.discount || 0)), 0).toLocaleString('id-ID')}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    ` : ''}

                    ${transactionToPrint.items.filter(item => item.type === 'part').length > 0 ? `
                    <div class="table-section">
                        <div class="section-title">Pengadaan Suku Cadang & Material</div>
                        <table class="receipt-table">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width: 25px;">No</th>
                                    <th class="text-left">Nama Suku Cadang</th>
                                    <th class="text-center" style="width: 25px;">Qty</th>
                                    <th class="text-right" style="width: 75px;">Harga Satuan</th>
                                    <th class="text-right" style="width: 50px;">Diskon</th>
                                    <th class="text-right" style="width: 75px;">Harga Netto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactionToPrint.items.filter(item => item.type === 'part').map((item, index) => `
                                    <tr>
                                        <td class="text-center">${index + 1}</td>
                                        <td style="font-size: 8px;">${item.name}</td>
                                        <td class="text-center">${item.qty}</td>
                                        <td class="text-right" style="font-size: 8px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                                        <td class="text-right">Rp ${(item.discount || 0).toLocaleString('id-ID')}</td>
                                        <td class="text-right" style="font-size: 8px;">Rp ${((item.price * item.qty) - (item.discount || 0)).toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="subtotal-row">
                                    <td colspan="5" class="text-right"><strong>Subtotal Parts:</strong></td>
                                    <td class="text-right"><strong>Rp ${transactionToPrint.items.filter(item => item.type === 'part').reduce((sum, item) => sum + ((item.price * item.qty) - (item.discount || 0)), 0).toLocaleString('id-ID')}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    ` : ''}

                    <div class="totals-section">
                        <div class="totals-grid">
                            <div class="total-row">
                                <span>Harga DPP:</span>
                                <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div class="total-row">
                                <span>Biaya Lain:</span>
                                <span>Rp 0</span>
                            </div>
                            <div class="total-row grand-total">
                                <span>GRAND TOTAL:</span>
                                <span>Rp ${transactionToPrint.total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    ${keterangan ? `
                    <div class="keterangan-section">
                        <div class="keterangan-label">KETERANGAN:</div>
                        <div class="keterangan-text">${keterangan}</div>
                    </div>
                    ` : ''}

                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">Paraf Toko</div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">Paraf Customer</div>
                        </div>
                    </div>

                    <div class="receipt-footer">
                        <div style="font-size: 9px; font-weight: bold; margin-bottom: 2px;">PERHATIAN / ATTENTION:</div>
                        <div style="font-size: 8px; line-height: 1.2;">
                            Pembayaran ini sah apabila pada Nota Bengkel ini telah ditanda tangani oleh kasir kami,
                            dan tanpa coretan. Perusahaan tidak bertanggung jawab atas uang yang dibayarkan yang
                            tidak disertai bukti seperti tersebut diatas.
                        </div>
                    </div>
                </div>

                <div class="receipt-section">
                    <div class="receipt-header">
                        <div class="header-content">
                            <div class="logo-section">
                                <img src="/logo.png" alt="Sunda Service Logo" class="logo-image" />
                                <div class="logo-text">
                                    <div class="dealership-name">SUNDA SERVICE</div>
                                    <div class="dealership-subtitle">AUTHORIZED DEALER</div>
                                </div>
                            </div>
                            <div class="header-info">
                                <div style="font-size: 10px;">Jln Panjunan No.112</div>
                                <div style="font-size: 10px;">Cirebon</div>
                                <div style="font-size: 10px;">Telp: (0231) 234997</div>
                            </div>
                        </div>
                        <div class="receipt-title">NOTA BENGKEL</div>
                        <div class="receipt-meta">
                            <div><strong>Nomor:</strong> ${transactionToPrint.invoiceNumber}</div>
                            <div><strong>Tanggal:</strong> ${new Date(transactionToPrint.savedAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                            <div class="copy-label">UNTUK PELANGGAN</div>
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="section-title">Data Pelanggan</div>
                        <div class="info-grid">
                            <div><span class="info-label">Nama:</span> ${transactionToPrint.customer.name}</div>
                            <div><span class="info-label">No. Telpon:</span> ${transactionToPrint.customer.phone || ''}</div>
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="section-title">Data Kendaraan</div>
                        <div class="info-grid">
                            <div><span class="info-label">No. Polisi:</span> ${transactionToPrint.customer.platNomor || ''}</div>
                            <div><span class="info-label">Merk/Type:</span> ${transactionToPrint.customer.mobil || ''}</div>
                            <div><span class="info-label">Kilometer:</span> ${transactionToPrint.customer.kmMasuk || '0'} km</div>
                        </div>
                    </div>

                    ${transactionToPrint.items.filter(item => item.type === 'service').length > 0 ? `
                    <div class="table-section">
                        <div class="section-title">Jenis / Item Pekerjaan</div>
                        <table class="receipt-table">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width: 25px;">No</th>
                                    <th class="text-left">Nama Pekerjaan</th>
                                    <th class="text-center" style="width: 25px;">Qty</th>
                                    <th class="text-right" style="width: 75px;">Harga Satuan</th>
                                    <th class="text-right" style="width: 50px;">Diskon</th>
                                    <th class="text-right" style="width: 75px;">Harga Netto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactionToPrint.items.filter(item => item.type === 'service').map((item, index) => `
                                    <tr>
                                        <td class="text-center">${index + 1}</td>
                                        <td style="font-size: 8px;">${item.name}</td>
                                        <td class="text-center">${item.qty}</td>
                                        <td class="text-right" style="font-size: 8px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                                        <td class="text-right">Rp ${(item.discount || 0).toLocaleString('id-ID')}</td>
                                        <td class="text-right" style="font-size: 8px;">Rp ${((item.price * item.qty) - (item.discount || 0)).toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="subtotal-row">
                                    <td colspan="5" class="text-right"><strong>Subtotal Jasa:</strong></td>
                                    <td class="text-right"><strong>Rp ${transactionToPrint.items.filter(item => item.type === 'service').reduce((sum, item) => sum + ((item.price * item.qty) - (item.discount || 0)), 0).toLocaleString('id-ID')}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    ` : ''}

                    ${transactionToPrint.items.filter(item => item.type === 'part').length > 0 ? `
                    <div class="table-section">
                        <div class="section-title">Pengadaan Suku Cadang & Material</div>
                        <table class="receipt-table">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width: 25px;">No</th>
                                    <th class="text-left">Nama Suku Cadang</th>
                                    <th class="text-center" style="width: 25px;">Qty</th>
                                    <th class="text-right" style="width: 75px;">Harga Satuan</th>
                                    <th class="text-right" style="width: 50px;">Diskon</th>
                                    <th class="text-right" style="width: 75px;">Harga Netto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactionToPrint.items.filter(item => item.type === 'part').map((item, index) => `
                                    <tr>
                                        <td class="text-center">${index + 1}</td>
                                        <td style="font-size: 8px;">${item.name}</td>
                                        <td class="text-center">${item.qty}</td>
                                        <td class="text-right" style="font-size: 8px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                                        <td class="text-right">Rp ${(item.discount || 0).toLocaleString('id-ID')}</td>
                                        <td class="text-right" style="font-size: 8px;">Rp ${((item.price * item.qty) - (item.discount || 0)).toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="subtotal-row">
                                    <td colspan="5" class="text-right"><strong>Subtotal Parts:</strong></td>
                                    <td class="text-right"><strong>Rp ${transactionToPrint.items.filter(item => item.type === 'part').reduce((sum, item) => sum + ((item.price * item.qty) - (item.discount || 0)), 0).toLocaleString('id-ID')}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    ` : ''}

                    <div class="totals-section">
                        <div class="totals-grid">
                            <div class="total-row">
                                <span>Harga DPP:</span>
                                <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div class="total-row">
                                <span>Biaya Lain:</span>
                                <span>Rp 0</span>
                            </div>
                            <div class="total-row grand-total">
                                <span>GRAND TOTAL:</span>
                                <span>Rp ${transactionToPrint.total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    ${keterangan ? `
                    <div class="keterangan-section">
                        <div class="keterangan-label">KETERANGAN:</div>
                        <div class="keterangan-text">${keterangan}</div>
                    </div>
                    ` : ''}

                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">Paraf Toko</div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">Paraf Customer</div>
                        </div>
                    </div>

                    <div class="receipt-footer">
                        <div style="font-size: 9px; font-weight: bold; margin-bottom: 2px;">PERHATIAN / ATTENTION:</div>
                        <div style="font-size: 8px; line-height: 1.2;">
                            Pembayaran ini sah apabila pada Nota Bengkel ini telah ditanda tangani oleh kasir kami,
                            dan tanpa coretan. Perusahaan tidak bertanggung jawab atas uang yang dibayarkan yang
                            tidak disertai bukti seperti tersebut diatas.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);

        setShowKeteranganModal(false);
        setTransactionToPrint(null);
        setKeterangan("");
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original string if invalid date
            }
            return date.toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString; // Return original string if error
        }
    };

    return (
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">History Transaksi</h1>
            </header>

            <div className="p-6">

                {/* Search and Filter Bar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Cari nama, plat nomor, atau no. transaksi..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                                <SelectTrigger className="pl-10 w-40">
                                    <SelectValue placeholder="Tipe Pelanggan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="umum">Umum</SelectItem>
                                    <SelectItem value="perusahaan">Perusahaan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Select value={dateFilter} onValueChange={(value) => {
                                setDateFilter(value);
                                setStartDate("");
                                setEndDate("");
                            }}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Filter Tanggal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Waktu</SelectItem>
                                    <SelectItem value="today">Hari Ini</SelectItem>
                                    <SelectItem value="week">7 Hari Terakhir</SelectItem>
                                    <SelectItem value="month">Bulan Ini</SelectItem>
                                    <SelectItem value="year">Tahun Ini</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Dari tanggal"
                                />
                                <span className="text-gray-500">s/d</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Sampai tanggal"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                        <div className="text-center">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">
                                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada history transaksi"}
                            </p>
                            <p className="text-xs mt-1">
                                {searchQuery ? "Coba kata kunci lain" : "History transaksi akan muncul di sini"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTransactions.map((transaction, index) => (
                            <div key={`${transaction.invoiceNumber}-${index}`} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Receipt className="w-4 h-4 text-blue-600" />
                                            <span className="font-semibold text-gray-900">{transaction.invoiceNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(transaction.savedAt)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-blue-600">
                                            Rp {transaction.total.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-semibold text-blue-600">
                                                    {transaction.customer.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{transaction.customer.name}</div>
                                                {transaction.customer.phone && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Phone className="w-3 h-3" />
                                                        {transaction.customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Car className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-gray-900">{transaction.customer.mobil || '-'}</div>
                                                <div className="text-xs text-gray-500">{transaction.customer.platNomor || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-500">
                                            <span>{transaction.items.length} item</span>
                                            <span className="mx-2">•</span>
                                            <span>{formatDate(transaction.date)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    console.log('Transaction clicked:', transaction);
                                                    setSelectedTransaction(transaction);
                                                }}
                                                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Detail
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handlePrintWithKeterangan(transaction);
                                                }}
                                                className="flex items-center gap-1 px-3 py-1 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                                            >
                                                <Printer className="w-3 h-3" />
                                                Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Transaction Detail Modal */}
            <TransactionDetailModal
                transaction={selectedTransaction}
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
            />

            {/* Print Receipt Modal */}
            {printTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Print Nota</h3>
                            <button
                                onClick={() => setPrintTransaction(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            <PrintReceipt
                                invoiceNumber={printTransaction.invoiceNumber}
                                date={printTransaction.savedAt}
                                customer={{
                                    name: printTransaction.customer.name,
                                    phone: printTransaction.customer.phone,
                                    kmMasuk: printTransaction.customer.kmMasuk,
                                    mobil: printTransaction.customer.mobil,
                                    platNomor: printTransaction.customer.platNomor,
                                    tipe: printTransaction.customer.tipe
                                }}
                                items={printTransaction.items}
                                subtotal={printTransaction.items.reduce((sum, item) => sum + ((item.price * item.qty) - (item.discount || 0)), 0)}
                                biayaLain={0}
                                total={printTransaction.total}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Keterangan Modal */}
            <Dialog open={showKeteranganModal} onOpenChange={setShowKeteranganModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Keterangan Tambahan</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Masukkan keterangan tambahan (opsional)..."
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            rows={4}
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowKeteranganModal(false)}>Batal</Button>
                        <Button onClick={handleConfirmPrint}>Cetak Nota</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    );
}
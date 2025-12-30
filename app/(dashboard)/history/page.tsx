"use client";

import { useState } from "react";
import { Clock, Search, Car, Phone, Calendar, Receipt, Eye, Filter, Printer, Hash, Package, Wrench, Edit2 } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useTransaction, Transaction } from "@/hooks/useTransaction";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdvancedAIAnalysis } from "@/hooks/useAdvancedAIAnalysis";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { TransactionDetailModal } from "@/components/history/TransactionDetailModal";
import { PrintReceipt } from "@/components/pos/PrintReceipt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [printTransaction, setPrintTransaction] = useState<Transaction | null>(null);
    const [printKeterangan, setPrintKeterangan] = useState<string>("");
    const [itemTypeFilter, setItemTypeFilter] = useState<string>("all");

    const { transactions, loading } = useTransaction();
    const filteredTransactions = useTransactionFilters(
        transactions,
        searchQuery,
        customerTypeFilter,
        dateFilter,
        startDate,
        endDate
    ).filter(transaction => {
        if (itemTypeFilter === "all") return true;
        if (itemTypeFilter === "service") {
            return transaction.items.some(item => item.type === "service") &&
                   !transaction.items.some(item => item.type === "part");
        }
        if (itemTypeFilter === "part") {
            return transaction.items.some(item => item.type === "part") &&
                   !transaction.items.some(item => item.type === "service");
        }
        if (itemTypeFilter === "mixed") {
            return transaction.items.some(item => item.type === "service") &&
                   transaction.items.some(item => item.type === "part");
        }
        return true;
    });

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return "-";
        return phone.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    };

    const getCustomerTypeBadge = (type: string) => {
        const config = {
            umum: { label: "Umum", color: "bg-blue-100 text-blue-800" },
            perusahaan: { label: "Perusahaan", color: "bg-purple-100 text-purple-800" }
        };
        const item = config[type as keyof typeof config] || config.umum;
        return (
            <Badge variant="secondary" className={`text-xs font-medium ${item.color} border-0`}>
                {item.label}
            </Badge>
        );
    };

    const getTotalItems = (transaction: Transaction) => {
        return transaction.items.reduce((total, item) => total + item.qty, 0);
    };

    const getGroupedItems = (transaction: Transaction) => {
        const services = transaction.items.filter(item => item.type === "service");
        const parts = transaction.items.filter(item => item.type === "part");
        
        return {
            services: {
                count: services.length,
                totalQty: services.reduce((total, item) => total + item.qty, 0),
                items: services
            },
            parts: {
                count: parts.length,
                totalQty: parts.reduce((total, item) => total + item.qty, 0),
                items: parts
            }
        };
    };

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">History Transaksi</h1>
            </header>

            <div className="p-4 md:p-6">
                {/* Filter Section */}
                <div className="mb-6 space-y-4">
                    {/* Item Type Filter Tabs */}
                    <div className="bg-white border border-gray-200 rounded-lg p-1">
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => setItemTypeFilter("all")}
                                className={`flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                    itemTypeFilter === "all"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Receipt className="w-4 h-4" />
                                    <span>Semua</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setItemTypeFilter("service")}
                                className={`flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                    itemTypeFilter === "service"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Wrench className="w-4 h-4" />
                                    <span>Hanya Jasa</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setItemTypeFilter("part")}
                                className={`flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                    itemTypeFilter === "part"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Package className="w-4 h-4" />
                                    <span>Hanya Barang</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setItemTypeFilter("mixed")}
                                className={`flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                    itemTypeFilter === "mixed"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div className="flex items-center gap-0.5">
                                        <Wrench className="w-3.5 h-3.5" />
                                        <Package className="w-3.5 h-3.5" />
                                    </div>
                                    <span>Campuran</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Cari nama, plat nomor, atau no. transaksi..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                                    <SelectTrigger className="pl-10 w-full sm:w-44 text-sm h-10">
                                        <SelectValue placeholder="Tipe Pelanggan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-sm">Semua Tipe</SelectItem>
                                        <SelectItem value="umum" className="text-sm">Umum</SelectItem>
                                        <SelectItem value="perusahaan" className="text-sm">Perusahaan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                <Select value={dateFilter} onValueChange={(value) => {
                                    setDateFilter(value);
                                    setStartDate("");
                                    setEndDate("");
                                }}>
                                    <SelectTrigger className="w-full sm:w-44 text-sm h-10">
                                        <SelectValue placeholder="Filter Tanggal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-sm">Semua Waktu</SelectItem>
                                        <SelectItem value="today" className="text-sm">Hari Ini</SelectItem>
                                        <SelectItem value="week" className="text-sm">7 Hari Terakhir</SelectItem>
                                        <SelectItem value="month" className="text-sm">Bulan Ini</SelectItem>
                                        <SelectItem value="year" className="text-sm">Tahun Ini</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md text-sm h-10"
                                        placeholder="Dari"
                                    />
                                    <span className="text-gray-500 text-sm">s/d</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md text-sm h-10"
                                        placeholder="Sampai"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Loading transaksi...</div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                        <div className="text-center">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada history transaksi"}
                            </p>
                            <p className="text-xs mt-1">
                                {searchQuery ? "Coba kata kunci lain" : "History transaksi akan muncul di sini"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto border rounded-lg shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        <th className="px-3 py-3 text-left w-12 font-semibold">No</th>
                                        <th className="px-3 py-3 text-left w-32 font-semibold">No. Invoice</th>
                                        <th className="px-3 py-3 text-left w-auto font-semibold">Tanggal</th>
                                        <th className="px-3 py-3 text-left w-auto font-semibold">Customer</th>
                                        <th className="px-3 py-3 text-left w-32 font-semibold">Telp</th>
                                        <th className="px-3 py-3 text-left w-auto font-semibold">Kendaraan</th>
                                        <th className="px-3 py-3 text-left w-auto font-semibold">Item / Qty</th>
                                        <th className="px-3 py-3 text-left w-32 font-semibold">Total</th>
                                        <th className="px-3 py-3 text-left w-28 font-semibold">Pembayaran</th>
                                        <th className="px-3 py-3 text-center w-auto font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTransactions.map((transaction, index) => (
                                        <tr
                                            key={`${transaction.invoiceNumber}-${index}`}
                                            className="hover:bg-gray-50/80 transition-colors"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="text-xs font-medium text-gray-900">
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Receipt className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                                    <span className="text-xs font-medium text-gray-900 truncate">
                                                        {transaction.invoiceNumber}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-xs text-gray-700 whitespace-nowrap">
                                                    {formatDate(transaction.savedAt)}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-[10px] font-semibold text-blue-700">
                                                                {transaction.customer.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-medium text-gray-900 truncate max-w-[150px]">
                                                                {transaction.customer.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {getCustomerTypeBadge(transaction.customer.tipe)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                                                        {formatPhoneNumber(transaction.customer.phone)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Car className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-medium text-gray-900 truncate max-w-[150px]">
                                                                {transaction.customer.mobil || '-'}
                                                            </div>
                                                            <div className="text-[10px] text-gray-600 font-mono">
                                                                {transaction.customer.platNomor || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="space-y-1">
                                                    {(() => {
                                                        const grouped = getGroupedItems(transaction);
                                                        return (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <Wrench className="w-3 h-3 text-blue-500" />
                                                                        <span className="text-xs font-medium text-gray-900">
                                                                            {grouped.services.count}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Package className="w-3 h-3 text-green-500" />
                                                                        <span className="text-xs font-medium text-gray-900">
                                                                            {grouped.parts.count}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Hash className="w-3 h-3 text-gray-400" />
                                                                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                                                        Total: {getTotalItems(transaction)}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-sm font-bold text-blue-700 whitespace-nowrap">
                                                    Rp {transaction.total.toLocaleString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-xs text-gray-700">
                                                    {(transaction as any).paymentTypeName || '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedTransaction(transaction)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setPrintTransaction(transaction);
                                                            setPrintKeterangan(transaction.keterangan || '');
                                                        }}
                                                        className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                                                        title="Print"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            localStorage.setItem('editTransaction', JSON.stringify(transaction));
                                                            window.location.href = '/pos';
                                                        }}
                                                        className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                            {filteredTransactions.map((transaction, index) => (
                                <div
                                    key={`${transaction.invoiceNumber}-${index}-mobile`}
                                    className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Receipt className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-gray-900">
                                                    {transaction.invoiceNumber}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(transaction.savedAt)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-base font-bold text-blue-700">
                                                Rp {transaction.total.toLocaleString('id-ID')}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {getCustomerTypeBadge(transaction.customer.tipe)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t pt-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-semibold text-blue-700">
                                                    {transaction.customer.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 mb-1">
                                                    {transaction.customer.name}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span>{formatPhoneNumber(transaction.customer.phone)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Car className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.customer.mobil || '-'}
                                                </div>
                                                <div className="text-xs text-gray-600 font-mono">
                                                    {transaction.customer.platNomor || '-'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t">
                                            {(() => {
                                                const grouped = getGroupedItems(transaction);
                                                return (
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                    <Wrench className="w-4 h-4 text-blue-500" />
                                                                    <span>Jasa: {grouped.services.count}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                    <Package className="w-4 h-4 text-green-500" />
                                                                    <span>Barang: {grouped.parts.count}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-sm">
                                                                <Hash className="w-4 h-4 text-gray-500" />
                                                                <span className="font-semibold text-blue-700">
                                                                    Total: {getTotalItems(transaction)} qty
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setSelectedTransaction(transaction)}
                                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Detail
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setPrintTransaction(transaction);
                                                                    setPrintKeterangan(transaction.keterangan || '');
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                                Print
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    // Store transaction data in localStorage for editing
                                                                    localStorage.setItem('editTransaction', JSON.stringify(transaction));
                                                                    // Redirect to POS page
                                                                    window.location.href = '/pos';
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
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
                <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Print Nota</h3>
                            <button
                                onClick={() => setPrintTransaction(null)}
                                className="text-gray-500 hover:text-gray-700 p-1"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Keterangan Transaksi
                                </label>
                                <textarea
                                    value={printKeterangan}
                                    onChange={(e) => setPrintKeterangan(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={3}
                                    placeholder="Tambahkan keterangan transaksi..."
                                />
                                <div className="mt-2 text-xs text-gray-500">
                                    Keterangan akan disimpan pada nota yang dicetak
                                </div>
                            </div>
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
                                keterangan={printKeterangan}
                                paymentTypeName={(printTransaction as any).paymentTypeName}
                            />
                        </div>
                    </div>
                </div>
            )}
        </SidebarInset>
    );
}
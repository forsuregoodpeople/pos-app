"use client";

import { useState } from "react";
import { Clock, Search, Car, Phone, Calendar, Receipt, Eye, Filter, Printer, Hash, Package, Wrench, Edit2 } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useTransaction, Transaction } from "@/hooks/useTransaction";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { TransactionDetailModal } from "@/components/history/TransactionDetailModal";
import { PrintReceipt } from "@/components/pos/PrintReceipt";
import { Badge } from "@/components/ui/badge";

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
            umum: { label: "Umum", color: "bg-blue-100 text-blue-800 border-blue-200" },
            perusahaan: { label: "Perusahaan", color: "bg-purple-100 text-purple-800 border-purple-200" }
        };
        const item = config[type as keyof typeof config] || config.umum;
        return (
            <Badge variant="outline" className={`text-xs font-medium ${item.color} border px-2 py-0.5`}>
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
        <SidebarInset className="font-sans bg-gray-50 min-h-screen">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b bg-white px-4 md:px-6 shadow-sm">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold text-gray-800">History Transaksi</h1>
                <div className="ml-auto flex items-center">
                    <span className="text-sm text-gray-600 mr-4 hidden md:inline">
                        {filteredTransactions.length} transaksi ditemukan
                    </span>
                </div>
            </header>

            <div className="p-4 md:p-6">
                {/* Filter Section */}
                <div className="mb-8 space-y-6">
                    {/* Item Type Filter Tabs */}
                    <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => setItemTypeFilter("all")}
                                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${itemTypeFilter === "all"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <Receipt className="w-4 h-4" />
                                <span>Semua</span>
                            </button>
                            <button
                                onClick={() => setItemTypeFilter("service")}
                                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${itemTypeFilter === "service"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <Wrench className="w-4 h-4" />
                                <span>Hanya Jasa</span>
                            </button>
                            <button
                                onClick={() => setItemTypeFilter("part")}
                                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${itemTypeFilter === "part"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <Package className="w-4 h-4" />
                                <span>Hanya Barang</span>
                            </button>
                            <button
                                onClick={() => setItemTypeFilter("mixed")}
                                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${itemTypeFilter === "mixed"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-1">
                                    <Wrench className="w-3.5 h-3.5" />
                                    <Package className="w-3.5 h-3.5" />
                                </div>
                                <span>Campuran</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm">
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Cari nama pelanggan, plat nomor, atau no. transaksi..."
                                />
                            </div>

                            {/* Filter Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipe Pelanggan
                                    </label>
                                    <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                                        <SelectTrigger className="w-full text-sm h-11">
                                            <SelectValue placeholder="Semua Tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all" className="text-sm">Semua Tipe</SelectItem>
                                            <SelectItem value="umum" className="text-sm">Umum</SelectItem>
                                            <SelectItem value="perusahaan" className="text-sm">Perusahaan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Periode
                                    </label>
                                    <Select value={dateFilter} onValueChange={(value) => {
                                        setDateFilter(value);
                                        setStartDate("");
                                        setEndDate("");
                                    }}>
                                        <SelectTrigger className="w-full text-sm h-11">
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
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm h-11 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Akhir
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm h-11 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600">Memuat transaksi...</p>
                        </div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center shadow-sm">
                        <div className="max-w-sm mx-auto">
                            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada transaksi"}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                {searchQuery ? "Coba kata kunci atau filter lainnya" : "Transaksi yang sudah dibuat akan muncul di sini"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <span>No</span>
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Transaksi
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Pelanggan
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Kendaraan
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTransactions.map((transaction, index) => (
                                            <tr key={transaction.invoiceNumber} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Receipt className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {transaction.invoiceNumber}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(transaction.savedAt)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div>
                                                            <div className="font-medium text-gray-900 text-sm">
                                                                {transaction.customer.name}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                                                                <Phone className="w-3 h-3" />
                                                                {formatPhoneNumber(transaction.customer.phone)}
                                                            </div>
                                                        </div>
                                                        {getCustomerTypeBadge(transaction.customer.tipe)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Car className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {transaction.customer.mobil || '-'}
                                                                </div>
                                                                <div className="text-xs text-gray-600 font-mono mt-0.5">
                                                                    {transaction.customer.platNomor || '-'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <Wrench className="w-4 h-4 text-blue-500" />
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {getGroupedItems(transaction).services.count} jasa
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Package className="w-4 h-4 text-green-500" />
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {getGroupedItems(transaction).parts.count} barang
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Hash className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                                                                Total: {getTotalItems(transaction)} qty
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-base font-bold text-blue-700">
                                                        Rp {transaction.total.toLocaleString('id-ID')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedTransaction(transaction)}
                                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                                                            title="Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPrintTransaction(transaction);
                                                                setPrintKeterangan(transaction.keterangan || '');
                                                            }}
                                                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                                                            title="Print"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                localStorage.setItem('editTransaction', JSON.stringify(transaction));
                                                                window.location.href = '/pos';
                                                            }}
                                                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors border border-orange-100"
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
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                            {filteredTransactions.map((transaction, index) => (
                                <div
                                    key={transaction.invoiceNumber}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Receipt className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-gray-900">
                                                    {transaction.invoiceNumber}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(transaction.savedAt)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-700">
                                                Rp {transaction.total.toLocaleString('id-ID')}
                                            </div>
                                            {getCustomerTypeBadge(transaction.customer.tipe)}
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="space-y-3 border-t pt-4">
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

                                        {/* Vehicle Info */}
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Car className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.customer.mobil || '-'}
                                                </div>
                                                <div className="text-xs text-gray-600 font-mono">
                                                    {transaction.customer.platNomor || '-'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Summary */}
                                        <div className="pt-4 border-t">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Wrench className="w-4 h-4 text-blue-500" />
                                                        <span className="font-medium">Jasa:</span>
                                                        <span className="text-gray-900">{getGroupedItems(transaction).services.count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Package className="w-4 h-4 text-green-500" />
                                                        <span className="font-medium">Barang:</span>
                                                        <span className="text-gray-900">{getGroupedItems(transaction).parts.count}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                                                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                                                            <Hash className="w-4 h-4" />
                                                            <span>Total: {getTotalItems(transaction)} qty</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedTransaction(transaction)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Detail
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPrintTransaction(transaction);
                                                        setPrintKeterangan(transaction.keterangan || '');
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    Print
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        localStorage.setItem('editTransaction', JSON.stringify(transaction));
                                                        window.location.href = '/pos';
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors border border-orange-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                            </div>
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
                <>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        .print-modal-wrapper {
                            position: static !important;
                            z-index: 9999 !important;
                            background: white !important;
                            width: 100% !important;
                            height: 100% !important;
                            display: block !important;
                        }
                        .print-modal-wrapper > div {
                            box-shadow: none !important;
                            max-width: none !important;
                            width: 100% !important;
                            height: auto !important;
                            max-height: none !important;
                            border-radius: 0 !important;
                            overflow: visible !important;
                        }
                         /* Hide UI elements */
                        .print-modal-header,
                        .print-modal-input-section,
                        .print-modal-preview-title,
                        .print-modal-footer {
                            display: none !important;
                        }
                        /* Reset preview container */
                        .print-modal-preview-container {
                            background: white !important;
                            padding: 0 !important;
                            border: none !important;
                        }
                        /* Ensure PrintReceipt is visible and defaults are overridden */
                        body * {
                            visibility: hidden;
                        }
                        .print-modal-wrapper, .print-modal-wrapper * {
                            visibility: visible;
                        }
                        .print-modal-wrapper {
                            position: absolute !important;
                            left: 0;
                            top: 0;
                        }
                    }
                `}} />
                    <div className="print-modal-wrapper fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="print-modal-header p-6 border-b flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">Print Nota</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Transaksi: {printTransaction.invoiceNumber}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPrintTransaction(null)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    <div className="print-modal-input-section">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keterangan Transaksi
                                        </label>
                                        <textarea
                                            value={printKeterangan}
                                            onChange={(e) => setPrintKeterangan(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            rows={3}
                                            placeholder="Tambahkan keterangan transaksi yang akan dicetak pada nota..."
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            Keterangan ini akan muncul pada bagian bawah nota yang dicetak
                                        </p>
                                    </div>
                                    <div className="border-t pt-6">
                                        <div className="print-modal-preview-title mb-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview Nota</h4>
                                            <p className="text-xs text-gray-500">
                                                Nota akan dicetak dalam 2 halaman (Toko & Pelanggan)
                                            </p>
                                        </div>
                                        <div className="print-modal-preview-container bg-gray-50 p-4 rounded-lg border">
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
                            </div>
                            <div className="print-modal-footer p-6 border-t bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setPrintTransaction(null)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Cetak Nota
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </SidebarInset>
    );
}
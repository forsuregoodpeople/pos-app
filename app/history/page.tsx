"use client";

import { useState, useEffect } from "react";
import { Clock, Search, Car, Phone, Calendar, Receipt, Eye, Filter } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useTransaction, Transaction } from "@/hooks/useTransaction";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdvancedAIAnalysis } from "@/hooks/useAdvancedAIAnalysis";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { TransactionDetailModal } from "@/components/history/TransactionDetailModal";
import { AdvancedKeyMetrics } from "@/components/history/AdvancedChartComponents";
import { HumanInsightsAnalysis } from "@/components/history/HumanInsightsAnalysis";

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("overview");

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



    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original string if invalid date
            }
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
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
        </SidebarInset>
    );
}
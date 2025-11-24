"use client";

import { useState, useEffect } from "react";
import { Clock, Search, Car, Phone, Calendar, Receipt } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Transaction } from "@/hooks/useTransaction";

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = () => {
        const saved = localStorage.getItem("invoices");
        if (saved) {
            const data = JSON.parse(saved);
            setTransactions(data.sort((a: Transaction, b: Transaction) => 
                new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
            ));
        }
        setLoading(false);
    };

    const filteredTransactions = transactions.filter(transaction =>
        transaction.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customer.platNomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">History Transaksi</h1>
            </header>

            <div className="p-6">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Cari nama, plat nomor, atau no. transaksi..."
                        />
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
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.invoiceNumber} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{transaction.items.length} item</span>
                                        <span>{transaction.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SidebarInset>
    );
}
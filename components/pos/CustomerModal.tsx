"use client";

import React, { useState } from "react";
import { History, Search, Car, Phone } from "lucide-react";
import { CustomerInfo } from "@/hooks/useCustomer";
import { Transaction } from "@/hooks/useTransaction";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CustomerModalProps {
    isOpen: boolean;
    customer: CustomerInfo;
    searchQuery: string;
    customerHistory: Transaction[];
    onClose: () => void;
    onSearchChange: (query: string) => void;
    onSelectHistory: (historyCustomer: CustomerInfo) => void;
    onCustomerChange: (field: keyof CustomerInfo, value: string) => void;
    onSave: () => void;
}

export function CustomerModal({
    isOpen,
    customer,
    searchQuery,
    customerHistory,
    onClose,
    onSearchChange,
    onSelectHistory,
    onCustomerChange,
    onSave,
}: CustomerModalProps) {
    const [showRecap, setShowRecap] = useState(false);

    const groupItemsByCustomer = (transactions: Transaction[]) => {
        const itemGroups: { [key: string]: { name: string; type: string; count: number; lastUsed: string } } = {};

        transactions.forEach(transaction => {
            transaction.items.forEach(item => {
                const key = `${item.name}-${item.type}`;
                if (!itemGroups[key]) {
                    itemGroups[key] = {
                        name: item.name,
                        type: item.type,
                        count: 0,
                        lastUsed: transaction.date
                    };
                }
                itemGroups[key].count += 1;
                if (new Date(transaction.date) > new Date(itemGroups[key].lastUsed)) {
                    itemGroups[key].lastUsed = transaction.date;
                }
            });
        });

        return Object.values(itemGroups).sort((a, b) => b.count - a.count);
    };

    const groupedItems = searchQuery.trim() ? groupItemsByCustomer(customerHistory) : [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto no-print">
                <DialogHeader>
                    <DialogTitle>Data Pelanggan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div>
                        <Label htmlFor="search-customer">Cari Nama atau Plat Nomor</Label>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="search-customer"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Ketik nama atau plat nomor..."
                                className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            History pelanggan akan muncul otomatis saat Anda mengetik
                        </p>
                    </div>

                    {/* History Results */}
                    {customerHistory.length > 0 && (
                        <div className="border rounded-lg">
                            <div className="p-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <History className="w-4 h-4" />
                                        <span>History Ditemukan ({customerHistory.length} transaksi)</span>
                                    </div>
                                    <button
                                        onClick={() => setShowRecap(!showRecap)}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                                    >
                                        {showRecap ? 'Sembunyikan' : 'Lihat'} Rekap
                                    </button>
                                </div>
                            </div>

                            {showRecap && (
                                <div className="p-3 bg-gray-50 border-b">
                                    <div className="text-sm font-semibold mb-2">Rekap Transaksi</div>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="bg-white p-2 rounded border">
                                            <div className="text-gray-500">Total Transaksi</div>
                                            <div className="font-bold text-lg text-blue-600">
                                                {customerHistory.length}
                                            </div>
                                        </div>
                                        <div className="bg-white p-2 rounded border">
                                            <div className="text-gray-500">Total Nilai</div>
                                            <div className="font-bold text-lg text-green-600">
                                                Rp {customerHistory.reduce((sum, inv) => sum + inv.total, 0).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                        <div className="bg-white p-2 rounded border">
                                            <div className="text-gray-500">Rata-rata</div>
                                            <div className="font-bold text-lg text-orange-600">
                                                Rp {Math.round(customerHistory.reduce((sum, inv) => sum + inv.total, 0) / customerHistory.length).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                        <div className="bg-white p-2 rounded border">
                                            <div className="text-gray-500">Total Item</div>
                                            <div className="font-bold text-lg text-purple-600">
                                                {customerHistory.reduce((sum, inv) => sum + inv.items.length, 0)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <div className="text-xs font-semibold text-gray-700">Transaksi Terakhir:</div>
                                        {customerHistory
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .slice(0, 3)
                                            .map((inv, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                                                    <div>
                                                        <div className="font-medium">{new Date(inv.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                        <div className="text-gray-500">{inv.items.length} item</div>
                                                    </div>
                                                    <div className="font-semibold text-blue-600">
                                                        Rp {inv.total.toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <ScrollArea className={`${showRecap ? 'h-32' : 'h-64'} p-3 transition-all duration-200`}>
                                {customerHistory.map((inv, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onSelectHistory(inv.customer)}
                                        className="w-full rounded p-3 text-xs border hover:border-blue-400 hover:bg-blue-50 transition-all text-left mb-2 last:mb-0"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 text-sm">{inv.customer.name}</div>
                                                <div className="text-gray-600 mt-1 flex items-center gap-1">
                                                    <Car className="w-3 h-3" />
                                                    {inv.customer.mobil} • {inv.customer.platNomor}
                                                </div>
                                                {inv.customer.phone && (
                                                    <div className="text-gray-600 mt-1 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {inv.customer.phone}
                                                    </div>
                                                )}
                                                {inv.customer.tipe && (
                                                    <div className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        {inv.customer.tipe}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">
                                                    {new Date(inv.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-gray-600">{inv.items.length} item</span>
                                                <span className="font-semibold text-blue-600">Rp {inv.total.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="space-y-1">
                                                {inv.items.slice(0, 3).map((item, itemIdx) => (
                                                    <div key={itemIdx} className="text-xs text-gray-600 flex items-center gap-1">
                                                        <span className={item.type === 'service' ? 'text-blue-600' : 'text-green-600'}>
                                                            {item.type === 'service' ? 'J' : 'B'}
                                                        </span>
                                                        <span className="truncate">{item.name}</span>
                                                        <span className="text-gray-500 ml-auto">
                                                            {item.qty}x Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                                                        </span>
                                                    </div>
                                                ))}
                                                {inv.items.length > 3 && (
                                                    <div className="text-xs text-gray-500 italic">
                                                        ... dan {inv.items.length - 3} item lainnya
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </ScrollArea>
                        </div>
                    )}

                    {/* Grouped Items Summary */}
                    {groupedItems.length > 0 && (
                        <div className="border rounded-lg">
                            <div className="p-3 border-b">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <History className="w-4 h-4" />
                                    <span>Item/Jasa Sering Dipakai</span>
                                </div>
                            </div>
                            <ScrollArea className="h-48 p-3">
                                <div className="space-y-2">
                                    {groupedItems.slice(0, 8).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${item.type === 'service' ? 'bg-blue-600' : 'bg-green-600'
                                                    }`}>
                                                    {item.type === 'service' ? 'J' : 'B'}
                                                </span>
                                                <div>
                                                    <div className="font-medium text-gray-800">{item.name}</div>
                                                    <div className="text-gray-500">
                                                        Dipakai {item.count}x • Terakhir: {new Date(item.lastUsed).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {searchQuery.trim().length > 0 && customerHistory.length === 0 && (
                        <div className="border rounded-lg p-4 text-center text-sm text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            Tidak ada history untuk &quot;{searchQuery}&quot;
                        </div>
                    )}

                    {/* Customer Form */}

                    <div>
                        <Label htmlFor="tipe">Tipe Customer</Label>

                        <Select value={customer.tipe || ""} onValueChange={(value) => onCustomerChange("tipe", value)}>
                            <SelectTrigger className="w-full mt-2">
                                <SelectValue placeholder="-- Tipe Customer --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Umum">Umum</SelectItem>
                                <SelectItem value="Perusahaan">Perusahaan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Atau isi manual
                        </div>
                        <div>
                            <Label htmlFor="nama-pelanggan">Nama Pelanggan</Label>
                            <Input
                                id="nama-pelanggan"
                                type="text"
                                value={customer.name}
                                onChange={(e) => onCustomerChange("name", e.target.value)}
                                placeholder="Masukkan nama"
                                className="mt-2"
                            />
                            {customer.tipe && (
                                <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Tipe: {customer.tipe}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="plat-nomor">Plat Nomor</Label>
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Wajib</span>
                            </div>
                            <Input
                                id="plat-nomor"
                                type="text"
                                value={customer.platNomor}
                                onChange={(e) => onCustomerChange("platNomor", e.target.value.toUpperCase())}
                                placeholder="E 1234 AB"
                                className="mt-2 uppercase"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="no-hp">No. HP</Label>
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Wajib</span>
                            </div>
                            <Input
                                id="no-hp"
                                type="tel"
                                value={customer.phone}
                                onChange={(e) => onCustomerChange("phone", e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="mt-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="mobil">Kendaraan</Label>
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Wajib</span>
                                </div>
                                <Input
                                    id="mobil"
                                    type="text"
                                    value={customer.mobil}
                                    onChange={(e) => onCustomerChange("mobil", e.target.value)}
                                    placeholder="Avanza"
                                    className="mt-2"
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="km-masuk">KM Masuk</Label>
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Wajib</span>
                                </div>
                                <Input
                                    id="km-masuk"
                                    type="number"
                                    value={customer.kmMasuk}
                                    onChange={(e) => onCustomerChange("kmMasuk", e.target.value)}
                                    placeholder="50000"
                                    className="mt-2"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <Button onClick={onSave} className="w-full mt-4">
                        Simpan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

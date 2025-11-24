"use client";

import React from "react";
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
                            <ScrollArea className="h-64 p-3">
                                {customerHistory.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm font-semibold mb-3 pb-2 border-b">
                                        <History className="w-4 h-4" />
                                        <span>History Ditemukan ({customerHistory.length} transaksi)</span>
                                    </div>
                                )}
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
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">
                                                    {new Date(inv.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs">
                                            <span className="text-gray-600">{inv.items.length} item</span>
                                            <span className="font-semibold text-blue-600">Rp {inv.total.toLocaleString('id-ID')}</span>
                                        </div>
                                    </button>
                                ))}
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
                    <div className="space-y-4 border-t pt-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Atau isi manual
                        </div>
                        <div>
                            <Label htmlFor="nama-pelanggan">Nama Pelanggan *</Label>
                            <Input
                                id="nama-pelanggan"
                                type="text"
                                value={customer.name}
                                onChange={(e) => onCustomerChange("name", e.target.value)}
                                placeholder="Masukkan nama"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="plat-nomor">Plat Nomor</Label>
                            <Input
                                id="plat-nomor"
                                type="text"
                                value={customer.platNomor}
                                onChange={(e) => onCustomerChange("platNomor", e.target.value.toUpperCase())}
                                placeholder="E 1234 AB"
                                className="mt-2 uppercase"
                            />
                        </div>

                        <div>
                            <Label htmlFor="no-hp">No. HP</Label>
                            <Input
                                id="no-hp"
                                type="tel"
                                value={customer.phone}
                                onChange={(e) => onCustomerChange("phone", e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="mobil">Mobil</Label>
                                <Input
                                    id="mobil"
                                    type="text"
                                    value={customer.mobil}
                                    onChange={(e) => onCustomerChange("mobil", e.target.value)}
                                    placeholder="Avanza"
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="km-masuk">KM Masuk</Label>
                                <Input
                                    id="km-masuk"
                                    type="number"
                                    value={customer.kmMasuk}
                                    onChange={(e) => onCustomerChange("kmMasuk", e.target.value)}
                                    placeholder="50000"
                                    className="mt-2"
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

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
import { Badge } from "@/components/ui/badge";
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
        const groups: Record<
            string,
            { name: string; type: string; count: number; lastUsed: string }
        > = {};

        transactions.forEach((tx) => {
            tx.items.forEach((it) => {
                const id = `${it.name}-${it.type}`;
                if (!groups[id]) {
                    groups[id] = {
                        name: it.name,
                        type: it.type,
                        count: 0,
                        lastUsed: tx.date,
                    };
                }
                groups[id].count++;
                if (new Date(tx.date) > new Date(groups[id].lastUsed)) {
                    groups[id].lastUsed = tx.date;
                }
            });
        });

        return Object.values(groups).sort((a, b) => b.count - a.count);
    };

    // Filter history berdasarkan searchQuery
    const filteredHistory = customerHistory.filter((inv) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();
        const customerName = (inv.customer?.name || '').toLowerCase();
        const platNomor = (inv.customer?.platNomor || '').toLowerCase();
        const phone = (inv.customer?.phone || '').toLowerCase();
        const mobil = (inv.customer?.mobil || '').toLowerCase();

        return customerName.includes(query) ||
            platNomor.includes(query) ||
            phone.includes(query) ||
            mobil.includes(query);
    });

    const groupedItems = searchQuery.trim()
        ? groupItemsByCustomer(filteredHistory)
        : [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto no-print">
                <DialogHeader>
                    <DialogTitle>Data Pelanggan</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label>Cari Nama atau Plat Nomor</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Ketik nama atau plat nomor..."
                                className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            History pelanggan muncul otomatis saat mengetik.
                        </p>
                    </div>

                    {/* History Section */}
                    {filteredHistory.length > 0 && (
                        <div className="border rounded-md">
                            <div className="p-3 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <History className="w-4 h-4" />
                                    History ({filteredHistory.length} transaksi)
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowRecap(!showRecap)}
                                >
                                    {showRecap ? "Tutup" : "Rekap"}
                                </Button>
                            </div>

                            {/* Recap */}
                            {showRecap && (
                                <div className="p-3 border-b bg-muted/40 space-y-3">
                                    <div className="text-sm font-semibold">Rekap Transaksi</div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="p-2 bg-white rounded border">
                                            <div className="text-muted-foreground">Total Transaksi</div>
                                            <div className="font-bold text-blue-600 text-lg">
                                                {filteredHistory.length}
                                            </div>
                                        </div>

                                        <div className="p-2 bg-white rounded border">
                                            <div className="text-muted-foreground">Total Nilai</div>
                                            <div className="font-bold text-green-600 text-lg">
                                                Rp{" "}
                                                {filteredHistory
                                                    .reduce((s, t) => s + t.total, 0)
                                                    .toLocaleString("id-ID")}
                                            </div>
                                        </div>

                                        <div className="p-2 bg-white rounded border">
                                            <div className="text-muted-foreground">Rata-rata</div>
                                            <div className="font-bold text-orange-600 text-lg">
                                                Rp{" "}
                                                {Math.round(
                                                    filteredHistory.reduce((s, t) => s + t.total, 0) /
                                                    (filteredHistory.length || 1)
                                                ).toLocaleString("id-ID")}
                                            </div>
                                        </div>

                                        <div className="p-2 bg-white rounded border">
                                            <div className="text-muted-foreground">Total Item</div>
                                            <div className="font-bold text-purple-600 text-lg">
                                                {filteredHistory.reduce(
                                                    (s, t) => s + t.items.length,
                                                    0
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scrollable History */}
                            <ScrollArea
                                className={`${showRecap ? "h-32" : "h-64"} p-3 space-y-2`}
                            >
                                {filteredHistory.map((inv, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onSelectHistory(inv.customer)}
                                        className="w-full text-left border rounded-md p-3 text-xs hover:bg-blue-50 hover:border-blue-400 transition"
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="font-semibold">{inv.customer.name}</div>
                                                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                                    <Car className="w-3 h-3" />
                                                    {inv.customer.mobil} • {inv.customer.platNomor}
                                                </div>

                                                {inv.customer.phone && (
                                                    <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                                        <Phone className="w-3 h-3" />
                                                        {inv.customer.phone}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right text-muted-foreground">
                                                {new Date(inv.date).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </div>
                                        </div>

                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between mb-1">
                                                <span>{inv.items.length} item</span>
                                                <span className="font-semibold text-blue-600">
                                                    Rp {inv.total.toLocaleString("id-ID")}
                                                </span>
                                            </div>

                                            {inv.items.slice(0, 3).map((it, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 text-muted-foreground"
                                                >
                                                    <span
                                                        className={
                                                            it.type === "service"
                                                                ? "text-blue-600"
                                                                : "text-green-600"
                                                        }
                                                    >
                                                        {it.type === "service" ? "J" : "B"}
                                                    </span>
                                                    <span className="truncate">{it.name}</span>
                                                    <span className="ml-auto">
                                                        {it.qty}x Rp{" "}
                                                        {it.price.toLocaleString("id-ID")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </ScrollArea>
                        </div>
                    )}

                    {/* No History */}
                    {searchQuery.trim() && filteredHistory.length === 0 && (
                        <div className="border rounded-md p-6 text-center text-sm text-muted-foreground">
                            <History className="w-10 h-10 mx-auto opacity-20 mb-2" />
                            Tidak ada history untuk "{searchQuery}"
                        </div>
                    )}

                    {/* Grouped Items */}
                    {groupedItems.length > 0 && (
                        <div className="border rounded-md">
                            <div className="p-3 border-b flex items-center gap-2 font-semibold text-sm">
                                <History className="w-4 h-4" /> Item/Jasa Sering Dipakai
                            </div>

                            <ScrollArea className="h-48 p-3 space-y-2">
                                {groupedItems.slice(0, 8).map((it, i) => (
                                    <div
                                        key={i}
                                        className="p-2 bg-gray-50 rounded border text-xs flex justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${it.type === "service" ? "bg-blue-600" : "bg-green-600"
                                                    }`}
                                            >
                                                {it.type === "service" ? "J" : "B"}
                                            </span>
                                            <div>
                                                <div className="font-medium">{it.name}</div>
                                                <div className="text-muted-foreground">
                                                    {it.count}x • Terakhir:{" "}
                                                    {new Date(it.lastUsed).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    )}

                    {/* Customer Form */}
                    <div className="space-y-4">
                        <div className="w-full">
                            <Label>Tipe Customer</Label>
                            <Select
                                value={customer.tipe || ""}
                                onValueChange={(v) => onCustomerChange("tipe", v)}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue placeholder="Pilih tipe customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Umum">Umum</SelectItem>
                                    <SelectItem value="Perusahaan">Perusahaan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <div>
                                <Label>Nama Pelanggan</Label>
                                <Input
                                    value={customer.name}
                                    onChange={(e) => onCustomerChange("name", e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <Label>Plat Nomor</Label>
                                    <Badge variant="destructive" className="text-xs">Wajib</Badge>
                                </div>
                                <Input
                                    value={customer.platNomor}
                                    onChange={(e) =>
                                        onCustomerChange("platNomor", e.target.value.toUpperCase())
                                    }
                                    className="mt-2 uppercase"
                                    placeholder="Contoh: B 1234 ABC"
                                />
                            </div>

                            <div>
                                <Label>No. HP</Label>
                                <Input
                                    value={customer.phone}
                                    onChange={(e) => onCustomerChange("phone", e.target.value)}
                                    className="mt-2"
                                    placeholder="Contoh: 08123456789"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Label>Kendaraan</Label>
                                        <Badge variant="destructive" className="text-xs">Wajib</Badge>
                                    </div>
                                    <Input
                                        value={customer.mobil}
                                        onChange={(e) => onCustomerChange("mobil", e.target.value)}
                                        className="mt-2"
                                        placeholder="Contoh: Toyota Avanza"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Label>KM Masuk</Label>
                                        <Badge variant="destructive" className="text-xs">Wajib</Badge>
                                    </div>
                                    <Input
                                        type="number"
                                        value={customer.kmMasuk}
                                        onChange={(e) => onCustomerChange("kmMasuk", e.target.value)}
                                        className="mt-2"
                                        placeholder="Contoh: 50000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button onClick={onSave} className="w-full">
                        Simpan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
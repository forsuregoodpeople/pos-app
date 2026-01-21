"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface Part {
    id: string;
    name: string;
    price: number;
    purchase_price?: number;
    quantity?: number;
    type?: 'mutasi' | 'bengkel';
    code?: string;
    category?: string;
    displayColumn?: string;
    supplierCode?: string;
    priceCode?: string | number;
}

interface PurchaseProductGridProps {
    parts: Part[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddToCart: (item: { id: string; name: string; price: number; type?: 'mutasi' | 'bengkel'; code?: string }, type: "part") => void;
    cartItems?: Array<{ id: string; qty: number }>;
}

export function PurchaseProductGrid({
    parts,
    searchQuery,
    onSearchChange,
    onAddToCart,
    cartItems = [],
}: PurchaseProductGridProps) {
    const [tempStock, setTempStock] = useState<Record<string, number>>({});
    const [partTypeFilter, setPartTypeFilter] = useState<'all' | 'mutasi' | 'bengkel'>('all');

    useEffect(() => {
        const newStock: Record<string, number> = {};
        parts.forEach(part => {
            const cartQty = cartItems
                .filter(item => item.id === part.id)
                .reduce((total, item) => total + item.qty, 0);
            newStock[part.id] = (part.quantity || 0) + cartQty;
        });
        setTempStock(newStock);
    }, [parts, cartItems]);

    // Reset filter when switching contexts
    useEffect(() => {
        setPartTypeFilter('all');
    }, []);

    const filteredParts = parts.filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(query) ||
            p.code?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            (p.supplierCode && p.supplierCode.toLowerCase().includes(query)) ||
            (p.priceCode && String(p.priceCode).toLowerCase().includes(query));

        const itemType = p.type || 'mutasi'; // Default to mutasi
        const matchesType = partTypeFilter === 'all' || itemType === partTypeFilter;
        return matchesSearch && matchesType;
    });

    const isEmpty = filteredParts.length === 0;

    const formatCurrency = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="flex-1 flex flex-col w-full h-full">
            {/* Search Bar & Filters */}
            <div className="w-full p-4 pb-0 flex flex-col gap-3 flex-shrink-0">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm shadow-sm"
                        placeholder="Cari barang (Nama, Kode)..."
                    />
                </div>

                {/* Filter Chips for Parts */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setPartTypeFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${partTypeFilter === 'all'
                            ? "bg-gray-800 text-white border-gray-800"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setPartTypeFilter('mutasi')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${partTypeFilter === 'mutasi'
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        Mutasi
                    </button>
                    <button
                        onClick={() => setPartTypeFilter('bengkel')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${partTypeFilter === 'bengkel'
                            ? "bg-orange-600 text-white border-orange-600"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        Bengkel
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 w-full auto-rows-max">
                    {isEmpty && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="text-lg font-medium">
                                {searchQuery
                                    ? "Tidak ada hasil"
                                    : "Belum ada data barang"
                                }
                            </div>
                            {!searchQuery && (
                                <div className="text-sm mt-1">
                                    Tambahkan di menu Barang
                                </div>
                            )}
                        </div>
                    )}

                    {filteredParts.map((item) => {
                        const stock = tempStock[item.id] ?? Number(item.quantity ?? 0);
                        const lowStock = stock <= 5;
                        const itemType = item.type || 'mutasi';
                        const displayPrice = item.purchase_price || item.price;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onAddToCart({
                                    id: item.id,
                                    name: item.name,
                                    price: displayPrice,
                                    type: itemType,
                                    code: item.id // ID is the code for parts
                                }, "part")}
                                className={[
                                    "bg-white rounded-lg p-3 shadow-sm hover:shadow-md active:scale-95 transition-all",
                                    "text-left flex flex-col justify-between h-full border border-gray-100 relative overflow-hidden",
                                    "hover:border-green-500 min-h-[100px]"
                                ].join(" ")}
                            >
                                {/* Type indicator badge */}
                                <div className={`absolute top-0 right-0 px-1.5 py-0.5 text-[10px] uppercase font-bold text-white rounded-bl-md ${itemType === 'mutasi' ? 'bg-blue-400' : 'bg-orange-400'
                                    }`}>
                                    {itemType === 'mutasi' ? 'M' : 'B'}
                                </div>

                                <div className="font-medium text-sm text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] pr-4 leading-tight">
                                    {item.name}
                                </div>

                                {/* Internal Code Display - Compact */}
                                {itemType === 'mutasi' && (item.supplierCode || item.priceCode) && (
                                    <div className="mb-2 text-[9px] text-gray-500 font-mono bg-gray-50 px-1 py-0.5 rounded truncate">
                                        {item.supplierCode && <span>{item.supplierCode}</span>}
                                        {item.supplierCode && item.priceCode && <span className="mx-1">|</span>}
                                        {item.priceCode && <span>{item.priceCode}</span>}
                                    </div>
                                )}

                                <div className="mt-auto">
                                    <div className="text-green-600 font-bold text-sm">
                                        {itemType === 'mutasi'
                                            ? (item.displayColumn || 'N/A')
                                            : formatCurrency(displayPrice)
                                        }
                                    </div>

                                    <div
                                        className={[
                                            "text-xs mt-1 flex items-center justify-between",
                                            lowStock ? "text-orange-600 font-medium" : "text-gray-500"
                                        ].join(" ")}
                                    >
                                        <span>Stok:</span>
                                        <span className="font-semibold">{stock}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface Service {
    id: string;
    name: string;
    price: number;
}

interface Part {
    id: string;
    name: string;
    price: number;
    quantity?: number;
    type?: 'mutasi' | 'bengkel';
    code?: string;
    displayColumn?: string;
    supplierCode?: string;
    priceCode?: string | number;
}

interface ProductGridProps {
    activeTab: "services" | "parts";
    services: Service[];
    parts: Part[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddToCart: (
        item: { id: string; name: string; price: number },
        type: "service" | "part"
    ) => void;
    cartItems?: Array<{ id: string; qty: number }>;
}

export default function ProductGrid({
    activeTab,
    services,
    parts,
    searchQuery,
    onSearchChange,
    onAddToCart,
    cartItems = [],
}: ProductGridProps) {
    const [tempStock, setTempStock] = useState<Record<string, number>>({});
    const [partTypeFilter, setPartTypeFilter] = useState<'all' | 'mutasi' | 'bengkel'>('all');

    useEffect(() => {
        const initialStock: Record<string, number> = {};
        parts.forEach(part => {
            initialStock[part.id] = part.quantity || 0;
        });
        setTempStock(initialStock);
    }, [parts]);

    useEffect(() => {
        const newStock: Record<string, number> = {};
        parts.forEach(part => {
            const cartQty = cartItems
                .filter(item => item.id === part.id)
                .reduce((total, item) => total + item.qty, 0);
            newStock[part.id] = Math.max(0, (part.quantity || 0) - cartQty);
        });
        setTempStock(newStock);
    }, [parts, cartItems]);

    // Reset filter when tab changes (optional, but good UX if switching to services)
    useEffect(() => {
        if (activeTab === 'services') {
            setPartTypeFilter('all');
        }
    }, [activeTab]);

    const filteredServices = services.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredParts = parts.filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            p.name.toLowerCase().includes(query) ||
            (p.supplierCode && p.supplierCode.toLowerCase().includes(query)) ||
            (p.priceCode && String(p.priceCode).toLowerCase().includes(query)) ||
            (p.code && p.code.toLowerCase().includes(query)); // Also check standard code

        const itemType = p.type || 'mutasi'; // Default to mutasi
        const matchesType = partTypeFilter === 'all' || itemType === partTypeFilter;
        return matchesSearch && matchesType;
    });

    const filteredPartsWithStock = filteredParts.filter((p) =>
        (p.quantity || 0) > 0
    );

    const displayItems =
        (activeTab === "services" ? filteredServices : filteredPartsWithStock);
    const isEmpty = displayItems.length === 0;

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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                        placeholder={`Cari ${activeTab === "services" ? "jasa" : "barang"} (Nama, Kode)...`}
                    />
                </div>

                {/* Filter Chips for Parts */}
                {activeTab === "parts" && (
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
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full auto-rows-max">
                    {isEmpty && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="text-lg font-medium">
                                {searchQuery
                                    ? "Tidak ada hasil"
                                    : activeTab === "services"
                                        ? "Belum ada data jasa"
                                        : filteredParts.length > 0 && filteredPartsWithStock.length === 0
                                            ? "Semua barang habis"
                                            : "Belum ada data barang"
                                }
                            </div>
                            {!searchQuery && (
                                <div className="text-sm mt-1">
                                    {activeTab === "services"
                                        ? "Tambahkan di menu Data Jasa"
                                        : filteredParts.length > 0 && filteredPartsWithStock.length === 0
                                            ? "Stok barang kosong, silakan tambah stok terlebih dahulu"
                                            : "Tambahkan di menu Data Barang"
                                    }
                                </div>
                            )}
                        </div>
                    )}

                    {displayItems.map((item) => {
                        const isPart = activeTab === "parts";
                        const isService = activeTab === "services";

                        const stock: number = isPart ? Number((item as any).quantity ?? 0) : 0;
                        const lowStock = isPart && stock <= 5;
                        const itemType = (item as any).type || 'mutasi';
                        // Cast to Part to access new fields safely
                        const partItem = item as Part;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onAddToCart(item, isService ? "service" : "part")}
                                className={[
                                    "bg-white rounded-xl p-3 shadow-sm hover:shadow-md active:scale-95 transition-all",
                                    "text-left flex flex-col justify-between h-full border-2 border-transparent relative overflow-hidden",
                                    isService ? "hover:border-blue-500" : "hover:border-green-500"
                                ].join(" ")}
                            >
                                {/* Type indicator badge */}
                                {isPart && (
                                    <div className={`absolute top-0 right-0 px-2 py-0.5 text-[10px] uppercase font-bold text-white rounded-bl-lg ${itemType === 'mutasi' ? 'bg-blue-400' : 'bg-orange-400'
                                        }`}>
                                        {itemType === 'mutasi' ? 'M' : 'B'}
                                    </div>
                                )}

                                <div className="font-medium text-sm text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] pr-4">
                                    {item.name}
                                </div>

                                {/* Internal Code Display */}
                                {isPart && itemType === 'mutasi' && (partItem.supplierCode || partItem.priceCode) && (
                                    <div className="mb-2 text-[10px] text-gray-500 font-mono bg-gray-50 p-1 rounded">
                                        {partItem.supplierCode && <span>{partItem.supplierCode}</span>}
                                        {partItem.supplierCode && partItem.priceCode && <span className="mx-1">|</span>}
                                        {partItem.priceCode && <span>{partItem.priceCode}</span>}
                                    </div>
                                )}

                                <div className="mt-auto">
                                    <div className={(isService ? "text-blue-600" : "text-green-600") + " font-bold text-sm"}>
                                        {(item as any).displayColumn || formatCurrency(item.price)}
                                    </div>

                                    {isPart && (
                                        <div
                                            className={[
                                                "text-xs mt-1 flex items-center justify-between",
                                                lowStock ? "text-orange-600 font-medium" : "text-gray-500"
                                            ].join(" ")}
                                        >
                                            <span>Stok:</span>
                                            <span>{stock}</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
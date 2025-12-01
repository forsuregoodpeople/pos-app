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
    const filteredServices = services.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredParts = parts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            {/* Search Bar */}
            <div className="relative w-full p-4 pb-3 flex-shrink-0">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder={`Cari ${activeTab === "services" ? "jasa" : "barang"}...`}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
                <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full auto-rows-max">
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

                        return (
                            <button
                                key={item.id}
                                onClick={() => onAddToCart(item, isService ? "service" : "part")}
                                className={[
                                    "bg-white rounded-lg p-3 shadow-sm hover:shadow-md active:scale-95 transition-all",
                                    "text-left flex flex-col justify-between h-fit border-2 border-transparent",
                                    isService ? "hover:border-blue-500" : "hover:border-green-500"
                                ].join(" ")}
                            >
                                <div className="font-medium text-sm text-gray-800 mb-1.5 line-clamp-2 min-h-[2.5rem]">
                                    {item.name}
                                </div>

                                <div className={(isService ? "text-blue-600" : "text-green-600") + " font-semibold text-sm"}>
                                    {formatCurrency(item.price)}
                                </div>

                            {isPart && (
                                <div
                                    className={[
                                            "text-xs mt-1",
                                            lowStock ? "text-orange-600 font-medium" : "text-gray-500"
                                        ].join(" ")}
                                    >
                                    Stok: {stock}
                                </div>
                                )}
                            </button>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
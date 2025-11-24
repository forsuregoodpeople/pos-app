"use client";
import React from "react";
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
}

export default function ProductGrid({
    activeTab,
    services,
    parts,
    searchQuery,
    onSearchChange,
    onAddToCart,
}: ProductGridProps) {
    const filteredServices = services.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredParts = parts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayItems =
        activeTab === "services" ? filteredServices : filteredParts;
    const isEmpty = displayItems.length === 0;

    return (
        <div className="flex-1 flex flex-col w-full overflow-hidden">
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

            {/* Products Grid - FULL WIDTH */}
            <div className="flex-1 w-full overflow-y-auto px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                    {isEmpty && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="text-lg font-medium">
                                {searchQuery ? "Tidak ada hasil" : "Belum ada data"}
                            </div>
                            {!searchQuery && (
                                <div className="text-sm mt-1">
                                    Tambahkan di menu Data{" "}
                                    {activeTab === "services" ? "Jasa" : "Barang"}
                                </div>
                            )}
                        </div>
                    )}

                    {displayItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() =>
                                onAddToCart(item, activeTab === "services" ? "service" : "part")
                            }
                            className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left border-2 border-transparent h-full flex flex-col justify-between ${
                                activeTab === "services"
                                    ? "hover:border-blue-500"
                                    : "hover:border-green-500"
                            }`}
                        >
                            <div className="font-medium text-sm text-gray-800 mb-1.5 line-clamp-2 min-h-[2.5rem]">
                                {item.name}
                            </div>
                            <div className={`${activeTab === "services" ? "text-blue-600" : "text-green-600"} font-semibold text-sm`}>
                                Rp {item.price.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
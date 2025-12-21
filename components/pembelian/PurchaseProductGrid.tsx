import React, { useState } from "react";
import { Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PurchaseCartItem } from "@/hooks/usePurchaseCart";

interface PurchaseProductGridProps {
    parts: any[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddToCart: (item: { id: string; name: string; price: number }, type: "part") => void;
    cartItems: PurchaseCartItem[];
    isFullscreen: boolean;
}

export function PurchaseProductGrid({
    parts,
    searchQuery,
    onSearchChange,
    onAddToCart,
    cartItems,
    isFullscreen
}: PurchaseProductGridProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) {
            return { label: "Habis", color: "bg-red-100 text-red-800" };
        } else if (quantity <= 5) {
            return { label: "Rendah", color: "bg-yellow-100 text-yellow-800" };
        }
        return { label: "Tersedia", color: "bg-green-100 text-green-800" };
    };

    const filteredParts = parts.filter(part =>
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 bg-white border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Cari barang..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredParts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Package className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg font-medium">Tidak ada barang ditemukan</p>
                        <p className="text-sm mt-1">Coba kata kunci pencarian lain</p>
                    </div>
                ) : (
                    <div className={`grid gap-4 ${
                        isFullscreen 
                            ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' 
                            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    }`}>
                        {filteredParts.map((part) => {
                            const cartItem = cartItems.find(item => item.id === part.id);
                            const cartQty = cartItem?.qty || 0;
                            const stockStatus = getStockStatus(part.quantity || 0);

                            return (
                                <div
                                    key={part.id}
                                    className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                                    onClick={() => onAddToCart({
                                        id: part.id,
                                        name: part.name,
                                        price: part.purchase_price || part.price || 0
                                    }, "part")}
                                >
                                    {/* Product Image/Placeholder */}
                                    <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                        {part.image ? (
                                            <img 
                                                src={part.image} 
                                                alt={part.name}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        ) : (
                                            <Package className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {part.name}
                                            </h3>
                                            {part.code && (
                                                <p className="text-xs text-gray-500">Kode: {part.code}</p>
                                            )}
                                            {part.category && (
                                                <p className="text-xs text-gray-500">{part.category}</p>
                                            )}
                                        </div>

                                        {/* Stock Status */}
                                        <div className="flex items-center justify-between">
                                            <Badge 
                                                variant="secondary" 
                                                className={`text-xs ${stockStatus.color} border-0`}
                                            >
                                                {stockStatus.label} ({part.quantity || 0})
                                            </Badge>
                                            {cartQty > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                    {cartQty} di keranjang
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="font-bold text-blue-600">
                                            {formatCurrency(part.purchase_price || part.price || 0)}
                                        </div>

                                        {/* Add to Cart Button */}
                                        <Button
                                            size="sm"
                                            className="w-full mt-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToCart({
                                                    id: part.id,
                                                    name: part.name,
                                                    price: part.purchase_price || part.price || 0
                                                }, "part");
                                            }}
                                            disabled={part.quantity === 0}
                                        >
                                            <Package className="w-3 h-3 mr-1" />
                                            Tambah
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
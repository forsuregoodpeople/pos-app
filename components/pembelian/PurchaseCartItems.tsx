import React from "react";
import { ShoppingCart, Plus, Minus, Trash2, Building, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PurchaseCartItem } from "@/hooks/usePurchaseCart";

interface PurchaseCartItemsProps {
    cart: PurchaseCartItem[];
    supplier: any;
    invoiceNumber: string;
    total: number;
    subtotal: number;
    onRemove: (id: string) => void;
    onUpdateQty: (id: string, qty: number) => void;
    onUpdatePrice: (id: string, price: number) => void;
    onUpdateDiscount: (id: string, discount: number) => void;
    onSupplierClick: () => void;
    onCheckout: () => void;
    isMobile: boolean;
}

export function PurchaseCartItems({
    cart,
    supplier,
    invoiceNumber,
    total,
    subtotal,
    onRemove,
    onUpdateQty,
    onUpdatePrice,
    onUpdateDiscount,
    onSupplierClick,
    onCheckout,
    isMobile
}: PurchaseCartItemsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (isMobile) {
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Keranjang Pembelian</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const cartPanel = document.getElementById("mobile-cart");
                                cartPanel?.classList.add("translate-y-full");
                            }}
                        >
                            ✕
                        </Button>
                    </div>

                    {/* Supplier Selection */}
                    <div className="mb-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onSupplierClick}
                        >
                            <Building className="w-4 h-4 mr-2" />
                            {supplier?.name ? supplier.name : "Pilih Supplier"}
                        </Button>
                    </div>

                    {/* Invoice Number */}
                    <div className="text-sm text-gray-600">
                        No. Invoice: <span className="font-mono font-semibold">{invoiceNumber}</span>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Keranjang kosong</p>
                            <p className="text-xs mt-1">Tambah barang untuk memulai</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="bg-white border rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{item.name}</h4>
                                        <div className="text-xs text-gray-500">
                                            {formatCurrency(item.price)} × {item.qty}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemove(item.id)}
                                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Quantity and Price Controls */}
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <Label className="text-xs">Qty</Label>
                                        <div className="flex items-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <Input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 0)}
                                                className="h-8 text-center mx-1"
                                                min="1"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Harga</Label>
                                        <Input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => onUpdatePrice(item.id, parseInt(e.target.value) || 0)}
                                            className="h-8"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Discount */}
                                <div className="mb-2">
                                    <Label className="text-xs">Diskon (%)</Label>
                                    <Input
                                        type="number"
                                        value={item.discount}
                                        onChange={(e) => onUpdateDiscount(item.id, parseFloat(e.target.value) || 0)}
                                        className="h-8"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>

                                {/* Subtotal */}
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-xs text-gray-500">Subtotal:</span>
                                    <span className="font-bold text-sm">
                                        {formatCurrency(item.subtotal)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white space-y-3">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Discount:</span>
                            <span className="text-red-600">
                                {formatCurrency(subtotal - total)}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-blue-600">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <Button
                        onClick={onCheckout}
                        disabled={cart.length === 0 || !supplier?.name?.trim()}
                        className="w-full"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Proses Pembelian
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Keranjang Pembelian</h2>
                    <Badge variant="outline" className="text-xs">
                        {cart.length} item
                    </Badge>
                </div>

                {/* Supplier Selection */}
                <Button
                    variant="outline"
                    className="w-full justify-start mb-3"
                    onClick={onSupplierClick}
                >
                    <Building className="w-4 h-4 mr-2" />
                    {supplier?.name ? supplier.name : "Pilih Supplier"}
                </Button>

                {/* Invoice Number */}
                <div className="text-sm text-gray-600">
                    No. Invoice: <span className="font-mono font-semibold">{invoiceNumber}</span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Keranjang kosong</p>
                        <p className="text-xs mt-1">Tambah barang untuk memulai</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.id} className="bg-gray-50 border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm">{item.name}</h4>
                                    <div className="text-xs text-gray-500">
                                        {formatCurrency(item.price)} × {item.qty}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(item.id)}
                                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Quantity and Price Controls */}
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                    <Label className="text-xs">Qty</Label>
                                    <div className="flex items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 0)}
                                            className="h-8 text-center mx-1"
                                            min="1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs">Harga</Label>
                                    <Input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => onUpdatePrice(item.id, parseInt(e.target.value) || 0)}
                                        className="h-8"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Discount */}
                            <div className="mb-2">
                                <Label className="text-xs">Diskon (%)</Label>
                                <Input
                                    type="number"
                                    value={item.discount}
                                    onChange={(e) => onUpdateDiscount(item.id, parseFloat(e.target.value) || 0)}
                                    className="h-8"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-xs text-gray-500">Subtotal:</span>
                                <span className="font-bold text-sm">
                                    {formatCurrency(item.subtotal)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t space-y-3">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Discount:</span>
                        <span className="text-red-600">
                            {formatCurrency(subtotal - total)}
                        </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                </div>

                <Button
                    onClick={onCheckout}
                    disabled={cart.length === 0 || !supplier?.name?.trim()}
                    className="w-full"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Proses Pembelian
                </Button>
            </div>
        </div>
    );
}
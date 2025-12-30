import React from "react";
import { ShoppingCart, Plus, Minus, Trash2, Building, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    paymentTypes?: any[];
    selectedPaymentTypeId?: string;
    onPaymentTypeChange?: (id: string) => void;
    purchaseDate?: string;
    onDateChange?: (date: string) => void;
    paymentStatus?: 'paid' | 'pending';
    onPaymentStatusChange?: (status: 'paid' | 'pending') => void;
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
    isMobile,
    paymentTypes = [],
    selectedPaymentTypeId = "",
    onPaymentTypeChange = () => {},
    purchaseDate,
    onDateChange,
    paymentStatus = 'pending',
    onPaymentStatusChange = () => {},
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
                    <div className="mb-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onSupplierClick}
                        >
                            <Building className="w-4 h-4 mr-2" />
                            {supplier?.name ? supplier.name : "Pilih Supplier"}
                        </Button>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-3">
                         <Label className="text-xs text-gray-500 mb-1 block">Tanggal Pembelian</Label>
                         <Input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => onDateChange?.(e.target.value)}
                            className="h-9 w-full"
                        />
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
                            <div key={item.id} className="bg-white border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-base">{item.name}</h4>
                                            <span className={`px-2 py-0.5 text-xs font-bold text-white rounded ${
                                                item.type === 'bengkel' ? 'bg-orange-500' : 'bg-blue-500'
                                            }`}>
                                                {item.type === 'bengkel' ? 'B' : 'M'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatCurrency(item.price)} × {item.qty}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemove(item.id)}
                                        className="text-red-500 hover:text-red-700 h-9 w-9 p-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Quantity and Price Controls */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <Label className="text-sm mb-1">Qty</Label>
                                        <div className="flex items-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                                className="h-10 w-10 p-0"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <Input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 0)}
                                                className="h-10 text-center mx-1 text-base"
                                                min="1"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                                className="h-10 w-10 p-0"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm mb-1">Harga</Label>
                                        <Input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => onUpdatePrice(item.id, parseInt(e.target.value) || 0)}
                                            className="h-10 text-base"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Discount */}
                                <div className="mb-3">
                                    <Label className="text-sm mb-1">Diskon (%)</Label>
                                    <Input
                                        type="number"
                                        value={item.discount}
                                        onChange={(e) => onUpdateDiscount(item.id, parseFloat(e.target.value) || 0)}
                                        className="h-10 text-base"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>

                                {/* Subtotal */}
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="text-sm text-gray-500">Subtotal:</span>
                                    <span className="font-bold text-base">
                                        {formatCurrency(item.subtotal)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white space-y-3">
                    {/* Payment Status Selector */}
                    <div className="space-y-1 w-full">
                        <Label className="text-sm">Status Pembayaran</Label>
                        <Select 
                            value={paymentStatus} 
                            onValueChange={(value) => onPaymentStatusChange?.(value as 'paid' | 'pending')}
                        >
                            <SelectTrigger className="w-full h-10 text-base">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paid" className="text-sm font-medium text-green-600">
                                    Lunas (Paid)
                                </SelectItem>
                                <SelectItem value="pending" className="text-sm font-medium text-yellow-600">
                                    Belum Lunas (Hutang)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Type Selector - Always Visible */}
                    <div className="space-y-1 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-sm">Tipe Pembayaran</Label>
                        <Select value={selectedPaymentTypeId} onValueChange={onPaymentTypeChange}>
                            <SelectTrigger className="w-full h-10 text-base">
                                <SelectValue placeholder="Pilih tipe pembayaran" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentTypes.filter(p => p.is_active).map((type) => (
                                    <SelectItem key={type.id} value={type.id} className="text-sm">
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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

                {/* Date Selection */}
                <div className="mb-3">
                    <Label className="text-xs text-gray-500 mb-1 block">Tanggal Pembelian</Label>
                    <Input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => onDateChange?.(e.target.value)}
                        className="h-9 w-full"
                    />
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
                        <div key={item.id} className="bg-gray-50 border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-base">{item.name}</h4>
                                        <span className={`px-2 py-0.5 text-xs font-bold text-white rounded ${
                                            item.type === 'bengkel' ? 'bg-orange-500' : 'bg-blue-500'
                                        }`}>
                                            {item.type === 'bengkel' ? 'B' : 'M'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatCurrency(item.price)} × {item.qty}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(item.id)}
                                    className="text-red-500 hover:text-red-700 h-9 w-9 p-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Quantity and Price Controls */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <Label className="text-sm mb-1">Qty</Label>
                                    <div className="flex items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                            className="h-10 w-10 p-0"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 0)}
                                            className="h-10 text-center mx-1 text-base"
                                            min="1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                            className="h-10 w-10 p-0"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm mb-1">Harga</Label>
                                    <Input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => onUpdatePrice(item.id, parseInt(e.target.value) || 0)}
                                        className="h-10 text-base"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Discount */}
                            <div className="mb-3">
                                <Label className="text-sm mb-1">Diskon (%)</Label>
                                <Input
                                    type="number"
                                    value={item.discount}
                                    onChange={(e) => onUpdateDiscount(item.id, parseFloat(e.target.value) || 0)}
                                    className="h-10 text-base"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-sm text-gray-500">Subtotal:</span>
                                <span className="font-bold text-base">
                                    {formatCurrency(item.subtotal)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t space-y-3">
                {/* Payment Status Selector */}
                <div className="space-y-1 w-full">
                    <Label className="text-sm">Status Pembayaran</Label>
                    <Select 
                        value={paymentStatus} 
                        onValueChange={(value) => onPaymentStatusChange?.(value as 'paid' | 'pending')}
                    >
                        <SelectTrigger className="w-full h-10 text-base">
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="paid" className="text-sm font-medium text-green-600">
                                Lunas (Paid)
                            </SelectItem>
                            <SelectItem value="pending" className="text-sm font-medium text-yellow-600">
                                Belum Lunas (Hutang)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Payment Type Selector - Always Visible */}
                <div className="space-y-1 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm">Tipe Pembayaran</Label>
                    <Select value={selectedPaymentTypeId} onValueChange={onPaymentTypeChange}>
                        <SelectTrigger className="w-full h-10 text-base">
                            <SelectValue placeholder="Pilih tipe pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentTypes.filter(p => p.is_active).map((type) => (
                                <SelectItem key={type.id} value={type.id} className="text-sm">
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

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
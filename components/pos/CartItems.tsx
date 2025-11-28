"use client";

import React, { useState } from "react";
import { ShoppingCart, Trash2, User, Printer, Wrench, Edit2, Check, X } from "lucide-react";
import { CartItem } from "@/hooks/useCart";
import { CustomerInfo } from "@/hooks/useCustomer";

interface CartItemsProps {
    cart: CartItem[];
    customer: CustomerInfo;
    invoiceNumber: string;
    total: number;
    subtotal: number;
    biayaLain: number;
    ppn: number;
    mechanics: { id: string; name: string; percentage: number }[];
    onRemove: (id: string) => void;
    onUpdateQty: (id: string, qty: number) => void;
    onUpdatePrice: (id: string, price: number) => void;
    onUpdateDiscount: (id: string, discount: number) => void;
    onBiayaLainChange: (biayaLain: number) => void;
    onPpnChange: (ppn: number) => void;
    onCustomerClick: () => void;
    onMechanicClick: () => void;
    onCheckout: () => void;
    isMobile?: boolean;
}

export function CartItems({
    cart,
    customer,
    invoiceNumber,
    total,
    subtotal,
    biayaLain,
    ppn,
    mechanics,
    onRemove,
    onUpdateQty,
    onUpdatePrice,
    onUpdateDiscount,
    onBiayaLainChange,
    onPpnChange,
    onCustomerClick,
    onMechanicClick,
    onCheckout,
    isMobile = false,
}: CartItemsProps) {
    const cartServices = cart.filter(item => item.type === "service");
    const cartParts = cart.filter(item => item.type === "part");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingPrice, setEditingPrice] = useState<number>(0);
    const [editingDiscount, setEditingDiscount] = useState<number>(0);

    const QtyButton = ({
        onClick,
        label,
        borderColor
    }: {
        onClick: () => void;
        label: string;
        borderColor: string
    }) => (
        <button
            onClick={onClick}
            className={`w-${isMobile ? "8 h-8" : "7 h-7"} bg-white border ${borderColor} rounded hover:${borderColor === "border-blue-300" ? "bg-blue-100" : "bg-green-100"
                } font-bold text-gray-600 px-2`}
        >
            {label}
        </button>
    );

    const CartItemComponent = ({
        item
    }: {
        item: CartItem;
    }) => {
        const isBlueBorder = item.type === "service";
        const bgColor = isBlueBorder ? "bg-blue-50" : "bg-green-50";
        const borderColor = isBlueBorder ? "border-blue-200" : "border-green-200";
        const textColor = isBlueBorder ? "text-blue-600" : "text-green-600";
        const qtyBorderColor = isBlueBorder ? "border-blue-300" : "border-green-300";

        const handleStartEdit = () => {
            setEditingId(item.id);
            setEditingPrice(item.price);
            setEditingDiscount(item.discount);
        };

        const handleSavePrice = () => {
            if (editingPrice > 0) {
                onUpdatePrice(item.id, editingPrice);
                onUpdateDiscount(item.id, editingDiscount);
                setEditingId(null);
            }
        };

        const handleQuickDiscount = (discountPercent: number) => {
            setEditingDiscount(discountPercent);
        };

        return (
            <div key={item.id} className={`${bgColor} rounded-lg p-3 space-y-2 border ${borderColor}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800">
                            {item.name}
                        </div>
                        {editingId === item.id ? (
                            <div className="space-y-1 mt-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={editingPrice}
                                        onChange={(e) => setEditingPrice(Number(e.target.value))}
                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="Harga baru"
                                    />
                                    <button
                                        onClick={handleSavePrice}
                                        className={`p-1 rounded ${isBlueBorder ? "text-green-600 hover:bg-green-100" : "text-green-600 hover:bg-green-100"}`}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1 rounded text-red-600 hover:bg-red-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Diskon (%):</span>
                                    <input
                                        type="number"
                                        value={editingDiscount}
                                        onChange={(e) => setEditingDiscount(Number(e.target.value))}
                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                    />
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleQuickDiscount(0)}
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                        >
                                            0%
                                        </button>
                                        <button
                                            onClick={() => handleQuickDiscount(5)}
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                        >
                                            5%
                                        </button>
                                        <button
                                            onClick={() => handleQuickDiscount(10)}
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                        >
                                            10%
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-1">
                                <button
                                    onClick={handleStartEdit}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                    Rp {item.price.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    <Edit2 className="w-3 h-3" />
                                </button>
                                {item.discount > 0 && (
                                    <div className="text-xs text-green-600 font-medium">
                                        Diskon: {item.discount}%
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <QtyButton
                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                            label="−"
                            borderColor={qtyBorderColor}
                        />
                        <span className="w-8 text-center font-semibold">{item.qty}</span>
                        <QtyButton
                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                            label="+"
                            borderColor={qtyBorderColor}
                        />
                    </div>
                    <div className="text-right">
                        <div className={`font-bold ${textColor}`}>
                            Rp {((item.price * item.qty) * (1 - item.discount / 100)).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        {item.discount > 0 && (
                            <div className="text-xs text-gray-500 line-through">
                                Rp {(item.price * item.qty).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={`${isMobile ? "h-full" : "h-full"} flex flex-col`}>

                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 p-4 shrink-0">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="text-xs opacity-90">No. Transaksi</div>
                                <div className="font-mono font-bold text-sm">{invoiceNumber}</div>
                            </div>
                        </div>
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-blue-50 border-b p-3 shrink-0">
                    <button
                        onClick={onCustomerClick}
                        className="w-full flex items-center gap-2 text-sm hover:bg-blue-100 rounded-lg p-2 transition-colors"
                    >
                        <User className="w-4 h-4 text-blue-600" />
                        <div className="flex-1 text-left">
                            {customer.name || customer.tipe ? (
                                <>
                                    <div className="font-medium text-gray-800">{customer.name}</div>
                                    <div className="font-medium text-gray-800">{customer.tipe}</div>
                                </>
                            ) : (
                                <div className="text-gray-500">Klik untuk isi data pelanggan</div>
                            )}
                            {customer.platNomor && (
                                <div className="text-xs text-gray-500">
                                    {customer.platNomor} • {customer.phone}
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                {/* Mechanic Info */}
                <div className="bg-green-50 border-b p-3 shrink-0">
                    <button
                        onClick={onMechanicClick}
                        className="w-full flex items-center gap-2 text-sm hover:bg-green-100 rounded-lg p-2 transition-colors"
                    >
                        <Wrench className="w-4 h-4 text-green-600" />
                        <div className="flex-1 text-left">
                            {mechanics.length > 0 ? (
                                <div>
                                    <div className="font-medium text-gray-800">
                                        {mechanics.map(m => m.name).join(", ")}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {mechanics.reduce((t, m) => t + m.percentage, 0)}% total
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500">Klik untuk tambah mekanik</div>
                            )}
                        </div>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingCart className="w-16 h-16 mb-2 opacity-20" />
                            <p className="text-sm">Keranjang masih kosong</p>
                        </div>
                    ) : (
                        <>
                            {cartServices.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">
                                        Jasa ({cartServices.length})
                                    </div>
                                    <div className="space-y-2">
                                        {cartServices.map(item => (
                                            <CartItemComponent key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {cartParts.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">
                                        Barang ({cartParts.length})
                                    </div>
                                    <div className="space-y-2">
                                        {cartParts.map(item => (
                                            <CartItemComponent key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Total & Checkout */}
                <div className="border-t bg-white p-4 space-y-3 shrink-0">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Subtotal</span>
                            <span>
                                Rp {subtotal.toLocaleString("id-ID")}
                            </span>
                        </div>



                        <div className="flex items-center justify-between text-sm">
                            <span>Biaya Lain</span>
                            <input
                                type="number"
                                value={biayaLain || 0}
                                onChange={(e) => onBiayaLainChange(Number(e.target.value))}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                                placeholder="0"
                            />
                        </div>


                    </div>

                    <div className={`flex items-center justify-between ${isMobile ? "text-base" : "text-lg"} font-bold border-t pt-2`}>
                        <span>Grand Total</span>
                        <span className={`${isMobile ? "text-xl" : "text-2xl"} text-blue-600`}>
                            Rp {(total + biayaLain).toLocaleString("id-ID")}
                        </span>
                    </div>

                    <button
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                        className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold ${isMobile ? "py-4 text-base" : "py-4 text-lg"} rounded-lg transition-colors flex items-center justify-center gap-2`}
                    >
                        <Printer className="w-5 h-5" />
                        Checkout & Cetak
                    </button>
                </div>
            </div>
        </>
    );

}

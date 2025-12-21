"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, User, Printer, Wrench, Edit2 } from "lucide-react";
import { CartItem } from "@/hooks/useCart";
import { CustomerInfo } from "@/hooks/useCustomer";
import { PriceEditModal } from "./PriceEditModal";

interface CartItemsProps {
    cart: CartItem[];
    customer: CustomerInfo;
    invoiceNumber: string;
    total: number;
    subtotal: number;
    biayaLain: number;
    ppn: number;
    mechanics: any[];
    onRemove: (id: string) => void;
    onUpdateQty: (id: string, qty: number) => void;
    onUpdatePrice: (id: string, price: number) => void;
    onUpdateDiscount: (id: string, discount: number) => void;
    onBiayaLainChange: (biayaLain: number) => void;
    onPpnChange: (ppn: number) => void;
    onCustomerClick: () => void;
    onMechanicClick: () => void;
    onCheckout: () => void;
    onSaveCart?: () => void;
    onLoadSavedCart?: () => void;
    isMobile?: boolean;
    maxStocks?: { [key: string]: number };
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
    onSaveCart,
    onLoadSavedCart,
    isMobile = false,
    maxStocks = {},
}: CartItemsProps) {
    const cartServices = cart.filter(item => item.type === "service");
    const cartParts = cart.filter(item => item.type === "part");
    const [priceEditModalOpen, setPriceEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);

    // Force re-render when cart changes
    useEffect(() => {
        console.log('Cart updated:', cart);
    }, [cart]);

    const handleSavePrice = (itemId: string, newPrice: number, newDiscount: number) => {
        console.log('handleSavePrice called:', { itemId, newPrice, newDiscount });
        onUpdatePrice(itemId, newPrice);
        onUpdateDiscount(itemId, newDiscount);
        setPriceEditModalOpen(false);
        setEditingItem(null);
    };

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

        const handleEditPrice = () => {
            setEditingItem(item);
            setPriceEditModalOpen(true);
        };

        return (
            <div key={item.id} className={`${bgColor} rounded-lg p-3 space-y-2 border ${borderColor}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800">
                            {item.name}
                        </div>
                        <div className="mt-1">
                            <button
                                onClick={handleEditPrice}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                                Rp {item.price.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                <Edit2 className="w-4 h-4" />
                            </button>
                            {item.discount > 0 && (
                                <div className="text-xs text-green-600 font-medium">
                                    Diskon: Rp {item.discount.toLocaleString('id-ID')}
                                </div>
                            )}
                        </div>
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
                            onClick={() => {
                                const maxStock = maxStocks[item.id] || Infinity;
                                if (item.qty < maxStock) {
                                    onUpdateQty(item.id, item.qty + 1);
                                } else {
                                    // Import toast dynamically to avoid circular dependency
                                    import('sonner').then(({ toast }) => {
                                        toast.error(`Stok ${item.name} tidak mencukupi! Maksimal: ${maxStock}`, {
                                            position: 'top-right',
                                            style: {
                                                background: '#dc2626',
                                                color: 'white',
                                                border: '1px solid #991b1b',
                                            }
                                        });
                                    });
                                }
                            }}
                            label="+"
                            borderColor={qtyBorderColor}
                        />
                    </div>
                    <div className={`font-bold ${textColor}`}>
                        Rp {((item.price * item.qty) - item.discount).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={`h-full flex flex-col ${isMobile ? "fixed inset-0 bg-white z-50" : ""}`}>
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 p-4 shrink-0">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="text-xs opacity-90">Plat Nomor</div>
                                <div className="font-mono font-bold text-sm">
                                    {customer.platNomor || '-'}
                                </div>
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
                            <div className="font-medium text-gray-800">
                                Tambah Pelanggan
                            </div>
                            <div className="text-xs text-gray-600">{invoiceNumber}</div>
                        </div>
                        <Edit2 className="w-4 h-4 text-gray-400" />
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
                            <div className="font-medium text-gray-800">
                                {mechanics.length > 0 
                                    ? `${mechanics.length} Mekanik` 
                                    : "Tambah Mekanik"
                                }
                            </div>
                            {mechanics.length > 0 && (
                                <div className="text-xs text-gray-600">
                                    {mechanics.map(m => m.name).join(", ")}
                                </div>
                            )}
                        </div>
                        <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <div className="text-sm">Keranjang kosong</div>
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
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>
                                Rp {subtotal.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        {biayaLain > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Biaya Lain:</span>
                                <span>
                                    Rp {biayaLain.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="font-bold text-blue-600">
                                Rp {(total + biayaLain).toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-1">
                        {onSaveCart && (
                            <button
                                onClick={onSaveCart}
                                disabled={cart.length === 0}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 text-xs rounded transition-colors flex items-center justify-center gap-1"
                            >
                                <ShoppingCart className="w-3 h-3" />
                                Simpan
                            </button>
                        )}
                        {onLoadSavedCart && (
                            <button
                                onClick={onLoadSavedCart}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 text-xs rounded transition-colors flex items-center justify-center gap-1"
                            >
                                <ShoppingCart className="w-3 h-3" />
                                Muat
                            </button>
                        )}
                        <button
                            onClick={onCheckout}
                            disabled={cart.length === 0}
                            className={`flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium ${isMobile ? "py-3 text-sm" : "py-2 text-xs"} rounded transition-colors flex items-center justify-center gap-1`}
                        >
                            <Printer className="w-3 h-3" />
                            Checkout
                        </button>
                    </div>
                </div>
            </div>

            <PriceEditModal
                isOpen={priceEditModalOpen}
                item={editingItem}
                onClose={() => {
                    setPriceEditModalOpen(false);
                    setEditingItem(null);
                }}
                onSave={handleSavePrice}
            />
        </>
    );
}
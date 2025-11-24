"use client";

import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useCustomer } from "@/hooks/useCustomer";
import { useProducts } from "@/hooks/useProducts";
import { useTransaction } from "@/hooks/useTransaction";
import { useCustomerHistory } from "@/hooks/useCustomerHistory";
import { useMechanics } from "@/hooks/useMechanics";
import { MechanicModal } from "@/components/pos/MechanicModal";
import { TabsComponent } from "@/components/pos/Tabs";
import { CustomerModal } from "@/components/pos/CustomerModal";
import { CartItems } from "@/components/pos/CartItems";
import { PrintReceipt } from "@/components/pos/PrintReceipt";
import ProductGrid from "@/components/pos/ProductGrid";

export default function PointOnSale() {
    const { cart, addToCart, removeFromCart, updateQty, calculateTotal, clearCart } = useCart();
    const { customer, updateCustomer, setCustomerFromHistory, clearCustomer } = useCustomer();
    const { services, parts } = useProducts();
    const { invoiceNumber, date, saveInvoice } = useTransaction();
    const { mechanics, updateMechanics, clearMechanics } = useMechanics();

    const [activeTab, setActiveTab] = useState<"services" | "parts">("services");
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showMechanicModal, setShowMechanicModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const customerHistory = useCustomerHistory(searchQuery);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const handleAddToCart = (item: { id: string; name: string; price: number }, type: "service" | "part") => {
        const itemName = addToCart(item, type);
        toast.success(`${itemName} ditambahkan`);
    };

    const handleSelectCustomer = (historyCustomer: { name: string; phone: string; kmMasuk: string; mobil: string; platNomor: string }) => {
        setCustomerFromHistory(historyCustomer);
        toast.success("Data pelanggan dipilih");
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error("Keranjang masih kosong!");
            return;
        }
        if (!customer.name.trim()) {
            toast.error("Data pelanggan harus diisi!");
            setShowCustomerModal(true);
            return;
        }

        // Save Transaction
        saveInvoice(customer, cart, calculateTotal());
        toast.success("Transaksi berhasil disimpan!");

        // Print
        window.print();

        // Reset
        clearCart();
        clearCustomer();
        clearMechanics();
        setSearchQuery("");
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-receipt,
          .printable-receipt * {
            visibility: visible;
          }
          .printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          * {
            color: black !important;
            background: white !important;
          }
        }
      `}} />

            <CustomerModal
                isOpen={showCustomerModal}
                customer={customer}
                searchQuery={searchQuery}
                customerHistory={customerHistory}
                onClose={() => setShowCustomerModal(false)}
                onSearchChange={setSearchQuery}
                onSelectHistory={handleSelectCustomer}
                onCustomerChange={updateCustomer}
                onSave={() => {
                    setShowCustomerModal(false);
                    setSearchQuery("");
                }}
            />

            <MechanicModal
                isOpen={showMechanicModal}
                mechanics={mechanics}
                onClose={() => setShowMechanicModal(false)}
                onSave={updateMechanics}
            />

            {/* POS Layout */}
            <div className="flex flex-col w-full lg:flex-row h-screen gap-0 no-print relative">
                {/* Left Side - Products with Tabs */}
                <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden lg:mr-96">
                    {/* ^^^ Tambahkan lg:mr-96 untuk memberi ruang ke cart */}

                    {/* Tabs */}
                    <TabsComponent
                        activeTab={activeTab}
                        servicesCount={services.length}
                        partsCount={parts.length}
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={toggleFullscreen}
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            setProductSearchQuery("");
                        }}
                    />

                    {/* Product Grid */}
                    <ProductGrid
                        activeTab={activeTab}
                        services={services}
                        parts={parts}
                        searchQuery={productSearchQuery}
                        onSearchChange={setProductSearchQuery}
                        onAddToCart={handleAddToCart}
                    />
                </div>

                {/* Bottom Cart - Mobile (Fixed) */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shrink-0 lg:hidden z-40 no-print">
                    <button
                        onClick={() => {
                            const cartPanel = document.getElementById('mobile-cart');
                            if (cartPanel) {
                                cartPanel.classList.toggle('translate-y-full');
                            }
                        }}
                        className="w-full p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold">Keranjang ({cart.length})</span>
                        </div>
                        <div className="font-bold text-blue-600">
                            Rp {calculateTotal().toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                    </button>
                </div>

                {/* Mobile Cart Panel */}
                <div
                    id="mobile-cart"
                    className="fixed inset-0 bg-white z-50 transition-transform translate-y-full lg:hidden no-print"
                >
                    <CartItems
                        cart={cart}
                        customer={customer}
                        invoiceNumber={invoiceNumber}
                        total={calculateTotal()}
                        mechanics={mechanics}
                        onRemove={removeFromCart}
                        onUpdateQty={updateQty}
                        onCustomerClick={() => setShowCustomerModal(true)}
                        onMechanicClick={() => setShowMechanicModal(true)}
                        onCheckout={handleCheckout}
                        isMobile={true}
                    />
                </div>

                {/* Desktop Cart (Sidebar) */}
                <div className="hidden lg:flex lg:w-96 bg-white border-l flex-col shadow-lg fixed right-0 top-0 bottom-0 z-30">
                    <CartItems
                        cart={cart}
                        customer={customer}
                        invoiceNumber={invoiceNumber}
                        total={calculateTotal()}
                        mechanics={mechanics}
                        onRemove={removeFromCart}
                        onUpdateQty={updateQty}
                        onCustomerClick={() => setShowCustomerModal(true)}
                        onMechanicClick={() => setShowMechanicModal(true)}
                        onCheckout={handleCheckout}
                        isMobile={false}
                    />
                </div>
            </div>

            {/* Printable Receipt */}
            <PrintReceipt
                invoiceNumber={invoiceNumber}
                date={date}
                customer={customer}
                items={cart}
                total={calculateTotal()}
            />
        </>
    );
}

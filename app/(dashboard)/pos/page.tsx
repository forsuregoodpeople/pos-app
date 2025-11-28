"use client";

import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useCustomer } from "@/hooks/useCustomer";
import { useProducts } from "@/hooks/useProducts";
import { useDataJasa } from "@/hooks/useDataJasa";
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
    const { cart, addToCart, removeFromCart, updateQty, updatePrice, updateDiscount, calculateSubtotal, calculateTotal, clearCart } = useCart();
    const { customer, updateCustomer, setCustomerFromHistory, clearCustomer } = useCustomer();
    const { parts, loading: partsLoading, error: partsError } = useProducts();
    const { items: services, loading: servicesLoading, error: servicesError } = useDataJasa();
    const { invoiceNumber, date, saveInvoice } = useTransaction();
    const { mechanics, updateMechanics, clearMechanics } = useMechanics();

    const [activeTab, setActiveTab] = useState<"services" | "parts">("services");
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showMechanicModal, setShowMechanicModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [ppn, setPpn] = useState(11);
    const [biayaLain, setBiayaLain] = useState(0);

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
        toast.success(`${itemName} ditambahkan`, {
            position: 'bottom-left',
        });
    };

    const handleSelectCustomer = (historyCustomer: { name: string; phone: string; kmMasuk: string; mobil: string; platNomor: string; tipe: string }) => {
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

        const customerWithMechanics = {
            ...customer,
            mekaniks: mechanics.map(m => ({
                name: m.name,
                percentage: m.percentage
            }))
        };

        const subtotal = calculateSubtotal();
        const total = calculateTotal();
        const ppnAmount = (total * ppn) / 100;
        const grandTotal = total + ppnAmount + biayaLain;

        const result = saveInvoice(customerWithMechanics, cart, grandTotal);
       
        toast.success("Transaksi berhasil disimpan!", {
            position: 'bottom-left',
        });

        // Set document title untuk nama file saat print
        const originalTitle = document.title;
        document.title = `Nota_${invoiceNumber.replace(/\//g, '_')}`;
        
        window.print();
        
        // Kembalikan title original
        document.title = originalTitle;

        clearCart();
        clearCustomer();
        clearMechanics();
        setSearchQuery("");
        setPpn(0);
        setBiayaLain(0);
    };

    return (
        <div className="w-full h-screen flex flex-col">
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

            <div className="w-full flex-1 flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
                <div className="flex-1 min-w-0 h-full flex flex-col bg-zinc-50 overflow-hidden">

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

                    <ProductGrid
                        activeTab={activeTab}
                        services={services}
                        parts={parts}
                        searchQuery={productSearchQuery}
                        onSearchChange={setProductSearchQuery}
                        onAddToCart={handleAddToCart}
                    />
                    
                    {/* Loading and Error States */}
                    {(partsLoading || servicesLoading) && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-500">Memuat data...</p>
                            </div>
                        </div>
                    )}
                    
                    {(partsError || servicesError) && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-4">
                                <div className="text-red-500 mb-2">
                                    {partsError || servicesError}
                                </div>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                <div className="lg:w-80 bg-white border-l flex-col shadow-lg">
                    <CartItems
                        cart={cart}
                        customer={customer}
                        invoiceNumber={invoiceNumber}
                        total={calculateTotal()}
                        subtotal={calculateSubtotal()}
                        biayaLain={biayaLain}
                        ppn={ppn}
                        mechanics={mechanics}
                        onRemove={removeFromCart}
                        onUpdateQty={updateQty}
                        onUpdatePrice={updatePrice}
                        onUpdateDiscount={updateDiscount}
                        onBiayaLainChange={setBiayaLain}
                        onPpnChange={setPpn}
                        onCustomerClick={() => setShowCustomerModal(true)}
                        onMechanicClick={() => setShowMechanicModal(true)}
                        onCheckout={handleCheckout}
                        isMobile={false}
                    />
                </div>

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

                <div
                    id="mobile-cart"
                    className="fixed inset-0 bg-white z-50 transition-transform translate-y-full lg:hidden no-print"
                >
                    <CartItems
                        cart={cart}
                        customer={customer}
                        invoiceNumber={invoiceNumber}
                        total={calculateTotal()}
                        subtotal={calculateSubtotal()}
                        biayaLain={biayaLain}
                        ppn={ppn}
                        mechanics={mechanics}
                        onRemove={removeFromCart}
                        onUpdateQty={updateQty}
                        onUpdatePrice={updatePrice}
                        onUpdateDiscount={updateDiscount}
                        onBiayaLainChange={setBiayaLain}
                        onPpnChange={setPpn}
                        onCustomerClick={() => setShowCustomerModal(true)}
                        onMechanicClick={() => setShowMechanicModal(true)}
                        onCheckout={handleCheckout}
                        isMobile={true}
                    />
                </div>
            </div>

            <div className="print-only">
                <PrintReceipt
                    invoiceNumber={invoiceNumber}
                    date={date}
                    customer={customer}
                    items={cart}
                    subtotal={calculateSubtotal()}
                    biayaLain={biayaLain}
                    total={calculateTotal()}
                />
            </div>
        </div>
    );
}
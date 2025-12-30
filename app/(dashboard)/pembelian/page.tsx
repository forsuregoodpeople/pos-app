"use client";

import React, { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, Plus, Edit2, Trash2, Star, Search, Check, X, DollarSign, Package, Building, CreditCard, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { usePurchaseCart } from "@/hooks/usePurchaseCart";
import { useSupplierSelection } from "@/hooks/useSupplierSelection";
import { useProducts } from "@/hooks/useProducts";
import { useDataBarang } from "@/hooks/useDataBarang";
import { usePurchaseTransaction } from "@/hooks/usePurchaseTransaction";
import { useSuppliers } from "@/hooks/usePembelian";
import { usePaymentTypes } from "@/hooks/usePaymentTypes";
import { SupplierModal } from "@/components/pembelian/SupplierModal";
import { PurchaseTabs } from "@/components/pembelian/PurchaseTabs";
import { PurchaseCartItems } from "@/components/pembelian/PurchaseCartItems";
import { PurchaseProductGrid } from "@/components/pembelian/PurchaseProductGrid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function PurchasePage() {
    const { cart, addToCart, removeFromCart, updateQty, updatePrice, updateDiscount, calculateSubtotal, calculateTotal, clearCart } = usePurchaseCart();
    const { supplier, updateSupplier, setSupplierFromHistory, clearSupplier, searchQuery, setSearchQuery } = useSupplierSelection();
    const { parts, loading: partsLoading, error: partsError } = useProducts();
    const { items: barangItems, loading: barangLoading, error: barangError } = useDataBarang();
    const { date, setDate, savePurchase, loading: transactionLoading, error: transactionError } = usePurchaseTransaction();
    const { suppliers } = useSuppliers();
    const { items: paymentTypes, loadPaymentTypes } = usePaymentTypes();

    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [keterangan, setKeterangan] = useState("");
    const [showKeteranganModal, setShowKeteranganModal] = useState(false);
    const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<string>("");
    const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');

    const [invoiceNumber, setInvoiceNumber] = useState("PUR-LOADING");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const d = new Date();
        const timestamp = Date.now() % 1000;
        const newInvoiceNumber = `PUR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(timestamp).padStart(3, "0")}`;
        setInvoiceNumber(newInvoiceNumber);
        
        loadPaymentTypes();
        
        const checkTablet = () => {
            const width = window.innerWidth;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isIPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
            setIsTablet(width >= 768 && width <= 1024 && (isTouchDevice || isIPad));
        };
        
        checkTablet();
        window.addEventListener('resize', checkTablet);
        return () => window.removeEventListener('resize', checkTablet);
    }, [loadPaymentTypes]);

    const toggleFullscreen = async () => {
        setIsFullscreen(v => {
            const next = !v;
            if (!v) {
                document.documentElement.requestFullscreen?.().catch(err => {
                    console.warn('Fullscreen request failed:', err);
                });
            } else {
                document.exitFullscreen?.().catch(err => {
                    console.warn('Exit fullscreen failed:', err);
                });
            }
            return next;
        });
    };

    // add to cart for parts
    const handleAddToCart = (item: { id: string; name: string; price: number }, type: "part") => {
        try {
            const name = addToCart(item);
            toast.success(`${name} ditambahkan`, { position: "bottom-left" });
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error("Gagal menambahkan ke keranjang", { position: "top-right" });
        }
    };

    const handleSelectSupplier = (supplier: any) => {
        updateSupplier(supplier);
        toast.success("Data supplier dipilih");
        setShowSupplierModal(false);
        setSearchQuery("");
    };

    const handleCheckout = () => {
        if (!cart.length) return toast.error("Keranjang masih kosong!");
        if (!supplier?.name?.trim()) {
            setShowSupplierModal(true);
            return toast.error("Data supplier harus diisi!");
        }
        setShowKeteranganModal(true);
    };

    const handleConfirmCheckout = async () => {
        if (!supplier) return;

        // Validation: If status is Paid, payment method is required
        if (paymentStatus === 'paid' && !selectedPaymentTypeId) {
            toast.error("Mohon pilih tipe pembayaran untuk status Lunas", { position: "bottom-left" });
            return;
        }

        try {
            const keterangan = `Pembelian dari ${supplier.name}`;
            const subtotal = calculateSubtotal();
            const total = calculateTotal();

            // Pass selectedPaymentTypeId to savePurchase
            // If ID exists -> Paid, If empty -> Pending (Debt)
            // Pass selectedPaymentTypeId to savePurchase
            // If ID exists -> Paid, If empty -> Pending (Debt)
            const saved = await savePurchase(
                supplier, 
                cart.map(item => ({...item, code: item.code})), // Ensure code is passed if savePurchase expects it, or if it uses the cart item directly
                total, 
                keterangan, 
                selectedPaymentTypeId,
                paymentStatus
            );
            
            if (!saved) throw new Error("save failed");

            if (paymentStatus === 'paid') {
                toast.success("Pembelian berhasil disimpan (Lunas)!", { position: "bottom-left" });
            } else {
                toast.success("Pembelian disimpan sebagai Hutang (Pending)!", { position: "bottom-left" });
            }

            // removed print logic

            // reset state
            clearCart();
            clearSupplier();
            setSearchQuery("");
            setKeterangan("");
            setShowKeteranganModal(false);
            setPaymentStatus("pending");
            setSelectedPaymentTypeId("");

            // reload page
            window.location.reload();
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error("Gagal menyimpan pembelian!", { position: "bottom-left" });
        }
    };

    // Error handling
    // Error logging
    useEffect(() => {
        const errors = {
            partsError,
            barangError,
            transactionError
        };
        const activeErrors = Object.entries(errors)
            .filter(([_, v]) => v)
            .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

        if (Object.keys(activeErrors).length > 0) {
            console.error('Data loading errors:', activeErrors);
        }
    }, [partsError, barangError, transactionError]);

    if (!isClient) {
        return (
            <SidebarInset className="font-sans">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </SidebarInset>
        );
    }

    return (
        <SidebarInset className="font-sans">
            <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
                {/* Tablet Layout - Side by Side */}
                {isTablet ? (
                    <>
                        {/* Top Tabs */}
                        <div className="bg-white border-b">
                            <PurchaseTabs
                                isFullscreen={isFullscreen}
                                onToggleFullscreen={toggleFullscreen}
                                partsCount={parts?.length ?? 0}
                            />
                        </div>
                        
                        {/* Main Content - Side by Side */}
                        <div className="flex-1 flex flex-row overflow-hidden">
                            {/* Product Grid - Left Side */}
                            <div className="flex-1 min-w-0 h-full bg-zinc-50 overflow-hidden">
                                <PurchaseProductGrid
                                    parts={parts ?? []}
                                    searchQuery={productSearchQuery}
                                    onSearchChange={setProductSearchQuery}
                                    onAddToCart={handleAddToCart}
                                    cartItems={cart}
                                />
                            </div>
                            
                            {/* Cart - Right Side */}
                            <aside className="w-96 bg-white border-l flex flex-col shadow-lg">
                                <PurchaseCartItems
                                    cart={cart}
                                    supplier={supplier}
                                    invoiceNumber={invoiceNumber}
                                    total={calculateTotal()}
                                    subtotal={calculateSubtotal()}
                                    onRemove={removeFromCart}
                                    onUpdateQty={updateQty}
                                    onUpdatePrice={updatePrice}
                                    onUpdateDiscount={updateDiscount}
                                    onSupplierClick={() => setShowSupplierModal(true)}
                                    onCheckout={handleCheckout}
                                    isMobile={false}
                                    paymentTypes={paymentTypes}
                                    selectedPaymentTypeId={selectedPaymentTypeId}
                                    onPaymentTypeChange={setSelectedPaymentTypeId}
                                    purchaseDate={date}
                                    onDateChange={setDate}
                                    paymentStatus={paymentStatus}
                                    onPaymentStatusChange={setPaymentStatus}
                                />
                            </aside>
                        </div>
                    </>
                ) : (
                    /* Desktop Layout - Default */
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        <div className="flex-1 min-w-0 h-full flex flex-col bg-zinc-50 overflow-hidden">
                            <PurchaseTabs
                                isFullscreen={isFullscreen}
                                onToggleFullscreen={toggleFullscreen}
                                partsCount={parts?.length ?? 0}
                            />

                            <PurchaseProductGrid
                                parts={parts ?? []}
                                searchQuery={productSearchQuery}
                                onSearchChange={setProductSearchQuery}
                                onAddToCart={handleAddToCart}
                                cartItems={cart}
                            /></div>

                        <aside className="lg:w-96 bg-white border-l flex flex-col shadow-lg">
                            <PurchaseCartItems
                                cart={cart}
                                supplier={supplier}
                                invoiceNumber={invoiceNumber}
                                total={calculateTotal()}
                                subtotal={calculateSubtotal()}
                                onRemove={removeFromCart}
                                onUpdateQty={updateQty}
                                onUpdatePrice={updatePrice}
                                onUpdateDiscount={updateDiscount}
                                onSupplierClick={() => setShowSupplierModal(true)}
                                onCheckout={handleCheckout}
                                isMobile={false}
                                paymentTypes={paymentTypes}
                                selectedPaymentTypeId={selectedPaymentTypeId}
                                onPaymentTypeChange={setSelectedPaymentTypeId}
                                purchaseDate={date}
                                onDateChange={setDate}
                                paymentStatus={paymentStatus}
                                onPaymentStatusChange={setPaymentStatus}
                            />
                        </aside>

                        {/* mobile bottom bar */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shrink-0 lg:hidden z-40 no-print">
                            <button
                                onClick={() => {
                                    const cartPanel = document.getElementById("mobile-cart");
                                    cartPanel?.classList.toggle("translate-y-full");
                                }}
                                className="w-full p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold">Keranjang ({cart.length})</span>
                                </div>
                                <div className="font-bold text-blue-600">
                                    Rp {calculateTotal().toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                            </button>
                        </div>

                        <div id="mobile-cart" className="fixed inset-0 bg-white z-50 transition-transform translate-y-full lg:hidden no-print">
                            <PurchaseCartItems
                                cart={cart}
                                supplier={supplier}
                                invoiceNumber={invoiceNumber}
                                total={calculateTotal()}
                                subtotal={calculateSubtotal()}
                                onRemove={removeFromCart}
                                onUpdateQty={updateQty}
                                onUpdatePrice={updatePrice}
                                onUpdateDiscount={updateDiscount}
                                onSupplierClick={() => setShowSupplierModal(true)}
                                onCheckout={handleCheckout}
                                isMobile={true}
                                purchaseDate={date}
                                onDateChange={setDate}
                                paymentStatus={paymentStatus}
                                onPaymentStatusChange={setPaymentStatus}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <SupplierModal
                isOpen={showSupplierModal}
                supplier={supplier}
                searchQuery={searchQuery}
                suppliers={suppliers}
                onClose={() => setShowSupplierModal(false)}
                onSearchChange={setSearchQuery}
                onSupplierChange={updateSupplier}
                onSave={() => {
                    setShowSupplierModal(false);
                    setSearchQuery("");
                }}
            />

            <Dialog open={showKeteranganModal} onOpenChange={setShowKeteranganModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Keterangan Pembelian</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Masukkan keterangan pembelian (opsional)..."
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            rows={4}
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowKeteranganModal(false)}>Batal</Button>
                        <Button onClick={handleConfirmCheckout}>Proses Pembelian</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </SidebarInset>
    );
}
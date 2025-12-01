"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useCustomer } from "@/hooks/useCustomer";
import { useProducts } from "@/hooks/useProducts";
import { useDataBarang } from "@/hooks/useDataBarang";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function PointOnSale() {
    const { cart, addToCart, removeFromCart, updateQty, updatePrice, updateDiscount, calculateSubtotal, calculateTotal, clearCart } = useCart();
    const { customer, updateCustomer, setCustomerFromHistory, clearCustomer } = useCustomer();
    const { parts, loading: partsLoading, error: partsError } = useProducts();
    const { items: services, loading: servicesLoading, error: servicesError } = useDataJasa();
    const { items: barangItems, loading: barangLoading, error: barangError } = useDataBarang();
    const { date, saveInvoice, loading: transactionLoading, error: transactionError } = useTransaction();
    const { mechanics, updateMechanics, clearMechanics } = useMechanics();

    const [activeTab, setActiveTab] = useState<"services" | "parts">("services");
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showMechanicModal, setShowMechanicModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const customerHistory = useCustomerHistory(searchQuery);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [ppn, setPpn] = useState<number>(11);
    const [biayaLain, setBiayaLain] = useState<number>(0);
    const [keterangan, setKeterangan] = useState("");
    const [showKeteranganModal, setShowKeteranganModal] = useState(false);

    const [invoiceNumber, setInvoiceNumber] = useState("INV-LOADING");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const d = new Date();
        const rand = Math.floor(Math.random() * 1000) + 1;
        const newInvoiceNumber = `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(rand).padStart(3, "0")}`;
        setInvoiceNumber(newInvoiceNumber);
    }, []);

    const toggleFullscreen = () => {
        setIsFullscreen(v => {
            const next = !v;
            if (!v) document.documentElement.requestFullscreen?.();
            else document.exitFullscreen?.();
            return next;
        });
    };

    // add to cart with stock check for parts
    const handleAddToCart = (item: { id: string; name: string; price: number }, type: "service" | "part") => {
        try {
            if (type === "part") {
                const barang = barangItems.find(b => b.id === item.id);
                const existing = cart.find(c => c.id === item.id);
                const willQty = (existing?.qty ?? 0) + 1;
                if (barang && willQty > (barang.quantity ?? 0)) {
                    toast.error(`Stok ${item.name} tidak mencukupi! Tersedia: ${barang.quantity ?? 0}, Diminta: ${willQty}`, { position: "top-right" });
                    return;
                }
            }

            const name = addToCart(item, type);
            toast.success(`${name} ditambahkan`, { position: "bottom-left" });
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error("Gagal menambahkan ke keranjang", { position: "top-right" });
        }
    };

    const handleSelectCustomer = (historyCustomer: any) => {
        setCustomerFromHistory(historyCustomer);
        toast.success("Data pelanggan dipilih");
        setShowCustomerModal(false);
        setSearchQuery("");
    };

    const handleCheckout = () => {
        if (!cart.length) return toast.error("Keranjang masih kosong!");
        if (!customer?.name?.trim()) {
            setShowCustomerModal(true);
            return toast.error("Data pelanggan harus diisi!");
        }
        setShowKeteranganModal(true);
    };

    const handleConfirmCheckout = async () => {
        try {
            // stok final check
            const partsToUpdate = cart.filter(i => i.type === "part");
            for (const p of partsToUpdate) {
                const barang = barangItems.find(b => b.id === p.id);
                if (barang && p.qty > (barang.quantity ?? 0)) {
                    return toast.error(`Stok ${barang.name} tidak mencukupi! Tersedia: ${barang.quantity}, Diminta: ${p.qty}`);
                }
            }

            const customerWithMechanics = {
                ...customer,
                mekaniks: mechanics.length ? mechanics.map(m => ({ name: m.name, percentage: m.percentage })) : []
            };

            const subtotal = calculateSubtotal();
            const total = calculateTotal(); // asumsi calculateTotal sudah menghitung PPN kalau diperlukan
            const grandTotal = total + (biayaLain ?? 0);

            const saved = await saveInvoice(customerWithMechanics, cart, grandTotal, keterangan);
            if (!saved) throw new Error("save failed");

            toast.success("Transaksi berhasil disimpan!", { position: "bottom-left" });

            const originalTitle = document.title;
            document.title = `Nota_${invoiceNumber.replace(/\//g, "_")}`;
            window.print();
            document.title = originalTitle;

            // reset state
            clearCart();
            clearCustomer();
            clearMechanics();
            setSearchQuery("");
            setPpn(0);
            setBiayaLain(0);
            setKeterangan("");
            setShowKeteranganModal(false);

            // reload page is kept (mirip behavior sebelumnya)
            window.location.reload();
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error("Gagal menyimpan transaksi!", { position: "bottom-left" });
        }
    };

    // helper map of stocks for CartItems (defensive)
    const maxStocks = barangItems?.reduce((acc: Record<string, number>, it: any) => {
        if (it?.id) acc[it.id] = it.quantity ?? 0;
        return acc;
    }, {}) ?? {};

    // Error handling
    if (partsError || servicesError || barangError || transactionError) {
        console.error('Data loading errors:', { partsError, servicesError, barangError, transactionError });
    }

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

            <Dialog open={showKeteranganModal} onOpenChange={setShowKeteranganModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Keterangan Tambahan</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Masukkan keterangan tambahan (opsional)..."
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            rows={4}
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowKeteranganModal(false)}>Batal</Button>
                        <Button onClick={handleConfirmCheckout}>Checkout & Cetak</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="w-full flex-1 flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
                <div className="flex-1 min-w-0 h-full flex flex-col bg-zinc-50 overflow-hidden">
                    <TabsComponent
                        activeTab={activeTab}
                        servicesCount={services?.length ?? 0}
                        partsCount={parts?.length ?? 0}
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={toggleFullscreen}
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            setProductSearchQuery("");
                        }}
                    />



                    <ProductGrid
                        activeTab={activeTab}
                        services={services ?? []}
                        parts={parts ?? []}
                        searchQuery={productSearchQuery}
                        onSearchChange={setProductSearchQuery}
                        onAddToCart={handleAddToCart}
                        cartItems={cart}
                    />
                </div>

                <aside className="lg:w-80 bg-white border-l flex flex-col shadow-lg">
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
                        maxStocks={maxStocks}
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
                        maxStocks={maxStocks}
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
                    keterangan={keterangan}
                />
            </div>
        </div>
    );
}

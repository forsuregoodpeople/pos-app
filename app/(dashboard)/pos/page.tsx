"use client";

import React, { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, Plus, Edit2, Trash2, Star, Search, Check, X, DollarSign, FileText, Clock, Wrench, Package, Users, LogOut, Shield, Settings, UserCheck, Receipt, BookOpen, Building, CreditCard, BarChart3, History } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useCustomer } from "@/hooks/useCustomer";
import { useProducts } from "@/hooks/useProducts";
import { useDataBarang } from "@/hooks/useDataBarang";
import { useDataJasa } from "@/hooks/useDataJasa";
import { useTransaction } from "@/hooks/useTransaction";
import { getNextInvoiceNumberAction } from "@/services/data-transaksi/data-transaksi";
import { useCustomerHistory } from "@/hooks/useCustomerHistory";
import { useMechanics } from "@/hooks/useMechanics";
import { MechanicModal } from "@/components/pos/MechanicModal";
import { TabsComponent } from "@/components/pos/Tabs";
import { CustomerModal } from "@/components/pos/CustomerModal";
import { CartItems } from "@/components/pos/CartItems";
import { PrintReceipt } from "@/components/pos/PrintReceipt";
import { EditTransactionModal } from "@/components/pos/EditTransactionModal";
import ProductGrid from "@/components/pos/ProductGrid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { usePaymentTypes } from "@/hooks/usePaymentTypes";

export default function PointOnSale() {
    const { cart, addToCart, addToCartWithQty, removeFromCart, updateQty, updatePrice, updateDiscount, calculateSubtotal, calculateTotal, clearCart } = useCart();
    const { customer, updateCustomer, setCustomerFromHistory, clearCustomer } = useCustomer();
    const { parts, loading: partsLoading, error: partsError } = useProducts();
    const { items: services, loading: servicesLoading, error: servicesError } = useDataJasa();
    const { items: barangItems, loading: barangLoading, error: barangError } = useDataBarang();
    const { date, saveInvoice, updateTransaction, transactions, loading: transactionLoading, error: transactionError } = useTransaction();
    const { mechanics, updateMechanics, clearMechanics } = useMechanics();

    const [activeTab, setActiveTab] = useState<"services" | "parts">("services");
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showMechanicModal, setShowMechanicModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const customerHistory = useCustomerHistory(searchQuery);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [ppn, setPpn] = useState<number>(11);
    const [biayaLain, setBiayaLain] = useState<number>(0);
    const [keterangan, setKeterangan] = useState("");
    const [showKeteranganModal, setShowKeteranganModal] = useState(false);
    const [savedCarts, setSavedCarts] = useState<any[]>([]);
    const [showSavedCartsModal, setShowSavedCartsModal] = useState(false);
    const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingInvoiceNumber, setEditingInvoiceNumber] = useState<string | null>(null);
    const { items: paymentTypes, loadPaymentTypes } = usePaymentTypes();
    const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<string>("");
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
    const [bankName, setBankName] = useState("");
    const [cardNumber, setCardNumber] = useState("");

    const [invoiceNumber, setInvoiceNumber] = useState("INV-LOADING");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Get next invoice number from server
        getNextInvoiceNumberAction().then((nextInvoice) => {
            setInvoiceNumber(nextInvoice);
        }).catch((error) => {
            console.error('Error getting next invoice number:', error);
            // Fallback to timestamp-based if server action fails
            const d = new Date();
            const timestamp = Date.now() % 1000;
            const fallbackInvoice = `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(timestamp).padStart(3, "0")}`;
            setInvoiceNumber(fallbackInvoice);
        });

        // Detect tablet/iPad
        const checkTablet = () => {
            const width = window.innerWidth;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isIPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
            setIsTablet(width >= 768 && width <= 1024 && (isTouchDevice || isIPad));
        };

        checkTablet();
        window.addEventListener('resize', checkTablet);

        // Load payment types
        loadPaymentTypes().then((types) => {
            const defaultType = types.find(t => t.is_default);
            if (defaultType) {
                setSelectedPaymentTypeId(defaultType.id);
            } else if (types.length > 0) {
                setSelectedPaymentTypeId(types[0].id);
            }
        });

        return () => window.removeEventListener('resize', checkTablet);
    }, [loadPaymentTypes]);

    const handleEditTransaction = (transaction: any) => {
        try {
            // Clear current state first
            clearCart();
            clearCustomer();
            clearMechanics();

            // Load transaction data into form
            if (transaction.customer) {
                setCustomerFromHistory(transaction.customer);
            }
            if (transaction.customer.mekaniks && transaction.customer.mekaniks.length > 0) {
                updateMechanics(transaction.customer.mekaniks);
            }
            if (transaction.items && transaction.items.length > 0) {
                // Add items with correct quantity
                transaction.items.forEach((item: any) => {
                    const itemToAdd = {
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                        qty: Number(item.qty),
                        discount: Number(item.discount || 0)
                    };
                    addToCartWithQty(itemToAdd, item.type);
                });
            }

            setKeterangan(String(transaction.keterangan || ''));
            if ((transaction as any).payment_type_id) {
                setSelectedPaymentTypeId((transaction as any).payment_type_id);
            } else if ((transaction as any).paymentTypeId) {
                setSelectedPaymentTypeId((transaction as any).paymentTypeId);
            }
            setEditingInvoiceNumber(transaction.invoiceNumber);
            setIsEditMode(true);
            setShowEditTransactionModal(false);

            toast.success("Transaksi berhasil dimuat untuk diedit!", { position: "bottom-left" });
        } catch (error) {
            console.error('Error loading transaction for edit:', error);
            toast.error("Gagal memuat transaksi untuk diedit!");
        }
    };

    // Local Storage functions for saved carts
    useEffect(() => {
        // Load saved carts from local storage
        const saved = localStorage.getItem('savedCarts');
        if (saved) {
            try {
                setSavedCarts(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading saved carts:', error);
            }
        }

        // Check for edit transaction data
        const editTransactionData = localStorage.getItem('editTransaction');
        if (editTransactionData) {
            try {
                const transaction = JSON.parse(editTransactionData);
                handleEditTransaction(transaction);
                // Clear edit transaction data from localStorage
                localStorage.removeItem('editTransaction');
            } catch (error) {
                console.error('Error loading edit transaction:', error);
                localStorage.removeItem('editTransaction');
            }
        }
    }, []);

    const saveCartToLocalStorage = () => {
        if (cart.length === 0) {
            toast.error("Keranjang kosong tidak bisa disimpan!");
            return;
        }

        try {
            // Create deep copy of cart items to preserve all properties including qty
            const cartItemsCopy = cart.map(item => ({
                ...item,
                // Ensure all numeric properties are properly saved
                price: Number(item.price),
                qty: Number(item.qty),
                discount: Number(item.discount || 0)
            }));

            const cartData = {
                id: Date.now(),
                invoiceNumber,
                date: new Date().toISOString(),
                customer: { ...customer },
                items: cartItemsCopy,
                subtotal: calculateSubtotal(),
                total: calculateTotal(),
                ppn: Number(ppn),
                biayaLain: Number(biayaLain),
                keterangan: String(keterangan || ''),
                paymentTypeId: selectedPaymentTypeId,
                mechanics: mechanics.map(m => ({ ...m }))
            };

            const existingCarts = JSON.parse(localStorage.getItem('savedCarts') || '[]');
            const updatedCarts = [cartData, ...existingCarts].slice(0, 10); // Keep max 10 saved carts
            localStorage.setItem('savedCarts', JSON.stringify(updatedCarts));
            setSavedCarts(updatedCarts);
            toast.success("Keranjang berhasil disimpan!", { position: "bottom-left" });
        } catch (error) {
            console.error('Error saving cart:', error);
            toast.error("Gagal menyimpan keranjang!");
        }
    };

    const loadCartFromLocalStorage = (savedCart: any) => {
        try {
            // Clear current cart first
            clearCart();
            clearCustomer();
            clearMechanics();

            // Load saved cart data
            if (savedCart.customer) {
                setCustomerFromHistory(savedCart.customer);
            }
            if (savedCart.mechanics && savedCart.mechanics.length > 0) {
                updateMechanics(savedCart.mechanics);
            }
            if (savedCart.items && savedCart.items.length > 0) {
                // Add items with correct quantity using new function
                savedCart.items.forEach((item: any) => {
                    const itemToAdd = {
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                        qty: Number(item.qty),
                        discount: Number(item.discount || 0)
                    };
                    addToCartWithQty(itemToAdd, item.type);
                });
            }
            setPpn(Number(savedCart.ppn || 0));
            setBiayaLain(Number(savedCart.biayaLain || 0));
            setKeterangan(String(savedCart.keterangan || ''));
            if (savedCart.paymentTypeId) {
                setSelectedPaymentTypeId(savedCart.paymentTypeId);
            } else {
                // reset to default if not saved
                const defaultType = paymentTypes.find(t => t.is_default);
                if (defaultType) setSelectedPaymentTypeId(defaultType.id);
            }

            toast.success("Keranjang berhasil dimuat!", { position: "bottom-left" });
            setShowSavedCartsModal(false);
        } catch (error) {
            console.error('Error loading cart:', error);
            toast.error("Gagal memuat keranjang!");
        }
    };

    const deleteSavedCart = (cartId: number) => {
        try {
            const updatedCarts = savedCarts.filter(cart => cart.id !== cartId);
            localStorage.setItem('savedCarts', JSON.stringify(updatedCarts));
            setSavedCarts(updatedCarts);
            toast.success("Keranjang tersimpan dihapus!", { position: "bottom-left" });
        } catch (error) {
            console.error('Error deleting saved cart:', error);
            toast.error("Gagal menghapus keranjang tersimpan!");
        }
    };

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

            if (paymentStatus === 'paid' && !selectedPaymentTypeId) {
                return toast.error("Pilih tipe pembayaran untuk status Lunas!");
            }

            const selectedPaymentType = paymentTypes.find(t => t.id === selectedPaymentTypeId);
            const paymentTypeName = selectedPaymentType?.name;

            const saved = await saveInvoice(customerWithMechanics, cart, grandTotal, keterangan, selectedPaymentTypeId, paymentTypeName, paymentStatus);
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
            setPaymentStatus('paid'); // Reset to default
            setBankName("");
            setCardNumber("");
            setShowKeteranganModal(false);

            // Generate new invoice number after successful checkout
            const nextInvoice = await getNextInvoiceNumberAction();
            setInvoiceNumber(nextInvoice);

            // reload page is kept (mirip behavior sebelumnya)
            window.location.reload();
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error("Gagal menyimpan transaksi!", { position: "bottom-left" });
        }
    };

    const handleUpdateTransaction = async () => {
        if (!isEditMode || !editingInvoiceNumber) return;

        if (!cart.length) return toast.error("Keranjang masih kosong!");
        if (!customer?.name?.trim()) {
            setShowCustomerModal(true);
            return toast.error("Data pelanggan harus diisi!");
        }

        try {
            // Stock final check
            const partsToUpdate = cart.filter(i => i.type === "part");
            for (const p of partsToUpdate) {
                const barang = barangItems.find(b => b.id === p.id);
                if (barang && p.qty > (barang.quantity ?? 0)) {
                    return toast.error(`Stok ${barang.name} tidak mencukupi! Tersedia: ${barang.quantity}, Diminta: ${p.qty}`);
                }
            }

            const customerWithMechanics = {
                ...customer,
                mekaniks: mechanics.length ? mechanics.map(m => ({ name: m.name, percentage: m.percentage, id: m.id })) : []
            };

            const subtotal = calculateSubtotal();
            const total = calculateTotal();
            const grandTotal = total + (biayaLain ?? 0);

            const transactionData = {
                invoiceNumber: editingInvoiceNumber,
                date,
                customer: customerWithMechanics,
                items: cart,
                total: grandTotal,
                savedAt: new Date().toISOString(),
                keterangan,
                paymentTypeId: selectedPaymentTypeId,
                paymentTypeName: paymentTypes.find(t => t.id === selectedPaymentTypeId)?.name
            };

            const updated = await updateTransaction(editingInvoiceNumber, transactionData);
            if (!updated) throw new Error("update failed");

            toast.success("Transaksi berhasil diperbarui!", { position: "bottom-left" });

            const originalTitle = document.title;
            document.title = `Nota_${editingInvoiceNumber.replace(/\//g, "_")}`;
            window.print();
            document.title = originalTitle;

            // Reset state
            clearCart();
            clearCustomer();
            clearMechanics();
            setSearchQuery("");
            setPpn(0);
            setBiayaLain(0);
            setKeterangan("");
            setBankName("");
            setCardNumber("");
            setShowKeteranganModal(false);
            setIsEditMode(false);
            setEditingInvoiceNumber(null);

            // Generate new invoice number after successful update
            const nextInvoice = await getNextInvoiceNumberAction();
            setInvoiceNumber(nextInvoice);

            // Reload page
            window.location.reload();
        } catch (err) {
            console.error('Update transaction error:', err);
            toast.error("Gagal memperbarui transaksi!", { position: "bottom-left" });
        }
    };

    const handleConfirmCheckoutWithMode = async () => {
        if (isEditMode) {
            handleUpdateTransaction();
        } else {
            handleConfirmCheckout();
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
                            <TabsComponent
                                activeTab={activeTab}
                                servicesCount={services?.length ?? 0}
                                partsCount={parts?.length ?? 0}
                                isFullscreen={isFullscreen}
                                onToggleFullscreen={toggleFullscreen}
                                onEditTransaction={() => setShowEditTransactionModal(true)}
                                onTabChange={(tab) => {
                                    setActiveTab(tab);
                                    setProductSearchQuery("");
                                }}
                            />
                        </div>

                        {/* Main Content - Side by Side */}
                        <div className="flex-1 flex flex-row overflow-hidden">
                            {/* Product Grid - Left Side */}
                            <div className="flex-1 min-w-0 h-full bg-zinc-50 overflow-hidden">
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

                            {/* Cart - Right Side */}
                            <aside className="w-80 bg-white border-l flex flex-col shadow-lg">
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
                                    onSaveCart={saveCartToLocalStorage}
                                    onLoadSavedCart={() => setShowSavedCartsModal(true)}
                                    isMobile={false}
                                    maxStocks={maxStocks}
                                    paymentTypes={paymentTypes}
                                    selectedPaymentTypeId={selectedPaymentTypeId}
                                    onPaymentTypeChange={setSelectedPaymentTypeId}
                                    paymentStatus={paymentStatus}
                                    onPaymentStatusChange={setPaymentStatus}
                                    bankName={bankName}
                                    onBankNameChange={setBankName}
                                    cardNumber={cardNumber}
                                    onCardNumberChange={setCardNumber}
                                />
                            </aside>
                        </div>
                    </>
                ) : (
                    /* Desktop Layout - Default */
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        <div className="flex-1 min-w-0 h-full flex flex-col bg-zinc-50 overflow-hidden">
                            <TabsComponent
                                activeTab={activeTab}
                                servicesCount={services?.length ?? 0}
                                partsCount={parts?.length ?? 0}
                                isFullscreen={isFullscreen}
                                onToggleFullscreen={toggleFullscreen}
                                onEditTransaction={() => setShowEditTransactionModal(true)}
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
                                onSaveCart={saveCartToLocalStorage}
                                onLoadSavedCart={() => setShowSavedCartsModal(true)}
                                isMobile={false}
                                maxStocks={maxStocks}
                                paymentTypes={paymentTypes}
                                selectedPaymentTypeId={selectedPaymentTypeId}
                                onPaymentTypeChange={setSelectedPaymentTypeId}
                                paymentStatus={paymentStatus}
                                onPaymentStatusChange={setPaymentStatus}
                                bankName={bankName}
                                onBankNameChange={setBankName}
                                cardNumber={cardNumber}
                                onCardNumberChange={setCardNumber}
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
                                onSaveCart={saveCartToLocalStorage}
                                onLoadSavedCart={() => setShowSavedCartsModal(true)}
                                isMobile={true}
                                maxStocks={maxStocks}
                                paymentTypes={paymentTypes}
                                selectedPaymentTypeId={selectedPaymentTypeId}
                                onPaymentTypeChange={setSelectedPaymentTypeId}
                                paymentStatus={paymentStatus}
                                onPaymentStatusChange={setPaymentStatus}
                                bankName={bankName}
                                onBankNameChange={setBankName}
                                cardNumber={cardNumber}
                                onCardNumberChange={setCardNumber}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
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
                        <Button onClick={handleConfirmCheckoutWithMode}>
                            {isEditMode ? "Update & Cetak" : "Checkout & Cetak"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showSavedCartsModal} onOpenChange={setShowSavedCartsModal}>
                <DialogContent className="sm:max-w-[450px] max-h-[70vh] overflow-hidden">
                    <DialogHeader className="pb-3">
                        <DialogTitle className="text-lg">Keranjang Tersimpan</DialogTitle>
                        <DialogDescription className="text-sm">
                            Pilih keranjang yang ingin dimuat kembali
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto max-h-[50vh]">
                        {savedCarts.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <div className="text-xs">Belum ada keranjang tersimpan</div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {savedCarts.map((savedCart) => (
                                    <div key={savedCart.id} className="border rounded-md p-2 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="font-medium text-xs truncate">
                                                    {savedCart.invoiceNumber}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(savedCart.date).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="text-xs text-gray-600 truncate">
                                                    {savedCart.customer?.platNomor ? `Plat: ${savedCart.customer.platNomor}` : 'Tanpa plat nomor'}
                                                </div>
                                                <div className="font-semibold text-xs text-blue-600">
                                                    Rp {savedCart.total?.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <Button
                                                    size="sm"
                                                    onClick={() => loadCartFromLocalStorage(savedCart)}
                                                    className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => deleteSavedCart(savedCart.id)}
                                                    className="text-red-600 border-red-300 hover:bg-red-50 h-7 px-2"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="pt-3">
                        <Button variant="outline" size="sm" onClick={() => setShowSavedCartsModal(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EditTransactionModal
                isOpen={showEditTransactionModal}
                onClose={() => setShowEditTransactionModal(false)}
                transactions={transactions}
                onSelectTransaction={handleEditTransaction}
            />

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
                    paymentTypeName={paymentTypes.find(p => p.id === selectedPaymentTypeId)?.name}
                    bankName={bankName}
                    cardNumber={cardNumber}
                    mechanics={mechanics}
                />
            </div>
        </SidebarInset>
    );
}

"use client";

import { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useReturPembelian, usePembelian } from "@/hooks/usePembelian";
import { Plus, Receipt, AlertCircle, Package, ArrowLeft, Save, Trash2, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface ReturnItem {
    purchase_item_id: string;
    quantity: number;
    amount: number;
}

interface FormData {
    purchase_id: string;
    return_date: string;
    reason: string;
    total_amount: number;
    notes: string;
    return_items: ReturnItem[];
}

export default function EditReturPembelianPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    
    const { returns, updateReturn, deleteReturn, loading: loadingReturns } = useReturPembelian();
    const { purchases, loading: loadingPurchases } = usePembelian();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        purchase_id: "",
        return_date: new Date().toISOString().split('T')[0],
        reason: "",
        total_amount: 0,
        notes: "",
        return_items: []
    });

    // Populate data when returns are loaded
    useEffect(() => {
        if (!loadingReturns && returns.length > 0 && id) {
            const currentReturn = returns.find(r => r.id === id);
            if (currentReturn) {
                 const mappedItems = (currentReturn as any).items?.map((item: any) => ({
                    purchase_item_id: item.purchase_item_id,
                    quantity: item.quantity,
                    amount: item.amount
                })) || [];

                setFormData({
                    purchase_id: currentReturn.purchase_id,
                    return_date: new Date(currentReturn.return_date).toISOString().split('T')[0],
                    reason: currentReturn.reason || "",
                    total_amount: currentReturn.total_amount,
                    notes: currentReturn.notes || "",
                    return_items: mappedItems
                });
            } else {
                toast.error("Data retur tidak ditemukan");
                router.push("/retur-pembelian");
            }
        }
    }, [id, returns, loadingReturns, router]);

    const getPurchaseItems = () => {
        const selectedPurchase = purchases.find(p => p.id === formData.purchase_id);
        return selectedPurchase?.items || [];
    };

    const handleUpdateReturn = async () => {
        try {
            if (!formData.purchase_id) {
                toast.error("Pilih pembelian yang akan diretur!");
                return;
            }

            if (formData.return_items.length === 0) {
                toast.error("Tambahkan minimal 1 item retur!");
                return;
            }

            if (!formData.reason) {
                toast.error("Alasan retur wajib diisi!");
                return;
            }

            setIsSubmitting(true);

            const returnItems = formData.return_items.map(item => ({
                purchase_item_id: item.purchase_item_id,
                quantity: item.quantity,
                amount: item.amount
            }));

            await updateReturn(id, {
                return_date: formData.return_date,
                reason: formData.reason,
                total_amount: formData.total_amount,
                notes: formData.notes
            }, returnItems);

            toast.success("Retur pembelian berhasil diupdate!");
            router.push("/retur-pembelian");
        } catch (error) {
            console.error('Error updating return:', error);
            toast.error("Gagal mengupdate retur pembelian");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReturn = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus data retur ini?")) return;
        
        try {
            setIsDeleting(true);
            await deleteReturn(id);
            toast.success("Retur pembelian berhasil dihapus");
            router.push("/retur-pembelian");
        } catch (error) {
            console.error('Error deleting return:', error);
            toast.error("Gagal menghapus retur pembelian");
            setIsDeleting(false);
        }
    };

    const addReturnItem = (purchaseItem: any) => {
        const existingItem = formData.return_items.find(item => item.purchase_item_id === purchaseItem.id);
        if (existingItem) {
            toast.error("Item sudah ditambahkan!");
            return;
        }

        setFormData(prev => {
            const newItems = [...prev.return_items, {
                purchase_item_id: purchaseItem.id,
                quantity: 1,
                amount: purchaseItem.unit_price // Default 1 qty = 1 unit price amount
            }];
            
            // Calculate new total
            const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
            
            return {
                ...prev,
                return_items: newItems,
                total_amount: newTotal
            };
        });
    };

    const removeReturnItem = (index: number) => {
        setFormData(prev => {
            const newItems = prev.return_items.filter((_, i) => i !== index);
            const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
            return {
                ...prev,
                return_items: newItems,
                total_amount: newTotal
            };
        });
    };

    const updateReturnItem = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.return_items];
            const purchaseItem = getPurchaseItems().find((pi: any) => pi.id === newItems[index].purchase_item_id);
            const unitPrice = purchaseItem?.unit_price || 0;

            if (field === 'quantity') {
                newItems[index] = { 
                    ...newItems[index], 
                    quantity: value,
                    amount: value * unitPrice
                };
            } else {
                 newItems[index] = { ...newItems[index], [field]: value };
            }

            const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
            return { ...prev, return_items: newItems, total_amount: newTotal };
        });
    };

    if (loadingReturns || loadingPurchases) {
        return <div className="flex h-screen items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"/></div>;
    }

    return (
        <SidebarInset className="font-sans bg-white h-screen flex flex-col overflow-hidden">
            {/* Header - Fixed Height */}
            <header className="flex-none h-14 flex items-center gap-2 border-b bg-white px-4">
                <div className="flex items-center gap-4 w-full">
                    <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8 hover:bg-neutral-100">
                        <Link href="/retur-pembelian">
                            <ArrowLeft className="w-4 h-4 text-black" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-black rounded-md">
                            <ArrowLeftRight className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-base font-bold text-black tracking-tight">Edit Retur Pembelian</h1>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleDeleteReturn}
                            disabled={isDeleting || isSubmitting}
                            className="hover:bg-red-50 text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </Button>
                        <div className="h-6 w-px bg-neutral-200 mx-2" />
                        <Button variant="ghost" size="sm" asChild className="hover:bg-neutral-100 text-neutral-600">
                            <Link href="/retur-pembelian">Batal</Link>
                        </Button>
                        <Button 
                            onClick={handleUpdateReturn} 
                            disabled={isSubmitting || isDeleting}
                            size="sm"
                            className="bg-black hover:bg-neutral-800 text-white rounded-md px-6 font-medium"
                        >
                            {isSubmitting ? "Menyimpan..." : "Update Retur"}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content - Takes remaining height */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Form Info - Scrollable */}
                <div className="w-1/3 min-w-[350px] border-r border-neutral-200 flex flex-col bg-white">
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Section 1 */}
                        <div className="space-y-4">
                             <div className="flex items-center gap-2 pb-2 border-b border-black/5">
                                <Receipt className="w-4 h-4 text-neutral-500" />
                                <span className="font-semibold text-sm text-neutral-900 uppercase tracking-widest">Detail Transaksi</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-neutral-500">SUMBER INVOICE</Label>
                                    <Select 
                                        value={formData.purchase_id} 
                                        onValueChange={(value: string) => {
                                            // Warn if changing invoice will clear items
                                            if (formData.return_items.length > 0 && !confirm("Mengganti invoice akan menghapus item yang sudah dipilih. Lanjutkan?")) {
                                                return;
                                            }
                                            setFormData(prev => ({ ...prev, purchase_id: value, return_items: [], total_amount: 0 }));
                                        }}
                                        disabled={true} // Usually can't change invoice on edit for simplicity, but could allow if we logic it right.
                                        // Keeping it disabled for safety unless requested otherwise, as it changes context completely.
                                    >
                                        <SelectTrigger className="bg-neutral-50 border-neutral-200 text-neutral-500 focus:ring-0 h-11 rounded-md cursor-not-allowed">
                                            <SelectValue placeholder="Pilih Invoice..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {purchases.map((purchase) => (
                                                <SelectItem key={purchase.id} value={purchase.id}>
                                                    <span className="font-medium">{purchase.invoice_number}</span>
                                                    <span className="text-neutral-400 mx-2">|</span>
                                                    <span className="text-neutral-600">{purchase.supplier?.name}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formData.purchase_id && (
                                        <div className="text-xs text-neutral-500 bg-neutral-100 p-2 rounded border border-neutral-200 flex justify-between items-center">
                                           <span>Total Invoice Asli</span>
                                           <span className="font-mono font-medium">Rp {purchases.find(p => p.id === formData.purchase_id)?.final_amount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                     <Label className="text-xs font-medium text-neutral-500">TANGGAL RETUR</Label>
                                    <Input
                                        type="date"
                                        value={formData.return_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
                                        className="bg-white border-neutral-300 focus-visible:ring-black h-11 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
                                <AlertCircle className="w-4 h-4 text-neutral-500" />
                                <span className="font-semibold text-sm text-neutral-900 uppercase tracking-widest">Keterangan</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-neutral-500">ALASAN UTAMA</Label>
                                    <Textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Tulis alasan pengembalian..."
                                        rows={4}
                                        className="bg-white border-neutral-300 focus-visible:ring-black resize-none text-sm rounded-md p-3"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-neutral-500">CATATAN TAMBAHAN</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Instruksi atau detail lain..."
                                        rows={2}
                                        className="bg-white border-neutral-300 focus-visible:ring-black resize-none text-sm rounded-md p-3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Items - Flex Main */}
                <div className="flex-1 flex flex-col bg-neutral-50/50">
                    {/* Items Header */}
                    <div className="flex-none p-6 border-b border-neutral-200 bg-white flex justify-between items-center">
                         <div>
                            <h2 className="text-lg font-bold text-black flex items-center gap-2">
                                Daftar Item
                                <Badge className="bg-black text-white hover:bg-black px-2 py-0.5 rounded-full text-xs">{formData.return_items.length}</Badge>
                            </h2>
                            <p className="text-sm text-neutral-500">Kelola item yang akan dikembalikan</p>
                        </div>
                        
                        <div className="flex gap-2">
                             <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const items = getPurchaseItems();
                                    if (items.length === 0) {
                                        toast.error("Pilih pembelian terlebih dahulu!");
                                        return;
                                    }
                                    const addedIds = formData.return_items.map(i => i.purchase_item_id);
                                    const availableItem = items.find((i: any) => !addedIds.includes(i.id));
                                    
                                    if (availableItem) {
                                        addReturnItem(availableItem);
                                    } else if (items.length > 0) {
                                        toast.info("Semua item sudah ditambahkan.");
                                    }
                                }}
                                disabled={!formData.purchase_id}
                                className="bg-white hover:bg-neutral-50 text-black border-neutral-300"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Item
                            </Button>
                        </div>
                    </div>

                    {/* Items Table/List Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {formData.return_items.length > 0 ? (
                            <div className="grid gap-3">
                                {formData.return_items.map((item: ReturnItem, index: number) => {
                                    const purchaseItem = getPurchaseItems().find((pi: any) => pi.id === item.purchase_item_id);
                                    return (
                                        <div key={index} className="group flex items-center gap-4 bg-white p-4 rounded-lg border border-neutral-200 hover:border-black transition-all shadow-sm">
                                            {/* Number */}
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
                                                {index + 1}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2">
                                                    <h3 className="font-bold text-neutral-900 truncate">{purchaseItem?.item_name || 'Unknown'}</h3>
                                                    <span className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{purchaseItem?.item_type}</span>
                                                </div>
                                                <p className="text-sm text-neutral-500 font-mono mt-0.5">
                                                    @ Rp {(purchaseItem?.unit_price || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>

                                            {/* Quantity Input */}
                                            <div className="flex flex-col items-end">
                                                <Label className="text-[10px] text-neutral-400 font-bold uppercase mb-1">Quantity</Label>
                                                <div className="flex items-center border border-neutral-300 rounded-md bg-white w-32 focus-within:ring-1 focus-within:ring-black">
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateReturnItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-full border-0 h-9 text-right font-mono text-sm focus-visible:ring-0 rounded-none bg-transparent"
                                                        min="0"
                                                    />
                                                    <div className="px-3 text-xs text-neutral-400 bg-neutral-50 h-9 flex items-center border-l border-neutral-200">
                                                        PCS
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="w-40 text-right">
                                                <Label className="text-[10px] text-neutral-400 font-bold uppercase mb-1">Subtotal</Label>
                                                <p className="font-bold text-lg text-black font-mono">
                                                    Rp {item.amount.toLocaleString('id-ID')}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeReturnItem(index)}
                                                className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-md ml-2"
                                            >
                                                <Plus className="w-5 h-5 rotate-45" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-200 rounded-xl bg-white/50">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                    <Package className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900">List Item Kosong</h3>
                                <p className="text-neutral-500 max-w-sm mt-2">
                                    Pilih invoice di panel kiri, lalu tambahkan item yang akan dikembalikan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Summary - Fixed Bottom */}
                    <div className="flex-none p-6 bg-white border-t border-neutral-200">
                        <div className="flex items-center justify-between max-w-2xl ml-auto">
                            <div className="text-right flex-1 pr-8">
                                <p className="text-sm font-medium text-neutral-500">TOTAL PENGEMBALIAN DANA</p>
                                <p className="text-xs text-neutral-400 mt-1">Pastikan nominal sudah sesuai perjanjian</p>
                            </div>
                            <div className="text-4xl font-black text-black tracking-tight font-mono">
                                Rp {formData.total_amount.toLocaleString('id-ID')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}

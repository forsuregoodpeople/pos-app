"use client";

import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useReturPembelian } from "@/hooks/usePembelian";
import { usePembelian } from "@/hooks/usePembelian";
import { Plus, Search, Receipt, Calendar, ArrowLeftRight, AlertCircle, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

export default function ReturPembelianPage() {
    const { returns, loading, error, createReturn } = useReturPembelian();
    const { purchases } = usePembelian();
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        purchase_id: "",
        return_date: new Date().toISOString().split('T')[0],
        reason: "",
        total_amount: 0,
        notes: "",
        return_items: []
    });

    const filteredReturns = returns.filter(retur =>
        (retur as any).purchase?.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        retur.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            purchase_id: "",
            return_date: new Date().toISOString().split('T')[0],
            reason: "",
            total_amount: 0,
            notes: "",
            return_items: []
        });
    };

    const handleAddReturn = async () => {
        try {
            if (!formData.purchase_id) {
                toast.error("Pilih pembelian yang akan diretur!");
                return;
            }

            if (formData.return_items.length === 0) {
                toast.error("Tambahkan minimal 1 item retur!");
                return;
            }

            const returnItems = formData.return_items.map(item => ({
                purchase_item_id: item.purchase_item_id,
                quantity: item.quantity,
                amount: item.amount
            }));

            await createReturn(formData, returnItems);
            resetForm();
            setShowAddModal(false);
            toast.success("Retur pembelian berhasil ditambahkan!");
        } catch (error) {
            console.error('Error adding return:', error);
        }
    };

    const addReturnItem = (purchaseItem: any) => {
        const existingItem = formData.return_items.find(item => item.purchase_item_id === purchaseItem.id);
        if (existingItem) {
            toast.error("Item sudah ditambahkan!");
            return;
        }

        setFormData(prev => ({
            ...prev,
            return_items: [...prev.return_items, {
                purchase_item_id: purchaseItem.id,
                quantity: 1,
                amount: purchaseItem.unit_price
            }]
        }));
    };

    const removeReturnItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            return_items: prev.return_items.filter((_, i) => i !== index)
        }));
    };

    const updateReturnItem = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.return_items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, return_items: newItems };
        });
    };

    const calculateTotalAmount = () => {
        const total = formData.return_items.reduce((sum, item) => sum + item.amount, 0);
        setFormData(prev => ({ ...prev, total_amount: total }));
    };

    const getPurchaseItems = () => {
        const selectedPurchase = purchases.find(p => p.id === formData.purchase_id);
        return selectedPurchase?.items || [];
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'part':
                return <Package className="w-4 h-4" />;
            case 'service':
                return <Wrench className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Retur Pembelian</h1>
            </header>

            <div className="p-4 md:p-6">
                {/* Search and Add Button */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nomor invoice atau alasan..."
                            className="pl-10"
                        />
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Retur
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Memuat data retur...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-red-500 text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                            <p className="font-medium">Terjadi kesalahan</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                ) : filteredReturns.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data retur pembelian"}
                            </p>
                            <p className="text-xs mt-1">
                                {searchQuery ? "Coba kata kunci lain" : "Tambah retur pembelian pertama untuk memulai"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReturns.map((retur) => (
                            <Card key={retur.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{(retur as any).purchase?.invoice_number}</CardTitle>
                                            <CardDescription>
                                                {formatDate(retur.return_date)}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                            Retur
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Alasan:</p>
                                        <p className="text-sm">{retur.reason || '-'}</p>
                                    </div>
                                    {retur.notes && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Catatan:</p>
                                            <p className="text-sm">{retur.notes}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Retur:</span>
                                        <span className="font-bold text-lg text-red-600">
                                            Rp {retur.total_amount.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <p className="text-xs font-medium text-gray-600 mb-2">Item Diretur:</p>
                                        <div className="space-y-1">
                                            {(retur as any).items?.slice(0, 3).map((item: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-xs">
                                                    {getItemIcon(item.purchase_item?.item_type)}
                                                    <span className="truncate">{item.purchase_item?.item_name}</span>
                                                    <span className="text-gray-500">x{item.quantity}</span>
                                                    <span className="font-medium">Rp {item.amount.toLocaleString('id-ID')}</span>
                                                </div>
                                            ))}
                                            {(retur as any).items && (retur as any).items.length > 3 && (
                                                <p className="text-xs text-gray-500">
                                                    +{(retur as any).items.length - 3} item lainnya
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Add Return Modal */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Tambah Retur Pembelian</DialogTitle>
                            <DialogDescription>
                                Masukkan detail retur pembelian
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase_id">Pembelian *</Label>
                                    <Select value={formData.purchase_id} onValueChange={(value: string) => setFormData(prev => ({ ...prev, purchase_id: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih pembelian" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {purchases.map((purchase) => (
                                                <SelectItem key={purchase.id} value={purchase.id}>
                                                    {purchase.invoice_number} - {purchase.supplier?.name} - Rp {purchase.final_amount.toLocaleString('id-ID')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="return_date">Tanggal Retur *</Label>
                                    <Input
                                        id="return_date"
                                        type="date"
                                        value={formData.return_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Alasan Retur *</Label>
                                <Textarea
                                    id="reason"
                                    value={formData.reason}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Masukkan alasan retur..."
                                    rows={3}
                                />
                            </div>

                            {/* Items Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Item yang Diretur</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const items = getPurchaseItems();
                                            if (items.length === 0) {
                                                toast.error("Pilih pembelian terlebih dahulu!");
                                                return;
                                            }
                                            addReturnItem(items[0]);
                                        }}
                                        disabled={!formData.purchase_id}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tambah Item
                                    </Button>
                                </div>

                                {formData.return_items.length > 0 && (
                                    <div className="space-y-3">
                                        {formData.return_items.map((item: ReturnItem, index: number) => {
                                            const purchaseItem = getPurchaseItems().find((pi: any) => pi.id === item.purchase_item_id);
                                            return (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Item</Label>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            {getItemIcon(purchaseItem?.item_type || 'part')}
                                                            <span className="truncate">{purchaseItem?.item_name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Qty</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                updateReturnItem(index, 'quantity', parseFloat(e.target.value) || 0);
                                                                updateReturnItem(index, 'amount', (parseFloat(e.target.value) || 0) * (purchaseItem?.unit_price || 0));
                                                            }}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Harga Satuan</Label>
                                                        <Input
                                                            value={purchaseItem?.unit_price || 0}
                                                            readOnly
                                                            className="bg-gray-50"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Jumlah</Label>
                                                        <Input
                                                            value={item.amount}
                                                            readOnly
                                                            className="bg-gray-50"
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeReturnItem(index)}
                                                        >
                                                            <Plus className="w-4 h-4 rotate-45" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="total_amount">Total Retur</Label>
                                    <Input
                                        id="total_amount"
                                        value={formData.total_amount}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Catatan</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Catatan tambahan..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleAddReturn}>
                                Simpan Retur
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SidebarInset>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CreditCard, Plus, Edit2, Trash2, Star, Search, Check, X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { usePaymentTypes } from "@/hooks/usePaymentTypes";
import { PaymentType } from "@/services/payment-types/payment-types";
import { toast } from "sonner";

export default function DataTipePembayaranPage() {
    const { items, loading, error, createPaymentType, updatePaymentType, deletePaymentType, setDefaultPaymentType } = usePaymentTypes();
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        is_active: true,
        is_default: false
    });

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredPaymentTypes = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = async () => {
        if (!formData.name.trim()) {
            toast.error("Nama tipe pembayaran harus diisi!", { position: "top-right" });
            return;
        }

        try {
            await createPaymentType(formData);
            toast.success("Tipe pembayaran berhasil ditambahkan!", { position: "bottom-right" });
            setShowAddModal(false);
            setFormData({ name: "", description: "", is_active: true, is_default: false });
        } catch (error) {
            console.error('Add payment type error:', error);
        }
    };

    const handleEdit = async () => {
        if (!formData.name.trim()) {
            toast.error("Nama tipe pembayaran harus diisi!", { position: "top-right" });
            return;
        }

        if (!selectedPaymentType) return;

        try {
            await updatePaymentType(selectedPaymentType.id, formData);
            toast.success("Tipe pembayaran berhasil diupdate!", { position: "bottom-right" });
            setShowEditModal(false);
            setSelectedPaymentType(null);
            setFormData({ name: "", description: "", is_active: true, is_default: false });
        } catch (error) {
            console.error('Update payment type error:', error);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus tipe pembayaran "${name}"?`)) {
            return;
        }

        try {
            await deletePaymentType(id);
            toast.success("Tipe pembayaran berhasil dihapus!", { position: "bottom-right" });
        } catch (error) {
            console.error('Delete payment type error:', error);
        }
    };

    const handleSetDefault = async (id: string, name: string) => {
        try {
            await setDefaultPaymentType(id);
            toast.success(`${name} diatur sebagai tipe pembayaran default!`, { position: "bottom-right" });
        } catch (error) {
            console.error('Set default payment type error:', error);
        }
    };

    const openEditModal = (paymentType: PaymentType) => {
        setSelectedPaymentType(paymentType);
        setFormData({
            name: paymentType.name,
            description: paymentType.description || "",
            is_active: paymentType.is_active,
            is_default: paymentType.is_default
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({ name: "", description: "", is_active: true, is_default: false });
        setSelectedPaymentType(null);
    };

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
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Data Tipe Pembayaran</h1>
            </header>

            <div className="p-4 md:p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tipe Pembayaran</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{items.length}</div>
                            <p className="text-xs text-muted-foreground">Semua tipe pembayaran</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
                            <Check className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {items.filter(item => item.is_active).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Tipe pembayaran aktif</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Non-Aktif</CardTitle>
                            <X className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {items.filter(item => !item.is_active).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Tipe pembayaran non-aktif</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Cari tipe pembayaran..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Tipe Pembayaran
                    </Button>
                </div>

                {/* Payment Types Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            Daftar Tipe Pembayaran
                        </CardTitle>
                        <CardDescription>
                            Menampilkan {filteredPaymentTypes.length} dari {items.length} tipe pembayaran
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredPaymentTypes.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <CreditCard className="w-16 h-16 mb-4 opacity-30" />
                                <p className="text-lg font-medium">Tidak ada tipe pembayaran ditemukan</p>
                                <p className="text-sm mt-1">Coba kata kunci pencarian lain atau tambah baru</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left p-3 font-medium text-sm">Nama Tipe Pembayaran</th>
                                            <th className="text-left p-3 font-medium text-sm">Deskripsi</th>
                                            <th className="text-center p-3 font-medium text-sm">Status</th>
                                            <th className="text-center p-3 font-medium text-sm">Default</th>
                                            <th className="text-left p-3 font-medium text-sm">Tanggal Dibuat</th>
                                            <th className="text-center p-3 font-medium text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPaymentTypes.map((paymentType) => (
                                            <tr key={paymentType.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                                        <span className="font-medium">{paymentType.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                                        {paymentType.description || "-"}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Badge variant={paymentType.is_active ? "default" : "secondary"} className="text-xs">
                                                        {paymentType.is_active ? "Aktif" : "Non-Aktif"}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {paymentType.is_default && (
                                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0 text-xs">
                                                            <Star className="w-3 h-3 mr-1" />
                                                            Default
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {new Date(paymentType.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex justify-center gap-2">
                                                        {!paymentType.is_default && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSetDefault(paymentType.id, paymentType.name)}
                                                                className="h-8 w-8 p-0"
                                                                title="Atur sebagai default"
                                                            >
                                                                <Star className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEditModal(paymentType)}
                                                            className="h-8 w-8 p-0"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(paymentType.id, paymentType.name)}
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Tipe Pembayaran Baru</DialogTitle>
                        <DialogDescription>
                            Tambahkan jenis pembayaran baru ke sistem
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="add-name">Nama Tipe Pembayaran *</Label>
                            <Input
                                id="add-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Contoh: Tunai, Transfer Bank, dll"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="add-description">Deskripsi</Label>
                            <Textarea
                                id="add-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Deskripsi detail tipe pembayaran (opsional)"
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="add-active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="rounded"
                            />
                            <Label htmlFor="add-active">Aktif</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleAdd} disabled={!formData.name.trim()}>
                            Tambah
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Tipe Pembayaran</DialogTitle>
                        <DialogDescription>
                            Edit informasi tipe pembayaran
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="edit-name">Nama Tipe Pembayaran *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Contoh: Tunai, Transfer Bank, dll"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Deskripsi</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Deskripsi detail tipe pembayaran (opsional)"
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="rounded"
                            />
                            <Label htmlFor="edit-active">Aktif</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleEdit} disabled={!formData.name.trim()}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    );
}
"use client";

import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useSuppliers } from "@/hooks/usePembelian";
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, Building, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function DataSupplierPage() {
    const { suppliers, loading, error, createSupplier, updateSupplier, deleteSupplier, reload } = useSuppliers();
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        contact_person: ""
    });

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: "",
            phone: "",
            email: "",
            address: "",
            contact_person: ""
        });
    };

    const handleAddSupplier = async () => {
        try {
            await createSupplier(formData);
            resetForm();
            setShowAddModal(false);
            toast.success("Supplier berhasil ditambahkan!");
        } catch (error) {
            console.error('Error adding supplier:', error);
        }
    };

    const handleEditSupplier = async () => {
        try {
            await updateSupplier(selectedSupplier.id, formData);
            resetForm();
            setShowEditModal(false);
            setSelectedSupplier(null);
            toast.success("Supplier berhasil diupdate!");
        } catch (error) {
            console.error('Error updating supplier:', error);
        }
    };

    const handleDeleteSupplier = async () => {
        try {
            await deleteSupplier(selectedSupplier.id);
            setShowDeleteModal(false);
            setSelectedSupplier(null);
            toast.success("Supplier berhasil dihapus!");
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    const openEditModal = (supplier: any) => {
        setSelectedSupplier(supplier);
        setFormData({
            name: supplier.name,
            phone: supplier.phone || "",
            email: supplier.email || "",
            address: supplier.address || "",
            contact_person: supplier.contact_person || ""
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (supplier: any) => {
        setSelectedSupplier(supplier);
        setShowDeleteModal(true);
    };

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Data Supplier</h1>
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
                            placeholder="Cari supplier..."
                            className="pl-10"
                        />
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Supplier
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Memuat data supplier...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-red-500 text-center">
                            <p className="font-medium">Terjadi kesalahan</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data supplier"}
                            </p>
                            <p className="text-xs mt-1">
                                {searchQuery ? "Coba kata kunci lain" : "Tambah supplier pertama untuk memulai"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map((supplier) => (
                            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{supplier.name}</CardTitle>
                                            {supplier.contact_person && (
                                                <CardDescription>Contact: {supplier.contact_person}</CardDescription>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(supplier)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openDeleteModal(supplier)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {supplier.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <span className="truncate">{supplier.email}</span>
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                                <span className="line-clamp-2">{supplier.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Add Supplier Modal */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Tambah Supplier Baru</DialogTitle>
                            <DialogDescription>
                                Masukkan informasi supplier baru
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Supplier *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Masukkan nama supplier"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contact_person">Contact Person</Label>
                                <Input
                                    id="contact_person"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                                    placeholder="Nama contact person"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telepon</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Nomor telepon"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Email supplier"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Alamat lengkap supplier"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleAddSupplier} disabled={!formData.name}>
                                Simpan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Supplier Modal */}
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Supplier</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi supplier
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nama Supplier *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Masukkan nama supplier"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-contact_person">Contact Person</Label>
                                <Input
                                    id="edit-contact_person"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                                    placeholder="Nama contact person"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-phone">Telepon</Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Nomor telepon"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Email supplier"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-address">Alamat</Label>
                                <Textarea
                                    id="edit-address"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Alamat lengkap supplier"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEditModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleEditSupplier} disabled={!formData.name}>
                                Update
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Hapus Supplier</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus supplier "{selectedSupplier?.name}"?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSupplier}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SidebarInset>
    );
}
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSuppliers } from "@/hooks/usePembelian";
import { useSupplierSelection } from "@/hooks/useSupplierSelection";

interface SupplierModalProps {
    isOpen: boolean;
    supplier: any;
    searchQuery: string;
    suppliers: any[];
    onClose: () => void;
    onSearchChange: (query: string) => void;
    onSupplierChange: (supplier: any) => void;
    onSave: () => void;
}

export function SupplierModal({
    isOpen,
    supplier,
    searchQuery,
    suppliers,
    onClose,
    onSearchChange,
    onSupplierChange,
    onSave
}: SupplierModalProps) {
    const handleSelectSupplier = (selectedSupplier: any) => {
        onSupplierChange(selectedSupplier);
        onSave();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Pilih Supplier</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Quick Add New Supplier */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-medium mb-3">Tambah Supplier Baru</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="new-supplier-name">Nama Supplier *</Label>
                                <Input
                                    id="new-supplier-name"
                                    placeholder="Masukkan nama supplier"
                                    value={supplier?.name || ""}
                                    onChange={(e) => onSupplierChange({ name: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="new-supplier-phone">Telepon</Label>
                                <Input
                                    id="new-supplier-phone"
                                    placeholder="Nomor telepon"
                                    value={supplier?.phone || ""}
                                    onChange={(e) => onSupplierChange({ phone: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="new-supplier-email">Email</Label>
                                <Input
                                    id="new-supplier-email"
                                    type="email"
                                    placeholder="Email supplier"
                                    value={supplier?.email || ""}
                                    onChange={(e) => onSupplierChange({ email: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="new-supplier-address">Alamat</Label>
                                <Input
                                    id="new-supplier-address"
                                    placeholder="Alamat supplier"
                                    value={supplier?.address || ""}
                                    onChange={(e) => onSupplierChange({ address: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="new-supplier-contact">Contact Person</Label>
                                <Input
                                    id="new-supplier-contact"
                                    placeholder="Nama contact person"
                                    value={supplier?.contact_person || ""}
                                    onChange={(e) => onSupplierChange({ contact_person: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={onSave} 
                            className="w-full mt-3"
                            disabled={!supplier?.name?.trim()}
                        >
                            Tambah & Pilih Supplier
                        </Button>
                    </div>

                    {/* Search Existing Suppliers */}
                    <div>
                        <Label htmlFor="supplier-search">Cari Supplier</Label>
                        <Input
                            id="supplier-search"
                            placeholder="Ketik nama supplier..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    {/* Supplier List */}
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {suppliers
                            .filter(s => 
                                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                s.phone?.includes(searchQuery) ||
                                s.email?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((supplierItem) => (
                                <div
                                    key={supplierItem.id}
                                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleSelectSupplier(supplierItem)}
                                >
                                    <div className="font-medium">{supplierItem.name}</div>
                                    {supplierItem.phone && (
                                        <div className="text-sm text-gray-600">📞 {supplierItem.phone}</div>
                                    )}
                                    {supplierItem.email && (
                                        <div className="text-sm text-gray-600">✉️ {supplierItem.email}</div>
                                    )}
                                    {supplierItem.address && (
                                        <div className="text-sm text-gray-600">📍 {supplierItem.address}</div>
                                    )}
                                    {supplierItem.contact_person && (
                                        <div className="text-sm text-gray-600">👤 {supplierItem.contact_person}</div>
                                    )}
                                </div>
                            ))}
                        
                        {suppliers.filter(s => 
                            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.phone?.includes(searchQuery) ||
                            s.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">Tidak ada supplier ditemukan</p>
                                <p className="text-xs mt-1">Tambah supplier baru di atas</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
"use client";

import React, { useState, useEffect } from "react";
import { useDataBarang, DataBarang } from "@/hooks/useDataBarang";
import { DataTable } from "@/components/shared/DataTable";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Printer, Plus } from "lucide-react";
import { addPartAction } from "@/services/data-barang/data-barang";
import { toast } from "sonner";

export default function DataBarangPage() {
    const { items, loading, updateItem, deleteItem, reload } = useDataBarang();
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [activeTab, setActiveTab] = useState("mutasi");
    const [isClient, setIsClient] = useState(false);
    
    // Add Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({ code: '', name: '', price: 0 });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const columns = [
        { key: 'code' as const, label: 'Kode Barang', type: 'text' as const, editable: true },
        { key: 'name' as const, label: 'Nama Barang', type: 'text' as const, editable: true },
        { key: 'quantity' as const, label: 'Kuantitas', type: 'number' as const, editable: false },
        { key: 'price' as const, label: 'Harga', type: 'number' as const, editable: true },
    ];

    const getFilteredItems = (type: string) => {
        return items.filter(item => {
            // Logic: if item.type is undefined/null, assume it is 'mutasi' for backward compatibility
            const itemType = item.type || 'mutasi';
            const matchesType = itemType === type;
            
            const matchesSearch = searchTerm === '' || 
                item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStock = stockFilter === 'all' ||
                (stockFilter === '0' && item.quantity === 0) ||
                (stockFilter === 'less5' && item.quantity < 5) ||
                (stockFilter === 'most' && item.quantity >= 10);
            
            return matchesType && matchesSearch && matchesStock;
        }).sort((a, b) => {
            if (stockFilter === 'most') {
                return b.quantity - a.quantity;
            }
            return 0;
        });
    };

    const handlePrint = (currentItems: DataBarang[]) => {
        const printContent = `
            <html>
                <head>
                    <title>Laporan Data Barang</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .filter-info { margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
                        @media print { body { margin: 10px; } }
                    </style>
                </head>
                <body>
                    <h1>LAPORAN DATA BARANG (${activeTab === 'mutasi' ? 'MUTASI' : 'BENGKEL'})</h1>
                    <div class="filter-info">
                        <strong>Filter:</strong> ${stockFilter === 'all' ? 'Semua Data' : stockFilter === '0' ? 'Stok = 0' : stockFilter === 'less5' ? 'Stok < 5' : 'Stok Terbanyak (≥10)'}
                        ${searchTerm ? `<br><strong>Pencarian:</strong> "${searchTerm}"` : ''}
                        <br><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}
                        <br><strong>Total Data:</strong> ${currentItems.length} barang
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Kode Barang</th>
                                <th>Nama Barang</th>
                                <th>Stok</th>
                                <th>Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${currentItems.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.code}</td>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleAddItem = async () => {
        if (!newItem.code || !newItem.name) {
            toast.error("Kode dan Nama Barang wajib diisi");
            return;
        }

        const price = Number(newItem.price);

        setIsAdding(true);
        try {
            await addPartAction({
                code: newItem.code,
                name: newItem.name,
                price: price,
                type: 'bengkel'
            });
            toast.success("Barang bengkel berhasil ditambahkan");
            setIsAddOpen(false);
            setNewItem({ code: '', name: '', price: 0 });
            reload();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Gagal menambah barang");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Data Barang</h1>
            </header>

            <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="mutasi">Barang Mutasi</TabsTrigger>
                        <TabsTrigger value="bengkel">Barang Bengkel</TabsTrigger>
                    </TabsList>

                    {/* Common Filters Area */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Cari kode atau nama barang..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            {isClient && (
                            <div className="w-full sm:w-48">
                                <Select value={stockFilter} onValueChange={setStockFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter Stok" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Stok</SelectItem>
                                        <SelectItem value="0">Stok = 0 (Habis)</SelectItem>
                                        <SelectItem value="less5">Stok &lt; 5 (Menipis)</SelectItem>
                                        <SelectItem value="most">Stok Terbanyak (≥10)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            )}
                            <Button onClick={() => handlePrint(getFilteredItems(activeTab))} variant="outline" className="whitespace-nowrap">
                                <Printer className="w-4 h-4 mr-2" />
                                Cetak
                            </Button>
                            
                            {activeTab === 'bengkel' && (
                                <Button onClick={() => setIsAddOpen(true)} className="whitespace-nowrap">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Barang
                                </Button>
                            )}
                        </div>
                    </div>

                    <TabsContent value="mutasi">
                         <div className="text-sm text-gray-600 mb-4">
                            Menampilkan {getFilteredItems('mutasi').length} data barang mutasi
                         </div>
                        <DataTable
                            items={getFilteredItems('mutasi')}
                            loading={loading}
                            onEdit={(id, item) => updateItem(id, item)}
                            onDelete={(id) => deleteItem(id)}
                            columns={columns}
                            title="Data Barang Mutasi"
                        />
                         <p className="text-xs text-muted-foreground mt-4">
                            * Barang mutasi disinkronisasi dengan data Sheet1.
                         </p>
                    </TabsContent>

                    <TabsContent value="bengkel">
                        <div className="text-sm text-gray-600 mb-4">
                            Menampilkan {getFilteredItems('bengkel').length} data barang bengkel
                         </div>
                        <DataTable
                            items={getFilteredItems('bengkel')}
                            loading={loading}
                            onEdit={(id, item) => updateItem(id, item)}
                            onDelete={(id) => deleteItem(id)}
                            columns={columns}
                            title="Data Barang Bengkel"
                        />
                         <p className="text-xs text-muted-foreground mt-4">
                            * Barang bengkel dikelola secara manual (CRUD).
                         </p>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Add Item Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Barang Bengkel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">
                                Kode
                            </Label>
                            <Input
                                id="code"
                                value={newItem.code}
                                onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nama
                            </Label>
                            <Input
                                id="name"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Harga
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={newItem.price}
                                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                        <Button onClick={handleAddItem} disabled={isAdding}>
                            {isAdding ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    );
}

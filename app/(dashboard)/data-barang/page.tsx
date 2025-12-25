"use client";

import React, { useState, useEffect } from "react";
import { useDataBarang, DataBarang } from "@/hooks/useDataBarang";
import { useDataBarangMutasi } from "@/hooks/useDataBarangMutasi";
import { DataTable } from "@/components/shared/DataTable";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Printer, Plus, ChevronDown, Trash2, RefreshCw, Minus, ArrowUpCircle, ArrowDownCircle, Package } from "lucide-react";
import { addPartAction } from "@/services/data-barang/data-barang";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DataBarangMutasi } from "@/services/data-barang/data-barang-mutasi";

function CollapsibleRow({ mutation, onDelete }: { mutation: DataBarangMutasi; onDelete: (code: string) => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
            <>
                <TableRow className="group">
                    <TableCell>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                <span className="sr-only">Toggle details</span>
                            </Button>
                        </CollapsibleTrigger>
                    </TableCell>
                    <TableCell className="font-medium">{mutation.transactionCode}</TableCell>
                    <TableCell>{mutation.customerName}</TableCell>
                    <TableCell>{new Date(mutation.datePurchase).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-right">{mutation.items.length} Item</TableCell>
                    <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={async () => {
                                if(confirm('Hapus data mutasi ini?')) {
                                    await onDelete(mutation.transactionCode);
                                    toast.success('Data terhapus');
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
                <CollapsibleContent asChild>
                    <TableRow>
                        <TableCell colSpan={6} className="p-0 bg-muted/30">
                            <div className="p-4 pl-12">
                                <h4 className="mb-2 text-sm font-semibold">Detail Barang</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b-white/10">
                                            <TableHead className="h-8 text-xs">Nama Barang</TableHead>
                                            <TableHead className="h-8 text-xs text-right">Qty</TableHead>
                                            <TableHead className="h-8 text-xs">Supplier</TableHead>
                                            <TableHead className="h-8 text-xs">Harga</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mutation.items.map((item, idx) => (
                                            <TableRow key={idx} className="border-b-0 hover:bg-muted/50">
                                                <TableCell className="py-2 text-xs">{item.itemName}</TableCell>
                                                <TableCell className="py-2 text-xs text-right">{item.quantity}</TableCell>
                                                <TableCell className="py-2 text-xs text-muted-foreground">{item.supplierCode || '-'}</TableCell>
                                                <TableCell className="py-2 text-xs text-muted-foreground">{item.priceCode || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TableCell>
                    </TableRow>
                </CollapsibleContent>
            </>
        </Collapsible>
    );
}

export default function DataBarangPage() {
    const { items, loading: loadingItems, updateItem, deleteItem, reload: reloadItems } = useDataBarang();
    const { mutations, loading: loadingMutations, deleteMutation, syncMutation, reload: reloadMutations } = useDataBarangMutasi();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [activeTab, setActiveTab] = useState("mutasi");
    const [isClient, setIsClient] = useState(false);
    
    // Add Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({ code: '', name: '', price: 0 });
    const [isAdding, setIsAdding] = useState(false);
    // Sync Stock Modal State
    const [isSyncOpen, setIsSyncOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
    const [selectedMutation, setSelectedMutation] = useState<DataBarangMutasi | null>(null);
    const [syncMode, setSyncMode] = useState<'add' | 'subtract'>('add');
    const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Columns for Bengkel (Item Master)
    const columnsBengkel = [
        { key: 'code' as const, label: 'Kode Barang', type: 'text' as const, editable: true },
        { key: 'name' as const, label: 'Nama Barang', type: 'text' as const, editable: true },
        { key: 'quantity' as const, label: 'Kuantitas', type: 'number' as const, editable: false },
        { key: 'price' as const, label: 'Harga', type: 'number' as const, editable: true },
    ];

    // Filter logic for Bengkel Items
    const getFilteredItems = () => {
        return items.filter(item => {
            const itemType = item.type || 'mutasi'; // Fallback if undefined, though we usually filter by tab
            const matchesType = itemType === 'bengkel'; 
            
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

    // Filter logic for Mutasi Transactions
    const getFilteredMutations = () => {
        return mutations.filter(m => {
            const matchesSearch = searchTerm === '' ||
                m.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    };

    const handlePrint = () => {
        // Implement print logic based on active tab
        const content = activeTab === 'mutasi' ? getFilteredMutations() : getFilteredItems();
        // ... (Simplified print just ensures basic functionality for now)
        window.print(); 
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
            reloadItems();
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
                        <TabsTrigger value="mutasi">Barang Mutasi (Transaksi)</TabsTrigger>
                        <TabsTrigger value="bengkel">Barang Bengkel (Master)</TabsTrigger>
                    </TabsList>

                    {/* Common Filters Area */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder={activeTab === 'mutasi' ? "Cari kode transaksi, customer..." : "Cari kode atau nama barang..."}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            {activeTab === 'bengkel' && isClient && (
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

                            <Button onClick={handlePrint} variant="outline" className="whitespace-nowrap">
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
                            Menampilkan {getFilteredMutations().length} data transaksi mutasi
                         </div>
                        
                        {/* Custom Table for Mutations since structure is different */}
                         <div className="rounded-md border">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Kode Transaksi</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Customer</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Tanggal</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Item</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right w-[200px]">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {loadingMutations ? (
                                            <tr>
                                                <td colSpan={5} className="h-24 text-center">Loading...</td>
                                            </tr>
                                        ) : getFilteredMutations().length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="h-24 text-center">Tidak ada data</td>
                                            </tr>
                                        ) : (
                                            getFilteredMutations().map((mutation) => (
                                                <tr key={mutation.transactionCode} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle font-medium">{mutation.transactionCode}</td>
                                                    <td className="p-4 align-middle">{mutation.customerName}</td>
                                                    <td className="p-4 align-middle">{new Date(mutation.datePurchase).toLocaleDateString('id-ID')}</td>
                                                    <td className="p-4 align-middle">
                                                        <ul className="list-disc list-inside text-xs">
                                                            {mutation.items.map((item, idx) => (
                                                                <li key={idx}>
                                                                    {item.itemName} (Qty: {item.quantity})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                                                onClick={() => {
                                                                    setSelectedTransaction(mutation.transactionCode);
                                                                    setSelectedMutation(mutation);
                                                                    // Initialize custom quantities with mutation quantities as defaults
                                                                    const initialQty: Record<string, number> = {};
                                                                    mutation.items.forEach(item => {
                                                                        initialQty[item.itemName] = item.quantity;
                                                                    });
                                                                    setCustomQuantities(initialQty);
                                                                    setSyncMode('add'); // Reset to default mode
                                                                    setIsSyncOpen(true);
                                                                }}
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-1" />
                                                                <span className="hidden sm:inline">Sync</span>
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                                                onClick={async () => {
                                                                    if(confirm(`Yakin ingin menghapus transaksi ${mutation.transactionCode}?\n\nData ini akan dihapus permanen dan tidak bisa dikembalikan.`)) {
                                                                        try {
                                                                            await deleteMutation(mutation.transactionCode);
                                                                            toast.success('Transaksi berhasil dihapus');
                                                                        } catch (error) {
                                                                            toast.error('Gagal menghapus transaksi');
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                         <p className="text-xs text-muted-foreground mt-4">
                            * Data ini berasal dari tabel transaction_mutation (Scan Sheet).
                         </p>
                    </TabsContent>

                    <TabsContent value="bengkel">
                        <div className="text-sm text-gray-600 mb-4">
                            Menampilkan {getFilteredItems().length} data barang bengkel
                         </div>
                        <DataTable
                            items={getFilteredItems()}
                            loading={loadingItems}
                            onEdit={(id, item) => updateItem(id, item)}
                            onDelete={(id) => deleteItem(id)}
                            columns={columnsBengkel}
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

            {/* Sync Stock Modal */}
            <Dialog open={isSyncOpen} onOpenChange={setIsSyncOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Sinkronkan Stok</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4 mt-4">
                        <div className="text-sm">
                            <p className="text-muted-foreground">Transaksi: <span className="font-medium text-foreground">{selectedTransaction}</span></p>
                            {selectedMutation && (
                                <p className="text-muted-foreground mt-1">Customer: <span className="font-medium text-foreground">{selectedMutation.customerName}</span></p>
                            )}
                        </div>

                        {/* Mode Selector */}
                        <div className="flex gap-2 p-2 bg-muted rounded-lg">
                            <Button
                                variant={syncMode === 'add' ? 'default' : 'ghost'}
                                size="sm"
                                className="flex-1"
                                onClick={() => setSyncMode('add')}
                            >
                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                                Tambah Stok
                            </Button>
                            <Button
                                variant={syncMode === 'subtract' ? 'destructive' : 'ghost'}
                                size="sm"
                                className="flex-1"
                                onClick={() => setSyncMode('subtract')}
                            >
                                <ArrowDownCircle className="h-4 w-4 mr-2" />
                                Kurangi Stok
                            </Button>
                        </div>

                        {/* Items List with Quantity Inputs */}
                        {selectedMutation && (
                            <div className="border rounded-lg">
                                <div className="bg-muted/50 px-4 py-2 border-b">
                                    <h4 className="text-sm font-semibold flex items-center">
                                        <Package className="h-4 w-4 mr-2" />
                                        Daftar Barang ({selectedMutation.items.length} item)
                                    </h4>
                                </div>
                                <div className="divide-y max-h-64 overflow-y-auto">
                                    {selectedMutation.items.map((item, idx) => (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/30">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{item.itemName}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Qty asli: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`qty-${idx}`} className="text-sm whitespace-nowrap">
                                                    Jumlah:
                                                </Label>
                                                <Input
                                                    id={`qty-${idx}`}
                                                    type="number"
                                                    min="0"
                                                    className="w-24"
                                                    value={customQuantities[item.itemName] || 0}
                                                    onChange={(e) => {
                                                        const newValue = parseInt(e.target.value) || 0;
                                                        setCustomQuantities(prev => ({
                                                            ...prev,
                                                            [item.itemName]: newValue
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
                            <p>
                                <strong>Mode {syncMode === 'add' ? 'Tambah' : 'Kurangi'}:</strong> Stok master akan di
                                <strong>{syncMode === 'add' ? 'tambah' : 'kurangi'}</strong> sesuai jumlah yang Anda masukkan.
                            </p>
                        </div>
                    </div>
                    
                    <DialogFooter className="mt-4 gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsSyncOpen(false)}
                            className="min-w-24"
                        >
                            Batal
                        </Button>
                        <Button 
                            variant={syncMode === 'add' ? 'default' : 'destructive'}
                            onClick={async () => {
                                if (selectedTransaction) {
                                    const itemCount = Object.keys(customQuantities).length;
                                    if(confirm(`Yakin ingin ${syncMode === 'add' ? 'menambah' : 'mengurangi'} stok untuk ${itemCount} item?`)) {
                                        try {
                                            await syncMutation(selectedTransaction, syncMode, customQuantities);
                                            toast.success(`Stok berhasil ${syncMode === 'add' ? 'ditambah' : 'dikurangi'}`);
                                            reloadItems();
                                        } catch (e) {
                                            toast.error(e instanceof Error ? e.message : 'Gagal sinkronisasi');
                                        } finally {
                                            setIsSyncOpen(false);
                                        }
                                    }
                                }
                            }}
                            className="min-w-32"
                        >
                            {syncMode === 'add' ? <ArrowUpCircle className="h-4 w-4 mr-2" /> : <ArrowDownCircle className="h-4 w-4 mr-2" />}
                            Terapkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    );
}

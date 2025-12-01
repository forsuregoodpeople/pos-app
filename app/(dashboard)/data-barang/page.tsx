"use client";

import React, { useState, useEffect } from "react";
import { useDataBarang } from "@/hooks/useDataBarang";
import { useProducts } from "@/hooks/useProducts";
import { DataTable } from "@/components/shared/DataTable";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Printer } from "lucide-react";

export default function DataBarangPage() {
    const { items, loading, updateItem, deleteItem, error } = useDataBarang();
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');

    const columns = [
        { key: 'code' as const, label: 'Kode Barang', type: 'text' as const, editable: false },
        { key: 'name' as const, label: 'Nama Barang', type: 'text' as const, editable: false },
        { key: 'quantity' as const, label: 'Kuantitas', type: 'number' as const, editable: false },
        { key: 'price' as const, label: 'Harga', type: 'number' as const, editable: true },
    ];

    const filteredItems = items.filter(item => {
        const matchesSearch = searchTerm === '' || 
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStock = stockFilter === 'all' ||
            (stockFilter === '0' && item.quantity === 0) ||
            (stockFilter === 'less5' && item.quantity < 5);
        
        return matchesSearch && matchesStock;
    });

    const handlePrint = () => {
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
                    <h1>LAPORAN DATA BARANG</h1>
                    <div class="filter-info">
                        <strong>Filter:</strong> ${stockFilter === 'all' ? 'Semua Data' : stockFilter === '0' ? 'Stok = 0' : 'Stok < 5'}
                        ${searchTerm ? `<br><strong>Pencarian:</strong> "${searchTerm}"` : ''}
                        <br><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}
                        <br><strong>Total Data:</strong> ${filteredItems.length} barang
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
                            ${filteredItems.map((item, index) => `
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

    return (
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Data Barang</h1>
            </header>

            <div className="p-6">
                {/* Filters */}
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
                        <div className="w-full sm:w-48">
                            <Select value={stockFilter} onValueChange={setStockFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter Stok" />
                                </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Stok</SelectItem>
                            <SelectItem value="0">Stok = 0 (Habis)</SelectItem>
                            <SelectItem value="less5">Stok &lt; 5 (Menipis)</SelectItem>
                        </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handlePrint} className="whitespace-nowrap">
                            <Printer className="w-4 h-4 mr-2" />
                            Cetak
                        </Button>
                    </div>
                    
                    {/* Filter Summary */}
                    <div className="text-sm text-gray-600">
                        Menampilkan {filteredItems.length} dari {items.length} data barang
                        {stockFilter !== 'all' && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                {stockFilter === '0' ? 'Stok Habis' : 'Stok Menipis'}
                            </span>
                        )}
                        {searchTerm && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                Pencarian: "{searchTerm}"
                            </span>
                        )}
                    </div>
                </div>

                <DataTable
                    items={filteredItems}
                    loading={loading}
                    onEdit={(id, item) => updateItem(id, item)}
                    onDelete={(id) => deleteItem(id)}
                    columns={columns}
                    title="Data Barang"
                />
            </div>
        </SidebarInset>
    );
}

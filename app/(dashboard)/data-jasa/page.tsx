"use client";

import React, { useState } from "react";
import { useDataJasa } from "@/hooks/useDataJasa";
import { DataTable } from "@/components/shared/DataTable";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Printer } from "lucide-react";

export default function DataJasaPage() {
    const { items, loading, addItem, updateItem, deleteItem } = useDataJasa();
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        { key: 'name' as const, label: 'Nama Jasa', type: 'text' as const },
        { key: 'price' as const, label: 'Harga', type: 'number' as const },
    ];

    const filteredItems = items.filter(item => {
        return searchTerm === '' || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handlePrint = () => {
        const printContent = `
            <html>
                <head>
                    <title>Laporan Data Jasa</title>
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
                    <h1>LAPORAN DATA JASA</h1>
                    <div class="filter-info">
                        ${searchTerm ? `<strong>Pencarian:</strong> "${searchTerm}"` : '<strong>Semua Data Jasa</strong>'}
                        <br><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}
                        <br><strong>Total Data:</strong> ${filteredItems.length} jasa
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Jasa</th>
                                <th>Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredItems.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.name}</td>
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
                <h1 className="text-lg font-semibold">Data Jasa</h1>
            </header>

            <div className="p-6">
                {/* Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Cari nama jasa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button onClick={handlePrint} className="whitespace-nowrap">
                            <Printer className="w-4 h-4 mr-2" />
                            Cetak
                        </Button>
                    </div>
                    
                    {/* Filter Summary */}
                    <div className="text-sm text-gray-600">
                        Menampilkan {filteredItems.length} dari {items.length} data jasa
                        {searchTerm && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                Pencarian: "${searchTerm}"
                            </span>
                        )}
                    </div>
                </div>

                <DataTable
                    items={filteredItems}
                    loading={loading}
                    onAdd={(item) => addItem(item)}
                    onEdit={(id, item) => updateItem(id, item)}
                    onDelete={(id) => deleteItem(id)}
                    columns={columns}
                    title="Data Jasa"
                />
            </div>
        </SidebarInset>
    );
}

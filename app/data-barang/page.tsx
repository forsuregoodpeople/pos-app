"use client";

import React, { useState, useEffect } from "react";
import { useDataBarang } from "@/hooks/useDataBarang";
import { useProducts } from "@/hooks/useProducts";
import { DataTable } from "@/components/shared/DataTable";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function DataBarangPage() {
    const { items, loading, addItem, updateItem, deleteItem } = useDataBarang();
    const { syncPartsFromBarang } = useProducts();

    useEffect(() => {
        syncPartsFromBarang();
    }, [items]);

    const columns = [
        { key: 'name' as const, label: 'Nama Barang', type: 'text' as const },
        { key: 'price' as const, label: 'Harga', type: 'number' as const },
    ];

    return (
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Data Barang</h1>
            </header>

            <div className="p-6">
                <DataTable
                    items={items}
                    loading={loading}
                    onAdd={(item) => addItem(item)}
                    onEdit={(id, item) => updateItem(id, item)}
                    onDelete={(id) => deleteItem(id)}
                    columns={columns}
                    title="Data Barang"
                />
            </div>
        </SidebarInset>
    );
}

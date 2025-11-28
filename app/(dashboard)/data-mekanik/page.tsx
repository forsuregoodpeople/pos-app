"use client";

import React from "react";
import { useDataMekanik } from "@/hooks/useDataMekanik";
import { DataTable } from "@/components/shared/DataTable";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function DataMekanikPage() {
    const { items, loading, addItem, updateItem, deleteItem } = useDataMekanik();

    const columns = [
        { key: 'name' as const, label: 'Nama Mekanik', type: 'text' as const },
    ];

    return (
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Data Mekanik</h1>
            </header>

            <div className="p-6">
                <DataTable
                    items={items}
                    loading={loading}
                    onAdd={(item) => addItem(item)}
                    onEdit={(id, item) => updateItem(id, item)}
                    onDelete={(id) => deleteItem(id)}
                    columns={columns}
                    title="Data Mekanik"
                />
            </div>
        </SidebarInset>
    );
}

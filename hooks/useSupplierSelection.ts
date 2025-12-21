import { useState } from "react";

export interface Supplier {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    contact_person?: string;
}

export function useSupplierSelection() {
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const updateSupplier = (supplierData: Partial<Supplier>) => {
        setSupplier(prev => ({ ...prev, ...supplierData } as Supplier));
    };

    const setSupplierFromHistory = (historySupplier: Supplier) => {
        setSupplier(historySupplier);
    };

    const clearSupplier = () => {
        setSupplier(null);
    };

    return {
        supplier,
        updateSupplier,
        setSupplierFromHistory,
        clearSupplier,
        searchQuery,
        setSearchQuery
    };
}
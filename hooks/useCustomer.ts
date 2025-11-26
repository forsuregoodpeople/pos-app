import { useState } from 'react';

export interface MechanicInfo {
    name: string;
    percentage: number;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    kmMasuk: string;
    mobil: string;
    platNomor: string;
    tipe : string;
    mekanik?: string;
    mekaniks?: MechanicInfo[];
}

export function useCustomer() {
    const [customer, setCustomer] = useState<CustomerInfo>({
        name: "",
        phone: "",
        kmMasuk: "",
        mobil: "",
        platNomor: "",
        tipe : "",
        mekanik: "",
        mekaniks: []
    });

    const updateCustomer = (field: keyof CustomerInfo, value: string) => {
        setCustomer(prev => ({ ...prev, [field]: value }));
    };

    const setCustomerFromHistory = (historyCustomer: CustomerInfo) => {
        setCustomer(historyCustomer);
    };

    const clearCustomer = () => {
        setCustomer({
            name: "",
            phone: "",
            kmMasuk: "",
            mobil: "",
            platNomor: "",
            tipe : "",
            mekanik: "",
            mekaniks: []
        });
    };

    return {
        customer,
        setCustomer,
        updateCustomer,
        setCustomerFromHistory,
        clearCustomer,
    };
}

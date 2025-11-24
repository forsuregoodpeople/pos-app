import { useState, useEffect } from 'react';

export interface CustomerInfo {
    name: string;
    phone: string;
    kmMasuk: string;
    mobil: string;
    platNomor: string;
}

export function useCustomer() {
    const [customer, setCustomer] = useState<CustomerInfo>({
        name: "",
        phone: "",
        kmMasuk: "",
        mobil: "",
        platNomor: ""
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
            platNomor: ""
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

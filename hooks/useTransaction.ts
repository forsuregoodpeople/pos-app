import { useState, useEffect } from 'react';
import { CartItem } from './useCart';
import { CustomerInfo } from './useCustomer';

export interface Transaction {
    invoiceNumber: string;
    date: string;
    customer: CustomerInfo;
    items: CartItem[];
    total: number;
    savedAt: string;
}

export function useTransaction() {
    const [invoiceNumber, setInvoiceNumber] = useState('INV-LOADING');
    const [date] = useState(() => new Date().toISOString().split('T')[0]);
    const rand : number = Math.floor((Math.random() * 1000) + 1);


    useEffect(() => {
        const date = new Date();
        const newInvoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(rand).padStart(3, '0')}`;
        setInvoiceNumber(newInvoiceNumber);
    }, []);

    const saveInvoice = (customer: CustomerInfo, items: CartItem[], total: number) => {
        const invoiceData: Transaction = {
            invoiceNumber,
            date,
            customer,
            items,
            total,
            savedAt: new Date().toISOString()
        };

        const savedInvoices = localStorage.getItem("invoices");
        const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
        invoices.push(invoiceData);
        localStorage.setItem("invoices", JSON.stringify(invoices));

        return invoiceData;
    };

    return {
        invoiceNumber,
        date,
        saveInvoice,
    };
}

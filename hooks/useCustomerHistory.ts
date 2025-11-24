import { useState, useEffect } from 'react';
import { CustomerInfo } from './useCustomer';
import { Transaction } from './useTransaction';

export function useCustomerHistory(searchQuery: string) {
    const [customerHistory, setCustomerHistory] = useState<Transaction[]>([]);

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const savedInvoices = localStorage.getItem("invoices");
            if (savedInvoices) {
                const invoices: Transaction[] = JSON.parse(savedInvoices);

                // Find all unique customers matching the search
                const matchingCustomers = new Map<string, CustomerInfo>();

                invoices.forEach(inv => {
                    const nameMatch = inv.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const platMatch = inv.customer.platNomor.toLowerCase().includes(searchQuery.toLowerCase());

                    if (nameMatch || platMatch) {
                        const key = `${inv.customer.name}-${inv.customer.platNomor}`;
                        if (!matchingCustomers.has(key)) {
                            matchingCustomers.set(key, inv.customer);
                        }
                    }
                });

                // Get all transactions for matching customers
                const uniqueCustomers = Array.from(matchingCustomers.values());
                const historyResults: Transaction[] = [];

                uniqueCustomers.forEach(cust => {
                    const customerTransactions = invoices.filter(inv =>
                        inv.customer.name === cust.name &&
                        inv.customer.platNomor === cust.platNomor
                    );
                    historyResults.push(...customerTransactions);
                });

                // Sort by date, newest first
                historyResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setCustomerHistory(historyResults);
            } else {
                setCustomerHistory([]);
            }
        } else {
            setCustomerHistory([]);
        }
    }, [searchQuery]);

    return customerHistory;
}

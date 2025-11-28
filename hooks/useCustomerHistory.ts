import { useState, useEffect } from 'react';
import { CustomerInfo } from './useCustomer';
import { Transaction } from './useTransaction';
import { useTransaction } from './useTransaction';

export function useCustomerHistory(searchQuery: string) {
    const [customerHistory, setCustomerHistory] = useState<Transaction[]>([]);
    const { transactions } = useTransaction();

    useEffect(() => {
        if (searchQuery.trim().length > 0 && transactions.length > 0) {
            // Find all unique customers matching search
            const matchingCustomers = new Map<string, CustomerInfo>();

            transactions.forEach(inv => {
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
                const customerTransactions = transactions.filter(inv =>
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
    }, [searchQuery, transactions]);

    return customerHistory;
}
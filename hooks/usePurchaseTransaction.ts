import { useState } from "react";
import { createPurchaseAction, generatePurchaseInvoiceNumber } from "@/services/pembelian/pembelian";

export function usePurchaseTransaction() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const savePurchase = async (
        supplier: any,
        items: any[],
        total: number,
        notes?: string
    ) => {
        setLoading(true);
        setError(null);

        try {
            const invoiceNumber = generatePurchaseInvoiceNumber();
            
            const purchaseData = {
                invoice_number: invoiceNumber,
                supplier_id: supplier?.id,
                purchase_date: new Date().toISOString(),
                total_amount: total,
                discount_amount: 0,
                final_amount: total,
                payment_status: 'pending' as const,
                notes: notes,
                created_by: 'system' // TODO: Get from auth context
            };

            const purchaseItems = items.map(item => ({
                item_name: item.name,
                item_type: 'part' as const,
                quantity: item.qty,
                unit_price: item.price,
                total_price: item.subtotal
            }));

            const result = await createPurchaseAction(purchaseData, purchaseItems);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan pembelian';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const date = new Date().toISOString();

    return {
        date,
        savePurchase,
        loading,
        error
    };
}
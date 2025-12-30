import { useState } from "react";
import { createPurchaseAction, generatePurchaseInvoiceNumber } from "@/services/pembelian/pembelian";

export function usePurchaseTransaction() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const savePurchase = async (
        supplier: any,
        items: any[],
        total: number,
        notes?: string,
        paymentMethodId?: string,
        paymentStatus: 'paid' | 'pending' = 'pending'
    ) => {
        setLoading(true);
        setError(null);

        try {
            const invoiceNumber = generatePurchaseInvoiceNumber();
            
            // Logic: Use the passed paymentStatus
            // If user selected "Belum Lunas" -> Force pending even if payment method exists (though UI hides it)
            // If user selected "Lunas" -> Paid
            const isPaid = paymentStatus === 'paid';
            
            const purchaseData = {
                invoice_number: invoiceNumber,
                supplier_id: supplier?.id,
                purchase_date: date,
                total_amount: total,
                discount_amount: 0,
                final_amount: total,
                payment_status: paymentStatus,
                paid_amount: isPaid ? total : 0,
                payment_method: isPaid ? (paymentMethodId || undefined) : undefined,
                notes: notes,
            };

            const purchaseItems = items.map(item => ({
                item_name: item.name,
                item_type: 'part' as const,
                item_code: item.code,
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

    return {
        date,
        setDate,
        savePurchase,
        loading,
        error
    };
}
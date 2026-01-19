"use client";

import { PrintReceipt } from "@/components/pos/PrintReceipt";

export default function TestPrintPage() {
    const dummyCustomer = {
        name: "Test Customer",
        phone: "081234567890",
        id: "1",
        platNomor: "B 1234 AB",
        mobil: "Toyota Avanza",
        kmMasuk: "10000",
        tipe: "umum"
    };

    const dummyItems = [
        {
            id: "1",
            name: "Ganti Oli",
            price: 50000,
            qty: 1,
            type: "service" as "service",
            discount: 0
        }
    ];

    return (
        <div>
            <h1>Test Print Page</h1>
            <PrintReceipt
                invoiceNumber="INV-001"
                date={new Date().toISOString()}
                customer={dummyCustomer}
                items={dummyItems}
                subtotal={50000}
                biayaLain={0}
                total={50000}
            />
        </div>
    );
}

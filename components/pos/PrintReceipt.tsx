"use client";

import React from "react";
import { CartItem } from "@/hooks/useCart";
import { CustomerInfo } from "@/hooks/useCustomer";

interface PrintReceiptProps {
    invoiceNumber: string;
    date: string;
    customer: CustomerInfo;
    items: CartItem[];
    total: number;
}

export function PrintReceipt({
    invoiceNumber,
    date,
    customer,
    items,
    total,
}: PrintReceiptProps) {
    const cartServices = items.filter(item => item.type === "service");
    const cartParts = items.filter(item => item.type === "part");

    return (
        <div className="printable-receipt hidden">
            <div className="p-4 text-xs">
                <div className="text-center mb-4 border-b-2 border-black pb-2">
                    <h1 className="font-bold text-lg">Sunda Service</h1>
                    <p className="text-xs">Jln Panjunan No.112 Cirebon</p>
                    <p className="text-xs">(0231) 234997</p>
                </div>

                <div className="mb-3 space-y-1">
                    <div className="flex justify-between">
                        <span>Invoice:</span>
                        <span className="font-bold">{invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tanggal:</span>
                        <span>{new Date(date).toLocaleDateString('id-ID')}</span>
                    </div>
                    {customer.name && (
                        <>
                            <div className="border-t border-dashed border-black my-2"></div>
                            <div><strong>{customer.name}</strong></div>
                            {customer.phone && <div>{customer.phone}</div>}
                            {customer.mobil && <div>{customer.mobil} {customer.platNomor}</div>}
                            {customer.kmMasuk && <div>KM: {customer.kmMasuk}</div>}
                        </>
                    )}
                </div>

                <div className="border-t-2 border-black pt-2 mb-2">
                    {cartServices.length > 0 && (
                        <div className="mb-2">
                            <div className="font-bold text-xs mb-1">JASA:</div>
                            {cartServices.map((item, idx) => (
                                <div key={idx} className="mb-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>{item.qty} x Rp {item.price.toLocaleString('id-ID')}</span>
                                        <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {cartParts.length > 0 && (
                        <div>
                            <div className="font-bold text-xs mb-1">BARANG:</div>
                            {cartParts.map((item, idx) => (
                                <div key={idx} className="mb-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>{item.qty} x Rp {item.price.toLocaleString('id-ID')}</span>
                                        <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t-2 border-black pt-2 mb-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>TOTAL</span>
                        <span>Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="text-center text-xs border-t border-dashed border-black pt-2">
                    <p>Terima kasih atas kunjungan Anda!</p>
                    <p>Barang yang sudah dibeli tidak dapat ditukar</p>
                </div>
            </div>
        </div>
    );
}

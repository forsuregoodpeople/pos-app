import React from "react";
import { Building, Calendar, FileText, Package } from "lucide-react";
import { PurchaseCartItem } from "@/hooks/usePurchaseCart";

interface PrintPurchaseReceiptProps {
    invoiceNumber: string;
    date: string;
    supplier: any;
    items: PurchaseCartItem[];
    subtotal: number;
    total: number;
    keterangan?: string;
}

export function PrintPurchaseReceipt({
    invoiceNumber,
    date,
    supplier,
    items,
    subtotal,
    total,
    keterangan
}: PrintPurchaseReceiptProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white text-xs">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                        SS
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Sunda Service</h1>
                        <p className="text-xs text-gray-600">Invoice System - Pembelian</p>
                    </div>
                </div>
            </div>

            {/* Invoice Info */}
            <div className="border-t border-b py-3 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3 h-3" />
                            <span className="font-semibold">No. Invoice:</span>
                        </div>
                        <div className="font-mono font-bold text-sm">{invoiceNumber}</div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-semibold">Tanggal:</span>
                        </div>
                        <div className="text-sm">{formatDate(date)}</div>
                    </div>
                </div>
            </div>

            {/* Supplier Info */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Building className="w-3 h-3" />
                    <span className="font-semibold">Supplier:</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">{supplier?.name || '-'}</div>
                    {supplier?.contact_person && (
                        <div className="text-xs text-gray-600">Contact: {supplier.contact_person}</div>
                    )}
                    {supplier?.phone && (
                        <div className="text-xs text-gray-600">Telp: {supplier.phone}</div>
                    )}
                    {supplier?.email && (
                        <div className="text-xs text-gray-600">Email: {supplier.email}</div>
                    )}
                    {supplier?.address && (
                        <div className="text-xs text-gray-600">Alamat: {supplier.address}</div>
                    )}
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Package className="w-3 h-3" />
                    <span className="font-semibold">Detail Barang:</span>
                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="text-left p-2 font-medium">No</th>
                            <th className="text-left p-2 font-medium">Nama Barang</th>
                            <th className="text-center p-2 font-medium">Qty</th>
                            <th className="text-right p-2 font-medium">Harga</th>
                            <th className="text-right p-2 font-medium">Diskon</th>
                            <th className="text-right p-2 font-medium">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id} className="border-b">
                                <td className="p-2 text-center">{index + 1}</td>
                                <td className="p-2">{item.name}</td>
                                <td className="p-2 text-center">{item.qty}</td>
                                <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                                <td className="p-2 text-center">{item.discount}%</td>
                                <td className="p-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mb-4">
                <div className="flex justify-end">
                    <div className="w-64">
                        <div className="flex justify-between py-2 border-b">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span>Total Discount:</span>
                            <span className="text-red-600">{formatCurrency(subtotal - total)}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold text-lg border-b-2 border-black">
                            <span>Total Pembelian:</span>
                            <span className="text-blue-600">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {keterangan && (
                <div className="mb-4">
                    <div className="font-semibold mb-2">Keterangan:</div>
                    <div className="bg-gray-50 p-3 rounded text-gray-700">
                        {keterangan}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t">
                <div className="flex justify-between items-center">
                    <div className="text-center">
                        <div className="mb-8">Supplier</div>
                        <div className="border-b-2 border-black w-32"></div>
                        <div className="text-xs text-gray-600 mt-1">(Tanda Tangan)</div>
                    </div>
                    <div className="text-center">
                        <div className="mb-8">Admin</div>
                        <div className="border-b-2 border-black w-32"></div>
                        <div className="text-xs text-gray-600 mt-1">(Tanda Tangan)</div>
                    </div>
                </div>
            </div>

            {/* Print Info */}
            <div className="text-center text-xs text-gray-500 mt-8">
                <p>Dicetak pada: {formatDate(new Date().toISOString())}</p>
                <p>Ini adalah dokumen sah dari Sunda Service</p>
            </div>
        </div>
    );
}
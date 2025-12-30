"use client";

import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useReturPembelian } from "@/hooks/usePembelian";
import { Plus, Search, ArrowLeftRight, AlertCircle, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default function ReturPembelianPage() {
    const { returns, loading, error } = useReturPembelian();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredReturns = returns.filter(retur =>
        (retur as any).purchase?.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        retur.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'part':
                return <Package className="w-4 h-4" />;
            case 'service':
                return <Wrench className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center justify-between w-full">
                    <h1 className="text-lg font-semibold">Daftar Retur Pembelian</h1>
                </div>
            </header>

            <div className="p-4 md:p-6">
                {/* Search and Add Button */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nomor invoice atau alasan..."
                            className="pl-10 h-10"
                        />
                    </div>
                    <Button asChild className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white shadow-sm h-10 px-4">
                        <Link href="/retur-pembelian/create">
                            <Plus className="w-4 h-4" />
                            Buat Retur Baru
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-2">
                             <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                             <div className="text-gray-500 text-sm">Memuat data retur...</div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-red-500 text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">Gagal memuat data</p>
                            <p className="text-sm opacity-80">{error}</p>
                        </div>
                    </div>
                ) : filteredReturns.length === 0 ? (
                    <div className="flex items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                        <div className="text-center">
                            <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm font-medium text-gray-900">
                                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data retur"}
                            </p>
                            <p className="text-xs mt-1 text-gray-500 max-w-xs mx-auto">
                                {searchQuery 
                                    ? "Coba gunakan kata kunci lain untuk mencari data retur." 
                                    : "Semua pengembalian barang ke supplier akan muncul di sini."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[180px] font-semibold text-gray-900">No Invoice</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Tanggal Retur</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Alasan</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900">Total Item</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900">Total Pengembalian</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900 w-[100px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReturns.map((retur) => (
                                    <TableRow key={retur.id} className="hover:bg-gray-50/60 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 break-all">
                                                    {(retur as any).purchase?.invoice_number || 'No Invoice'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {formatDate(retur.return_date)}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-gray-600" title={retur.reason || ''}>
                                            {retur.reason || '-'}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600">
                                            {(retur as any).items?.length || 0}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium text-gray-900">
                                            Rp {retur.total_amount.toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm" className="h-8 gap-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
                                                <Link href={`/retur-pembelian/${retur.id}/edit`}>
                                                    <Wrench className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </SidebarInset>
    );
}

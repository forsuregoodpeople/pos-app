"use client";

import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useDataBarang } from "@/hooks/useDataBarang";
import { Package, Search, AlertCircle, RefreshCw, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function LaporanStokPage() {
    const { items, loading, error, reload } = useDataBarang();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4 no-print">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center justify-between w-full">
                    <h1 className="text-lg font-semibold">Laporan Stok Barang</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => reload()}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="default" size="sm" onClick={handlePrint} className="bg-black hover:bg-neutral-800">
                            <Printer className="w-4 h-4 mr-2" />
                            Cetak Laporan
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-4 md:p-6 print:p-0">
                {/* Search Bar */}
                <div className="mb-6 max-w-md relative no-print">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Cari nama barang atau kode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10"
                    />
                </div>

                {/* Print Header */}
                <div className="hidden print:block mb-8 text-center">
                    <h1 className="text-2xl font-bold">Laporan Stok Barang</h1>
                    <p className="text-gray-500">Sunda Service</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                            <div className="text-gray-500 text-sm">Memuat data stok...</div>
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
                ) : (
                    <div className="rounded-md border bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
                        <Table>
                            <TableHeader className="bg-gray-50/50 print:bg-transparent">
                                <TableRow>
                                    <TableHead className="w-[120px] font-semibold text-gray-900 border-b print:border-black">Kode</TableHead>
                                    <TableHead className="font-semibold text-gray-900 border-b print:border-black">Nama Barang</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900 border-b print:border-black">Harga Jual</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-[120px] border-b print:border-black">Stok Saat Ini</TableHead> 
                                    <TableHead className="text-right font-semibold text-gray-900 w-[180px] border-b print:border-black">Terakhir Update</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                            Tidak ada data barang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => (
                                        <TableRow key={item.code} className="hover:bg-gray-50/60 transition-colors print:hover:bg-transparent">
                                            <TableCell className="font-mono text-xs font-medium text-gray-500 border-b print:border-gray-300">
                                                {item.code}
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900 border-b print:border-gray-300">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-right border-b print:border-gray-300">
                                                Rp {item.price.toLocaleString("id-ID")}
                                            </TableCell>
                                            <TableCell className="text-center font-mono border-b print:border-gray-300">
                                                <Badge 
                                                    variant="secondary" 
                                                    className={`
                                                        ${item.quantity <= 5 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}
                                                        font-mono min-w-[3rem] justify-center print:bg-transparent print:text-black print:border print:border-black
                                                    `}
                                                >
                                                    {item.quantity}
                                                </Badge>
                                            </TableCell>
                                           
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 20mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </SidebarInset>
    );
}

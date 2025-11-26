"use client";

import WorkshopReceipt from "@/components/example/Receipt";

export default function ReceiptPage() {
    const sampleData = {
        nomor: "2413597",
        tanggal: "11 Sep 2021",
        namaPelanggan: "SUDARSONO",
        alamatPelanggan: "JL. E. NO 11 RT RW 1 KEL KELAPA DUA KEBON JERUK",
        telpPelanggan: "08217328441",
        npwpPelanggan: "00.000.000.0.000.000",
        noSpp: "2413R44 (00000rg-24088441)",
        noPolisi: "B 1234 XYZ",
        merkType: "FORTUNER A1",
        noRangka: "MHFGB8GJ5GA21696",
        kilometer: "86,871",
        serviceItems: [
            {
                no: 1,
                nama: "Pemasangan Condensor",
                qty: "",
                harga_satuan: "Rp. 0",
                diskon: "0.00%",
                harga_netto: "Rp. 0"
            },
            {
                no: 2,
                nama: "Ongkos Pemasangan",
                qty: "Rp.",
                harga_satuan: "Rp. 188,750.00",
                diskon: "0.00%",
                harga_netto: "Rp. 188,750.00"
            },
            {
                no: 3,
                nama: "Ganti Oil Compressor + Vaccum + Freon",
                qty: "Rp.",
                harga_satuan: "Rp. 196,875.00",
                diskon: "0.00%",
                harga_netto: "Rp. 196,250.00"
            },
            {
                no: 4,
                nama: "SPOORING / WHEEL",
                qty: "Rp.",
                harga_satuan: "Rp. 238,000.00",
                diskon: "0.00%",
                harga_netto: "Rp. 238,000.00"
            },
            {
                no: 5,
                nama: "SERVICE BERKALA 90,000 KM",
                qty: "Rp.",
                harga_satuan: "Rp. 1,214,400.00",
                diskon: "20.00%",
                harga_netto: "Rp. 1,003,520.00"
            },
            {
                no: 6,
                nama: "Pemasangan Evaporator (upah)",
                qty: "Rp.",
                harga_satuan: "Rp. 130,000.00",
                diskon: "0.00%",
                harga_netto: "Rp. 130,000.00"
            },
            {
                no: 7,
                nama: "Ganti Motor Servo",
                qty: "Rp.",
                harga_satuan: "Rp. 225,000.00",
                diskon: "0.00%",
                harga_netto: "Rp. 225,000.00"
            },
            {
                no: 8,
                nama: "BALANCING ( 4 RODA )",
                qty: "Rp.",
                harga_satuan: "Rp. 100,000.00",
                diskon: "0.00%",
                harga_netto: "Rp. 795,000.00"
            },
            {
                no: 9,
                nama: "GANTI BALLAST",
                qty: "Rp.",
                harga_satuan: "Rp. 0",
                diskon: "0.00%",
                harga_netto: "Rp. 0"
            },
            {
                no: 10,
                nama: "CERI LYTIC",
                qty: "Rp.",
                harga_satuan: "Rp. 0",
                diskon: "0.00%",
                harga_netto: "Rp. 52,500.00"
            },
            {
                no: 11,
                nama: "Oli + Filter Oli Yang Doper",
                qty: "Rp.",
                harga_satuan: "Rp. 210,000.00",
                diskon: "0.00%",
                harga_netto: "Rp. 210,000.00"
            }
        ],
        parts: [
            {
                no: 1,
                nama: "TKO FRT CLPS GR 1",
                qty: "1.00",
                harga_satuan: "Rp. 1,016,442.00",
                diskon: "0.00%",
                harga_netto: "Rp. 1,016,442.00"
            },
            {
                no: 2,
                nama: "CLEANER 0.3 MIST FR",
                qty: "1.00",
                harga_satuan: "Rp. 257,832.00",
                diskon: "0.00%",
                harga_netto: "Rp. 257,832.00"
            },
            {
                no: 3,
                nama: "Long End Tie Rod",
                qty: "1.00",
                harga_satuan: "Rp. 683,953.95",
                diskon: "0.00%",
                harga_netto: "Rp. 683,954.00"
            }
        ],
        subtotalJasa: "Rp. 4,525,770.00",
        subtotalParts: "Rp. 1,958,228.00",
        dpp: "Rp. 650,588.00",
        ppn: "Rp. 0",
        biayaLain: "Rp. 0",
        grandTotal: "Rp. 6,583,162.00",
        garansi: "Ganti atau tukar 1 Bulan sesuai dengan nilai barang / Limit : LONG END TIE ROD - NON VIRSION : SPC_254"
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Generator Nota Bengkel</h1>
                        <p className="text-sm text-gray-600 mt-1">PT. Astrido Jaya Mobilindo - Authorized Toyota Dealer</p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Cetak Nota
                    </button>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="bg-white shadow-2xl">
                    <WorkshopReceipt data={sampleData} />
                </div>
            </div>
        </div>
    );
}
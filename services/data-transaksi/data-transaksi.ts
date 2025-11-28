'use server'

import { google } from 'googleapis';
import { GoogleAuth } from '../google/googleAuthService';
import { Transaction } from '@/hooks/useTransaction';

const getSheetClient = async () => {
    const sheetTransaksi = process.env.SHEET_TRANSAKSI as string;

    if (!sheetTransaksi) {
        throw new Error('Variabel lingkungan SHEET_TRANSAKSI belum diatur.');
    }

    try {
        const { auth, sheetId } = await GoogleAuth(sheetTransaksi);
        const sheets = google.sheets({ version: 'v4', auth });

        return { sheets, sheetId };
    } catch (error) {
        throw new Error(`Gagal menginisialisasi klien Google Sheets: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`);
    }
};

export async function getTransactionsAction(): Promise<Transaction[]> {
    try {
        const { sheets, sheetId } = await getSheetClient();
        const range = 'Data Transaksi!A:M';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,
        });

        const rows = response.data.values || [];

        if (rows.length <= 1) {
            return [];
        }

        const transactions: Transaction[] = [];

        rows.slice(1).forEach((row) => {
            if (!row[0]) return;

            try {
                const parseJson = (data: string | undefined | null) => {
                    if (!data) return [];
                    try {
                        return JSON.parse(data);
                    } catch (e) {
                        return [];
                    }
                };

                let items = parseJson(row[10]);
                let mekaniks = parseJson(row[9]);

                items = items.map((item: any) => ({
                    id: item.id || '',
                    type: item.type || 'part',
                    name: item.name || 'Unknown Item',
                    price: Number(item.price) || 0,
                    qty: Number(item.qty) || 1,
                    discount: Number(item.discount) || 0
                }));

                const savedAt = row[12] || new Date().toISOString();

                const transaction: Transaction = {
                    invoiceNumber: row[0] || '',
                    date: row[1] || '',
                    customer: {
                        name: row[2] || '',
                        phone: row[3] || '',
                        kmMasuk: row[4] || '',
                        mobil: row[5] || '',
                        platNomor: row[6] || '',
                        tipe: row[7] || 'umum',
                        mekanik: row[8] || '',
                        mekaniks: mekaniks
                    },
                    items: items,
                    total: Number(row[11]) || 0,
                    savedAt: savedAt
                };

                transactions.push(transaction);
            } catch (error) {
                // Error parsing row is handled silently here to avoid excessive logging
            }
        });

        return transactions;
    } catch (error) {
        throw new Error(`Gagal mengambil data transaksi dari Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function saveTransactionAction(transaction: Transaction): Promise<Transaction> {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const row = [
            transaction.invoiceNumber,
            transaction.date,
            transaction.customer.name,
            transaction.customer.phone,
            transaction.customer.kmMasuk,
            transaction.customer.mobil,
            transaction.customer.platNomor,
            transaction.customer.tipe || 'umum',
            transaction.customer.mekanik || '',
            JSON.stringify(transaction.customer.mekaniks || []),
            JSON.stringify(transaction.items),
            transaction.total,
            transaction.savedAt || new Date().toISOString()
        ];

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Data Transaksi!A:M',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row]
            }
        });

        if (response.data.updates && response.data.updates.updatedRows) {
            return transaction;
        }

        throw new Error('Gagal menyimpan transaksi ke Google Sheets.');
    } catch (error) {
        throw new Error(`Gagal menyimpan transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteTransactionAction(invoiceNumber: string) {
    try {
        const { sheets, sheetId } = await getSheetClient();
        const range = 'Data Transaksi!A:A';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,
        });

        const rows = response.data.values || [];
        const rowIndexInArray = rows.findIndex((row: string[]) => row[0] === invoiceNumber);

        if (rowIndexInArray === -1) {
            throw new Error(`Transaksi dengan invoice ${invoiceNumber} tidak ditemukan.`);
        }

        const rowIndexInSheet = rowIndexInArray + 1;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 0,
                            dimension: 'ROWS',
                            startIndex: rowIndexInSheet - 1,
                            endIndex: rowIndexInSheet
                        }
                    }
                }]
            }
        });

        return { success: true };
    } catch (error) {
        throw new Error(`Gagal menghapus transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
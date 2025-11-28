'use server'

import { google } from 'googleapis';
import { GoogleAuth } from '../google/googleAuthService';
import { Transaction } from '@/hooks/useTransaction';

const getSheetClient = async () => {
    const sheetTransaksi = process.env.SHEET_TRANSAKSI as string;
    console.log('SHEET_TRANSAKSI env:', sheetTransaksi ? 'Set' : 'Not set');
    console.log('SHEET_TRANSAKSI value:', sheetTransaksi);
    
    try {
        const { auth, sheetId } = await GoogleAuth(sheetTransaksi);
        console.log('Sheet ID:', sheetId);
        console.log('Auth created successfully');

        const sheets = google.sheets({ version: 'v4', auth });
        console.log('Sheets client created');
        
        return { sheets, sheetId };
    } catch (error) {
        console.error('Error in getSheetClient:', error);
        throw error;
    }
};

export async function getTransactionsAction(): Promise<Transaction[]> {
    try {
        console.log('Starting getTransactionsAction...');
        const { sheets, sheetId } = await getSheetClient();
        console.log('Got sheet client, sheetId:', sheetId);

        // First, check what sheets are available
        const spreadsheetResponse = await sheets.spreadsheets.get({
            spreadsheetId: sheetId
        });
        
        console.log('Available sheets:', spreadsheetResponse.data.sheets?.map(s => s.properties?.title));

        // Try to get Data Transaksi sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Data Transaksi!A:M',
        });

        console.log('Google Sheets response:', response.data);
        const rows = response.data.values || [];
        console.log('Google Sheets rows:', rows.length, 'rows found');

        if (rows.length === 0) {
            console.log('No rows found in Google Sheets');
            return [];
        }

        console.log('Raw rows data:', rows);
        
        // For now, return empty if no data
        if (rows.length <= 1) {
            console.log('No transaction data found, only header or empty');
            return [];
        }

        const transactions: Transaction[] = [];
        
        rows.slice(1).forEach((row, index) => {
            if (!row[0]) return;

        console.log(`Processing row ${index + 2}:`, row);
        console.log('Row length:', row.length);

        try {
            // Parse items from JSON column (column K)
            let items = [];
            try {
                items = row[10] ? JSON.parse(row[10]) : [];
                console.log('Parsed items:', items);
            } catch (e) {
                console.log('Failed to parse items JSON from column 10, using empty array');
                items = [];
            }

            // Ensure items have correct structure with default values
            items = items.map((item: any) => ({
                id: item.id || '',
                type: item.type || 'part',
                name: item.name || 'Unknown Item',
                price: Number(item.price) || 0,
                qty: Number(item.qty) || 1,
                discount: Number(item.discount) || 0
            }));

            // Parse mekaniks from JSON column (column J)
            let mekaniks = [];
            try {
                mekaniks = row[9] ? JSON.parse(row[9]) : [];
            } catch (e) {
                console.log('Failed to parse mekaniks JSON from column 9, using empty array');
                mekaniks = [];
            }

            // Get savedAt from column M
            let savedAt = new Date().toISOString();
            if (row[12]) {
                savedAt = row[12];
            }

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
                
                console.log('Parsed transaction:', transaction);
                transactions.push(transaction);
            } catch (error) {
                console.error(`Error parsing row ${index + 2}:`, error, 'Row data:', row);
            }
        });

        console.log('Final transactions:', transactions);
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions from Google Sheets:', error);
        throw new Error(`Gagal mengambil data transaksi dari Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function saveTransactionAction(transaction: Transaction): Promise<Transaction> {
    try {
        console.log('Saving transaction:', transaction);
        const { sheets, sheetId } = await getSheetClient();

        // Correct row format matching the expected structure
        const row = [
            transaction.invoiceNumber,        // A - Invoice Number
            transaction.date,                 // B - Date
            transaction.customer.name,        // C - Customer Name
            transaction.customer.phone,       // D - Phone
            transaction.customer.kmMasuk,     // E - KM Masuk
            transaction.customer.mobil,        // F - Mobil
            transaction.customer.platNomor,   // G - Plat Nomor
            transaction.customer.tipe || 'umum', // H - Tipe
            transaction.customer.mekanik || '', // I - Mekanik
            JSON.stringify(transaction.customer.mekaniks || []), // J - Mekaniks (JSON)
            JSON.stringify(transaction.items), // K - Items (JSON)
            transaction.total,                 // L - Total
            transaction.savedAt               // M - Saved At
        ];

        console.log('Row to save:', row);

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Data Transaksi!A:M',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row]
            }
        });

        console.log('Save response:', response.data);

        if (response.data.updates && response.data.updates.updatedRows) {
            console.log('Transaction saved successfully');
            return transaction;
        }

        throw new Error('Failed to save transaction to Google Sheets');
    } catch (error) {
        console.error('Server Action Save Transaction Error:', error);
        throw new Error(`Gagal menyimpan transaksi ke Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteTransactionAction(invoiceNumber: string) {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Data Transaksi!A:M',
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row: string[]) => row[0] === invoiceNumber);

        if (rowIndex === -1) {
            throw new Error(`Transaksi dengan invoice ${invoiceNumber} tidak ditemukan.`);
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 0,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1
                        }
                    }
                }]
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Server Action Delete Transaction Error:', error);
        throw new Error(`Gagal menghapus transaksi dari Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
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
            range: 'Data Transaksi!A:O',
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
            // Parse items from hidden JSON column (column O)
            let items = [];
            try {
                items = row[13] ? JSON.parse(row[13]) : [];
                console.log('Parsed items:', items);
            } catch (e) {
                console.log('Failed to parse items JSON from column 13, trying other columns');
                // Try other columns for items
                for (let i = 0; i < row.length; i++) {
                    try {
                        const parsed = JSON.parse(row[i]);
                        if (Array.isArray(parsed)) {
                            items = parsed;
                            console.log(`Found items in column ${i}:`, items);
                            break;
                        }
                    } catch (e) {
                        // Continue trying
                    }
                }
            }

            // Parse mekaniks from hidden JSON column (column N)
            let mekaniks = [];
            try {
                mekaniks = row[12] ? JSON.parse(row[12]) : [];
            } catch (e) {
                console.log('Failed to parse mekaniks JSON, using empty array');
                mekaniks = [];
            }

            // Find savedAt - try multiple columns
            let savedAt = new Date().toISOString();
            for (let i = 0; i < row.length; i++) {
                const value = row[i];
                if (value && (value.includes('T') || value.includes('-'))) {
                    try {
                        const testDate = new Date(value);
                        if (!isNaN(testDate.getTime())) {
                            savedAt = value;
                            console.log(`Found savedAt in column ${i}:`, value);
                            break;
                        }
                    } catch (e) {
                        // Continue trying
                    }
                }
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

        // Simple row format for testing
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
            '', // mekaniks string
            '', // items string  
            transaction.total,
            transaction.savedAt,
            JSON.stringify(transaction.customer.mekaniks || []),
            JSON.stringify(transaction.items)
        ];

        console.log('Row to save:', row);

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Data Transaksi!A:O',
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
            range: 'Data Transaksi!A:O',
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
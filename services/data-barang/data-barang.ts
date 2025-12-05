'use server'

import { google, Auth } from 'googleapis';
import { GoogleAuth } from '../google/googleAuthService';
import { Part } from '@/hooks/useProducts';
import { CartItem } from '@/hooks';


const getSheetClient = async () => {
    const sheetBarang = process.env.SHEET_BARANG as string;
    if (!sheetBarang) {
        throw new Error('SHEET_BARANG environment variable is not set');
    }
    const { auth, sheetId } = await GoogleAuth(sheetBarang);
    const sheets = google.sheets({ version: 'v4', auth: auth as any });
    return { sheets, sheetId };
};

const findRowIndexByCode = async (sheets: any, sheetId: string, code: string): Promise<number | null> => {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Data Barang!A:F',
    });

    const rows = res.data.values || [];
    if (!rows.length) return null;

    const index = rows.findIndex((row: string[], i: number) => i > 0 && row[0] === code);

    return index !== -1 ? index + 1 : null;
};

const findAllRowSheet1BarangIndexByCode = async (
    sheets: any,
    sheetId: string,
    code: string
): Promise<number[]> => {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1!A:I',
    });

    const rows = res.data.values || [];
    if (!rows.length) return [];

    const search = code.trim();

    return rows
        .map((row: string[], i: number) => {
            const kolomD = (row[3] || '').trim();
            return i > 0 && kolomD === search ? i + 1 : null;
        })
        .filter((v : any) => v !== null) as number[];
};



export async function getPartsAction(): Promise<Part[]> {
    try {
        const { sheets, sheetId } = await getSheetClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Data Barang!A:F',
        });

        const rows = response.data.values || [];
        if (!rows.length) return [];

        const seenCodes = new Set<string>();

        const parts = rows.slice(1).map((row, index) => {
            const code = String(row[0] || '').trim();
            const name = String(row[1] || '').trim();

            if (!code || !name || seenCodes.has(code)) {
                return null;
            }

            seenCodes.add(code);

            const currentStock = Number(row[4]) || 0;

            const part = {
                id: code,
                code,
                name,
                quantity: currentStock,
                price: Number(row[5]?.replace(/[^0-9.-]+/g, "")) || 0
            };

            return part;
        }).filter(Boolean) as Part[];

        return parts;
    } catch (error) {
        console.error('Error fetching parts from Google Sheets:', error);
        throw new Error(`Gagal mengambil data dari Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


export async function updateStockAction(items: CartItem[]): Promise<{ success: boolean }> {
    try {
        const { sheets, sheetId } = await getSheetClient();

        for (const item of items) {
            // Only update stock for parts, not services
            if (item.type !== 'part') {
                continue;
            }

            const { id, qty } = item;

            const rowIndex: any = await findRowIndexByCode(sheets, sheetId, id);
            if (!rowIndex) {
                console.warn(`Barang dengan code ${id} tidak ditemukan di Data Barang. Melewati update stok.`);
                continue;
            }

            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `Data Barang!D${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [[qty]] },
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating stock:', error);
        const errorMessage = error instanceof Error
            ? `Gagal menyimpan kuantitas transaksi: ${error.message}`
            : 'Gagal menyimpan kuantitas transaksi di Google Sheets';
        throw new Error(errorMessage);
    }
}



export async function updatePartAction(code: string, updates: { code?: string; name?: string; price?: number }) {
    const { sheets, sheetId } = await getSheetClient();

    const rowIndex = await findRowIndexByCode(sheets, sheetId, code);
    const sheet1RowIndexes = await findAllRowSheet1BarangIndexByCode(sheets, sheetId, code);

    if (!rowIndex) throw new Error(`Barang dengan code ${code} tidak ditemukan.`);

    const requestsSheet1 = [];
    const requestsBarang = [];

    for (const r of sheet1RowIndexes) {
        if (updates.code !== undefined) {
            requestsSheet1.push({
                range: `Sheet1!D${r}`,
                values: [[updates.code]]
            });
        }
        if (updates.name !== undefined) {
            requestsSheet1.push({
                range: `Sheet1!E${r}`,
                values: [[updates.name]]
            });
        }
    }

    if (requestsSheet1.length) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: { data: requestsSheet1, valueInputOption: 'USER_ENTERED' }
        });
    }

    // === UPDATE DATA BARANG ===
    if (updates.price !== undefined) {
        requestsBarang.push({
            range: `Data Barang!F${rowIndex}`,
            values: [[updates.price]]
        });
    }
    if (updates.code !== undefined) {
        requestsBarang.push({
            range: `Data Barang!A${rowIndex}`,
            values: [[updates.code]]
        });
    }
    if (updates.name !== undefined) {
        requestsBarang.push({
            range: `Sheet1!E${rowIndex}`,
            values: [[updates.name]]
        });
    }

    if (requestsBarang.length) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: { data: requestsBarang, valueInputOption: 'USER_ENTERED' }
        });
    }

    return { success: true };
}


export async function addPartAction(item: { code: string; name: string; price: number }) {
    try {
        const { sheets, sheetId } = await getSheetClient();

        // Check if code already exists
        const existingRowIndex = await findRowIndexByCode(sheets, sheetId, item.code);
        if (existingRowIndex) {
            throw new Error(`Barang dengan kode ${item.code} sudah ada.`);
        }

        // Get current data to find the next empty row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Data Barang!A:F',
        });

        const rows = response.data.values || [];
        const nextRow = rows.length + 1; // Next empty row

        // Add new row with data
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Data Barang!A:F',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    item.code,
                    item.name,
                    '', // Category (empty for now)
                    0,  // Initial quantity
                    0,  // Current stock
                    item.price
                ]]
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error adding part:', error);
        throw new Error(`Gagal menambah data barang: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deletePartAction(id: string) {
    try {
        const { sheets, sheetId } = await getSheetClient();
        const rowIndex = await findRowIndexByCode(sheets, sheetId, id);
        if (!rowIndex) {
            throw new Error(`Barang dengan ID ${id} tidak ditemukan untuk dihapus.`);
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 0,
                            dimension: 'ROWS',
                            startIndex: rowIndex - 1, // -1 karena index sheet mulai dari 0
                            endIndex: rowIndex
                        }
                    }
                }]
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Server Action Delete Error:', error);
        throw new Error(`Gagal menghapus data dari Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
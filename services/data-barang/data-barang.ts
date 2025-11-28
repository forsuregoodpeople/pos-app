'use server'

import { google } from 'googleapis';
import { GoogleAuth } from '../google/googleAuthService';
import { Part } from '@/hooks/useProducts';


const getSheetClient = async () => {

    const sheetBarang = process.env.SHEET_BARANG as string;
    const { auth, sheetId } = await GoogleAuth(sheetBarang);

    const sheets = google.sheets({ version: 'v4', auth });
    return { sheets, sheetId };
};

const findRowIndexById = async (sheets: any, sheetId: string, id: string): Promise<number | null> => {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Data Barang!A:C',
    });

    const rows = res.data.values || [];
    if (rows.length === 0) {
        return null;
    }

    const index = rows.findIndex((row: string[], i: number) => {
        if (i < 1) {
            return false;
        }


        const calculatedId = `${row[0]}_${i}`;

        return calculatedId === id;
    });

    return index !== -1 ? index + 1 : null;
};


export async function getPartsAction(): Promise<Part[]> {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Data Barang!A:C',
        });

        const rows = response.data.values || [];

        if (rows.length === 0) {
            return [];
        }

        const seenCodes = new Set<string>();

        const uniqueParts = rows.slice(1).map((row, index) => {
            if (!row[0] || !row[1]) {
                return null;
            }

            const code = row[0];

            if (seenCodes.has(code)) {
                return null;
            }

            seenCodes.add(code);

            return {
                id: `${code}_${index + 2}`,
                code: code,
                name: row[1],
                price: Number(row[2]?.replace(/[^0-9.-]+/g, "")) || 0
            };
        }).filter(Boolean) as Part[];

        return uniqueParts;
    } catch (error) {
        console.error('Error fetching parts from Google Sheets:', error);
        throw new Error(`Gagal mengambil data dari Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updatePartAction(part: Part) {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const rowIndex = await findRowIndexById(sheets, sheetId, part.id);
        if (!rowIndex) throw new Error(`Barang dengan ID ${part.id} tidak ditemukan di Sheet.`);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Data Barang!A${rowIndex}:C${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[part.code, part.name, part.price]]
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Server Action Update Error:', error);
        throw new Error(`Gagal update data di Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deletePartAction(id: string) {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const rowIndex = await findRowIndexById(sheets, sheetId, id);
        if (!rowIndex) throw new Error(`Barang dengan ID ${id} tidak ditemukan untuk dihapus.`);

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 0,
                            dimension: 'ROWS',
                            startIndex: rowIndex - 1,
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
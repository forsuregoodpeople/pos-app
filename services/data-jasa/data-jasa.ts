'use server'

import { google } from 'googleapis';
import { GoogleAuth } from '../google/googleAuthService';
import { DataJasa } from '@/hooks/useDataJasa';


const getSheetClient = async () => {
    const sheetJasa = process.env.SHEET_JASA as string;
    const { auth, sheetId } = await GoogleAuth(sheetJasa);

    const sheets = google.sheets({ version: 'v4', auth });
    return { sheets, sheetId };
};

const findRowIndexById = async (sheets: any, sheetId: string, id: string): Promise<number | null> => {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Data Jasa!A:B',
    });

    const rows = res.data.values || [];
    const index = rows.findIndex((row: string[]) => row[0] === id.split('_')[0]);

    return index !== -1 ? index + 1 : null;
};


export async function getJasaAction(): Promise<DataJasa[]> {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Data Jasa!A:B',
        });

        const rows = response.data.values ? response.data.values.slice(1) : [];

        if (rows.length === 0) {
            return [];
        }

        const validJasa = rows.map((row, index) => {
            if (!row[0] || !row[1]) {
                return null;
            }

            const sheetRowIndex = index + 2;

            return {
                id: `${row[0]}_${sheetRowIndex}`,
                name: row[0],
                price: Number(row[1]?.replace(/[^0-9.-]+/g, "")) || 0
            };
        }).filter(Boolean) as DataJasa[];

        return validJasa;
    } catch (error) {
        console.error('Error fetching jasa from Google Sheets:', error);
        throw new Error(`Gagal mengambil data dari Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateJasaAction(jasa: DataJasa) {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const rowIndex = await findRowIndexById(sheets, sheetId, jasa.id);
        if (!rowIndex) throw new Error(`Jasa dengan ID ${jasa.id} tidak ditemukan di Sheet.`);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Data Jasa!A${rowIndex}:B${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[jasa.name, jasa.price]]
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Server Action Update Error:', error);
        throw new Error(`Gagal update data di Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteJasaAction(id: string) {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const rowIndex = await findRowIndexById(sheets, sheetId, id);
        if (!rowIndex) throw new Error(`Jasa dengan ID ${id} tidak ditemukan untuk dihapus.`);

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

export async function addJasaAction(jasa: DataJasa): Promise<DataJasa> {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Data Jasa!A:B',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[jasa.name, jasa.price]]
            }
        });

        if (response.data.updates && response.data.updates.updatedRows) {
            const newRowIndex = response.data.updates.updatedRows;
            const newId = `${jasa.name}_${newRowIndex - 1}`;

            return {
                ...jasa,
                id: newId
            };
        }

        throw new Error('Failed to add jasa to Google Sheets');
    } catch (error) {
        console.error('Server Action Add Error:', error);
        throw new Error(`Gagal menambah data ke Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
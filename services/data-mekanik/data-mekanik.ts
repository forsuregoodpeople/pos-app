'use server'

import { google } from 'googleapis';
import { GoogleAuth } from '../google/googleAuthService';
import { DataMekanik } from '@/hooks/useDataMekanik';


const getSheetClient = async () => {
    const sheetBarang = process.env.SHEET_MEKANIK as string;
    const { auth, sheetId } = await GoogleAuth(sheetBarang);

    const sheets = google.sheets({ version: 'v4', auth : auth as any });
    return { sheets, sheetId };
};

const findRowIndexById = async (sheets: any, sheetId: string, id: string): Promise<number | null> => {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Data Mekanik!A:A',
    });

    const rows = res.data.values || [];
    const index = rows.findIndex((row: string[]) => row[0] === id.split('_')[0]);

    return index !== -1 ? index + 1 : null;
};


export async function getMechaAction(): Promise<DataMekanik[]> {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Data Mekanik!A:A',
        });

        const rows = response.data.values ? response.data.values.slice(1) : [];

        if (rows.length === 0) {
            return [];
        }

        const validMekaniks = rows.map((row, index) => {
            if (!row[0]) {
                return null;
            }

            const sheetRowIndex = index + 2;

            return {
                id: `${row[0]}_${sheetRowIndex}`,
                name: row[0]
            };
        }).filter(Boolean) as DataMekanik[];

        return validMekaniks;
    } catch (error) {
        console.error('Error fetching mekaniks from Google Sheets:', error);
        throw new Error(`Gagal mengambil data dari Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateMechaAction(mekanik: DataMekanik) {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const sheetRowIndex = parseInt(mekanik.id.split('_')[1]);
        if (isNaN(sheetRowIndex)) throw new Error(`ID Mekanik tidak valid: ${mekanik.id}`);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Data Mekanik!A${sheetRowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[mekanik.name]]
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Server Action Update Error:', error);
        throw new Error(`Gagal update data di Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteMechaAction(id: string) {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const sheetRowIndex = parseInt(id.split('_')[1]);
        if (isNaN(sheetRowIndex)) throw new Error(`ID Mekanik tidak valid: ${id}`);

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 0,
                            dimension: 'ROWS',
                            startIndex: sheetRowIndex - 1,
                            endIndex: sheetRowIndex
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

export async function addMechaAction(mekanik: DataMekanik): Promise<DataMekanik> {
    try {
        const { sheets, sheetId } = await getSheetClient();

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Data Mekanik!A:A',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[mekanik.name]]
            }
        });

        if (response.data.updates && response.data.updates.updatedRange) {
            const updatedRange = response.data.updates.updatedRange;
            const match = updatedRange.match(/!A(\d+)/);

            if (match && match[1]) {
                const newRowIndex = parseInt(match[1]);
                const newId = `${mekanik.name}_${newRowIndex}`;

                return {
                    ...mekanik,
                    id: newId
                };
            }
        }

        throw new Error('Failed to add mekanik to Google Sheets: No updated range found');
    } catch (error) {
        console.error('Server Action Add Error:', error);
        throw new Error(`Gagal menambah data ke Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
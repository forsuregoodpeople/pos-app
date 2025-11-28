'use server'

import { google } from 'googleapis';

export const GoogleAuth = async (sheet: string) => {
    const sheetId = sheet;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (!email || !privateKey || !sheetId) {
        throw new Error("Missing Google API credentials or Sheet ID in environment variables. Please check your .env file.");
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: email,
                private_key: privateKey.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        return { auth: auth, sheetId: sheetId };
    }
    catch (error) {
        throw new Error("Failed to create Google Auth client: " + error);
    }


}
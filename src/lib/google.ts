import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
];

export const getGoogleAuth = () => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Missing Google Service Account credentials');
    }

    // Handle private key replacement for Vercel/Env oddities
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: privateKey,
        },
        scopes: SCOPES,
    });

    return auth;
};

export const getSheetsClient = () => {
    const auth = getGoogleAuth();
    return google.sheets({ version: 'v4', auth });
};

export const getDriveClient = () => {
    const auth = getGoogleAuth();
    return google.drive({ version: 'v3', auth });
};

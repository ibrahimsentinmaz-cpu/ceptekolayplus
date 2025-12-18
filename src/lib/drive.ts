import { getDriveClient } from './google';
import { Readable } from 'stream';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

export async function uploadFileToDrive(file: File, customerId: string, label: string) {
    const drive = getDriveClient();

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const timestamp = new Date().getTime();
    const filename = `${customerId}_${label}_${timestamp}_${file.name}`;

    const media = {
        mimeType: file.type,
        body: stream,
    };

    const response = await drive.files.create({
        requestBody: {
            name: filename,
            parents: FOLDER_ID ? [FOLDER_ID] : [],
            // Ensure file is readable by anyone with link or just domain?
            // "sets proper permissions so the app can access it" -> Service Account has access.
            // "Write the shareable file URL" -> We need to make it accessible to the USER (browser).
            // Usually this means making it 'reader' for 'anyone' or 'domain'.
            // For simplicity/privacy, maybe we assume the user is logged in to the same Google Workspace?
            // Or we make it 'anyone with link' (confidentiality risk?).
            // Let's stick to default private, and assume we generate a signed URL or just share it.
            // Prompt says: "Users should not see Drive/Sheet details."
        },
        media: media,
        fields: 'id, webViewLink, webContentLink',
    });

    // Set permission to anyone with link (RISKY but easiest for "shareable URL")
    // Or better: The app should proxy the image? 
    // "Write the shareable file URL to gorsel_1_url in the sheet."
    // If the user clicks it, they need to see it.
    // I will add a permission for 'anyone' with type 'anyone' and role 'reader'.

    if (response.data.id) {
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
    }

    return response.data;
}

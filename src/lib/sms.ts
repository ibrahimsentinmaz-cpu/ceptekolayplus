
import { SMS_TEMPLATES } from './sms-templates';

interface SMSConfig {
    usercode?: string;
    password?: string;
    header?: string; // e.g., "CEPTEKOLAY"
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
    const config: SMSConfig = {
        usercode: process.env.NETGSM_USERCODE,
        password: process.env.NETGSM_PASSWORD,
        header: process.env.NETGSM_HEADER || 'CEPTEKOLAY'
    };

    // Simulation Mode if no credentials
    if (!config.usercode || !config.password) {
        console.log('--- [SMS SIMULATION] ---');
        console.log(`To: ${phone}`);
        console.log(`Header: ${config.header}`);
        console.log(`Message: ${message}`);
        console.log('------------------------');
        return true; // Simulate success
    }

    // NetGSM API Implementation
    // Endpoint: https://api.netgsm.com.tr/sms/send/get
    try {
        console.log(`[NetGSM] Sending SMS to ${phone}...`);

        // Clean phone number (remove leading 0 if present, though NetGSM usually handles it, best to be standard)
        // NetGSM expects 10 digits usually (5xxxxxxxxx) but also accepts 05xxxxxxxxx. 
        // Let's keep it as is or ensure it matches their requirement.
        // Assuming input is 0555... or 555...

        const url = new URL('https://api.netgsm.com.tr/sms/send/get');
        url.searchParams.append('usercode', config.usercode);
        url.searchParams.append('password', config.password);
        url.searchParams.append('gsmno', phone);
        url.searchParams.append('message', message);
        url.searchParams.append('msgheader', config.header || 'CEPTEKOLAY');
        url.searchParams.append('filter', '0'); // 0: No filter (commercial), 11: IYS filter logic if needed? Usually 0 for transactional if allowed.
        // startdate, stopdate can be empty for immediate

        const response = await fetch(url.toString(), { method: 'GET' });
        const result = await response.text();

        // NetGSM returns:
        // "00 123456789" -> Success (Code + JobID)
        // "20" -> Message text too long
        // "30" -> Credentials error
        // "40" -> Sender name error
        // "70" -> Parameter error

        console.log(`[NetGSM] Response: ${result}`);

        if (result.startsWith('00')) {
            console.log('[NetGSM] SMS Sent Successfully');
            return true;
        } else {
            console.error(`[NetGSM] Failed to send. Error Code: ${result}`);
            return false;
        }
    } catch (error) {
        console.error('[NetGSM] HTTP Request Error:', error);
        return false;
    }
}

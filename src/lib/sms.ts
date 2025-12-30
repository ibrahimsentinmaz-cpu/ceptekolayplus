
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

    // TODO: Implement actual NetGSM API call here when credentials are provided
    // Endpoint: https://api.netgsm.com.tr/sms/send/get
    try {
        console.log(`Attempting to send real SMS to ${phone}...`);
        // Actual implementation will go here
        return true;
    } catch (error) {
        console.error('SMS Send Error:', error);
        return false;
    }
}

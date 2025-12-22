import nodemailer from 'nodemailer';
import { Customer, LeadStatus } from './types';

// SMTP Configuration
// In production, these should be environment variables.
// For now, allow placeholders or logic to skip if not configured.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Brand colors and styling
const COLORS = {
    primary: '#4F46E5', // Indigo-600
    bg: '#F3F4F6', // Gray-100
    text: '#1F2937', // Gray-800
    white: '#FFFFFF',
    accent: '#10B981', // Emerald for success
};

// Base HTML Template
const wrapHtml = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: ${COLORS.bg}; }
  .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; }
  .header { background-color: ${COLORS.primary}; padding: 30px 20px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; }
  .content { padding: 40px 30px; text-align: center; }
  .status-icon { font-size: 48px; margin-bottom: 20px; display: block; }
  .message-title { color: ${COLORS.text}; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
  .message-body { color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
  .footer { background-color: #F9FAFB; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; }
  .btn { display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
        <h1>Cepte Kolay Plus</h1>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} Cepte Kolay Plus. Tüm hakları saklıdır.</p>
        <p>Bu e-posta otomatik olarak oluşturulmuştur.</p>
    </div>
  </div>
</body>
</html>
`;

export async function sendStatusEmail(customer: Customer, newStatus: LeadStatus | string) {
    if (!customer.email || !process.env.SMTP_USER) {
        console.log('Skipping email: No email address or SMTP not configured.');
        return;
    }

    let subject = '';
    let bodyContent = '';

    const name = customer.ad_soyad || 'Müşterimiz';

    switch (newStatus) {
        case 'Başvuru alındı':
            subject = 'Başvurunuz Değerlendirme Aşamasında 📋';
            bodyContent = `
                <span class="status-icon">📋</span>
                <div class="message-title">Sayın ${name},</div>
                <div class="message-body">
                    Firmamıza yapmış olduğunuz başvurunuz başarıyla alınmış olup değerlendirme sürecine girmiştir.
                    <br><br>
                    Uzman ekiplerimiz başvurunuzu en kısa sürede inceleyerek size dönüş yapacaktır.
                </div>
            `;
            break;

        case 'Kefil bekleniyor':
        case 'Kefil İstendi':
            subject = 'Kefil Bilgileri Bekleniyor ⚠️';
            bodyContent = `
                <span class="status-icon">⚠️</span>
                <div class="message-title">Sayın ${name},</div>
                <div class="message-body">
                    Başvurunuzun onaylanabilmesi için kefil bilgilerinize ihtiyaç duyulmaktadır.
                    <br><br>
                    Lütfen en kısa sürede temsilcinizle iletişime geçerek gerekli bilgileri tamamlayınız.
                </div>
            `;
            break;

        case 'Onaylandı':
            subject = 'Müjde! Başvurunuz Onaylandı 🎉';
            bodyContent = `
                <span class="status-icon">🎉</span>
                <div class="message-title">Tebrikler ${name}!</div>
                <div class="message-body">
                    Başvurunuz olumlu sonuçlanmış ve <strong>ONAYLANMIŞTIR</strong>.
                    <br><br>
                    Ürününüzü teslim almak üzere mağazamıza davetlisiniz.
                    Detaylı bilgi için temsilciniz sizinle iletişime geçecektir.
                </div>
            `;
            break;

        case 'Teslim edildi':
            subject = 'Ürününüz Hayırlı Olsun 🎁';
            bodyContent = `
                <span class="status-icon">🎁</span>
                <div class="message-title">İyi günlerde kullanın!</div>
                <div class="message-body">
                    Ürün teslimatınız gerçekleşmiştir. Bizi tercih ettiğiniz için teşekkür ederiz.
                    <br><br>
                    Keyifli ve mutlu günlerde kullanmanız dileğiyle...
                </div>
            `;
            break;

        case 'Ulaşılamadı':
        case 'Meşgul/Hattı kapalı':
            subject = 'Size Ulaşamadık 📞';
            bodyContent = `
                <span class="status-icon">📞</span>
                <div class="message-title">Sayın ${name},</div>
                <div class="message-body">
                    Başvurunuzla ilgili bilgi vermek üzere sizi aradık ancak ulaşamadık.
                    <br><br>
                    Müsait olduğunuzda bize geri dönüş yapmanızı rica ederiz.
                </div>
            `;
            break;

        default:
            return; // Don't send email for other statuses
    }

    const html = wrapHtml(subject, bodyContent);

    try {
        await transporter.sendMail({
            from: `"Cepte Kolay Plus" <${process.env.SMTP_USER}>`,
            to: customer.email,
            subject: subject,
            html: html,
        });
        console.log(`Email sent to ${customer.email} for status ${newStatus}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

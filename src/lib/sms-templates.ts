
export const SMS_TEMPLATES = {
    UNREACHABLE: (name: string) =>
        `Sayın ${name}, başvurunuzla ilgili size ulaşmaya çalıştık ancak ulaşamadık. Müsait olduğunuzda 0551 346 6735 numaramızdan veya WhatsApp hattımızdan bize dönüş yapmanızı rica ederiz. Sevgiler.`,

    GUARANTOR_REQUIRED: (name: string) =>
        `Değerli Müşterimiz ${name}, başvurunuzun olumlu sonuçlanabilmesi için kefil desteğine ihtiyaç duyulmuştur. Detaylı bilgi için 0551 346 6735 numaralı hattımızdan bize ulaşabilir veya mağazamızı ziyaret edebilirsiniz.`,

    APPROVED: (name: string, limit: string) =>
        `Müjde! ${name}, başvurunuz ${limit || 'belirlenen'} TL limit ile ONAYLANMIŞTIR! 🎉 Ürününüzü teslim almak için sizi en kısa sürede mağazamıza bekliyoruz. Şimdiden iyi günlerde kullanın.`,

    MISSING_DOCS: (name: string) =>
        `Sayın ${name}, başvurunuzu tamamlayabilmemiz için bazı eksik evraklarınız bulunmaktadır. 0551 346 6735 WhatsApp hattımızdan bilgi alarak işlemlerinizi hızlandırabilirsiniz.`,

    CANCELLED: (name: string) =>
        `Sayın ${name}, başvurunuzla ilgili işlemler durdurulmuş ve kaydınız iptal edilmiştir. İhtiyaçlarınız için kapımız size her zaman açık. Tekrar görüşmek dileğiyle.`
};

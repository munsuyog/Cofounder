interface WhatsAppNotificationProps {
    to: string;
    message: string;
    founderPhone: string;
  }
  
  export async function sendWhatsAppNotification({
    to,
    message,
    founderPhone
  }: WhatsAppNotificationProps) {
    try {
      // Using Twilio WhatsApp API
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require('twilio')(accountSid, authToken);
  
      await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`
      });
  
      // Send founder's contact
      await client.messages.create({
        body: `You can connect with the founder on WhatsApp: ${founderPhone}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`
      });
  
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      throw error;
    }
  }
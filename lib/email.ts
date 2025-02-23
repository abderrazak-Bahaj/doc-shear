export const sendEmail = async (to: string, subject: string, text: string, html?: string): Promise<void> => {
    // Brevo API SMTP
    const res = await fetch(
        "https://api.brevo.com/v3/smtp",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.EMAIL_FROM_NAME,
                    email: process.env.EMAIL_FROM,
                },
                to: [{ email: to }],
                subject,
                textContent: text,
                htmlContent: html,
            }),
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to send email: ${res.statusText}`);
    }
};
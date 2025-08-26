import {render} from '@react-email/render';
import {LCSMagicLinkEmail} from '@/emails/lcs-magic-link';

interface SendMagicLinkEmailProps {
    to: string;
    url: string;
    host?: string;
}

export async function renderMagicLinkEmail({to, url, host = 'Laptop Care Services'}: SendMagicLinkEmailProps) {
    const emailHtml = await render(LCSMagicLinkEmail({
        url,
        host,
        email: to,
    }));

    const emailText = `Welcome to ${host}!\n\nClick this link to sign in: ${url}\n\nThis link will expire in 24 hours for your security.\n\nIf you didn't request this, you can safely ignore this email.\n\n---\nLaptop Care Services\nProfessional laptop repair and maintenance services`;

    return {
        html: emailHtml,
        text: emailText,
    };
}
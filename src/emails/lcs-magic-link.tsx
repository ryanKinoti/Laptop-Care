import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface LCSMagicLinkEmailProps {
    url?: string;
    host?: string;
    email?: string;
}

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const LCSMagicLinkEmail = ({
                                      url = 'https://your-app.com/auth/signin',
                                      host = 'Laptop Care Services',
                                      email = 'user@example.com',
                                  }: LCSMagicLinkEmailProps) => (
    <Html>
        <Head/>
        <Preview>Sign in to {host}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={logoContainer}>
                    <Img
                        src={`${baseUrl}/main_logo.png`}
                        width="200"
                        height="60"
                        alt="Laptop Care Services Logo"
                        style={logo}
                    />
                </Section>

                <Section style={heroSection}>
                    <Heading style={h1}>Welcome Back!</Heading>
                    <Text style={heroText}>
                        Click the button below to securely sign in to your Laptop Care Services account.
                    </Text>
                </Section>

                <Section style={buttonContainer}>
                    <Link href={url} style={button}>
                        Sign In to Your Account
                    </Link>
                </Section>

                <Section style={infoSection}>
                    <Text style={infoText}>
                        This magic link was requested for <strong>{email}</strong>
                    </Text>
                    <Text style={infoText}>
                        The link will expire in 24 hours for your security.
                    </Text>
                </Section>

                <Section style={alternativeSection}>
                    <Text style={alternativeText}>
                        You can also copy and paste this link into your browser:
                    </Text>
                    <Text style={urlText}>{url}</Text>
                </Section>

                <Section style={securitySection}>
                    <Text style={securityText}>
                        🔒 <strong>Security Notice:</strong> If you didn&#39;t request this sign-in link,
                        you can safely ignore this email. Your account remains secure.
                    </Text>
                </Section>

                <Section style={footerSection}>
                    <Text style={footerText}>
                        Need help? Contact our support team or visit our help center.
                    </Text>
                    <Text style={footerBranding}>
                        <strong>Laptop Care Services</strong><br/>
                        Professional laptop repair and maintenance services
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

LCSMagicLinkEmail.PreviewProps = {
    url: 'https://laptop-care-services.com/auth/callback?token=example-token',
    host: 'Laptop Care Services',
    email: 'customer@example.com',
} as LCSMagicLinkEmailProps;

export default LCSMagicLinkEmail;

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
};

const logoContainer = {
    textAlign: 'center' as const,
    padding: '20px 0',
};

const logo = {
    margin: '0 auto',
};

const heroSection = {
    textAlign: 'center' as const,
    padding: '40px 20px 20px',
};

const h1 = {
    color: '#1f2937',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 20px',
    textAlign: 'center' as const,
};

const heroText = {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 30px',
    textAlign: 'center' as const,
};

const buttonContainer = {
    textAlign: 'center' as const,
    padding: '20px',
};

const button = {
    backgroundColor: '#3b82f6',
    borderRadius: '8px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    lineHeight: '50px',
    textAlign: 'center' as const,
    textDecoration: 'none',
    width: '300px',
    padding: '0 20px',
};

const infoSection = {
    padding: '20px 40px',
    textAlign: 'center' as const,
};

const infoText = {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '8px 0',
    textAlign: 'center' as const,
};

const alternativeSection = {
    padding: '20px 40px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    margin: '20px',
};

const alternativeText = {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 10px',
};

const urlText = {
    color: '#3b82f6',
    fontSize: '12px',
    lineHeight: '18px',
    wordBreak: 'break-all' as const,
    padding: '10px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
};

const securitySection = {
    padding: '20px 40px',
    textAlign: 'center' as const,
};

const securityText = {
    color: '#059669',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
    padding: '15px',
    backgroundColor: '#ecfdf5',
    borderRadius: '8px',
    border: '1px solid #a7f3d0',
};

const footerSection = {
    padding: '40px 20px 20px',
    textAlign: 'center' as const,
    borderTop: '1px solid #e5e7eb',
    marginTop: '40px',
};

const footerText = {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0 0 10px',
};

const footerBranding = {
    color: '#6b7280',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0',
};
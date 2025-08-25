import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/lib/prisma/prisma"
import {CustomerRole} from "@prisma/client";

export const {auth, handlers, signIn, signOut} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google,
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user, account}) {
            if (account?.provider === "google" && user.email) {
                // Check if the user with this email already exists
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });
                
                if (existingUser) {
                    // Link the Google account to an existing user
                    await prisma.account.create({
                        data: {
                            userId: existingUser.id,
                            type: account.type,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            access_token: account.access_token,
                            expires_at: account.expires_at,
                            token_type: account.token_type,
                            scope: account.scope,
                            id_token: account.id_token,
                        }
                    });
                }
            }
            return true;
        },
    },
    events: {
        createUser: async ({user}) => {
            const fullUser = await prisma.user.findUnique({
                where: {id: user.id}
            })
            if (fullUser && !fullUser.isStaff) {
                try {
                    await prisma.customerProfile.create({
                        data: {
                            user: {
                                connect: {
                                    id: user.id
                                }
                            },
                            role: CustomerRole.INDIVIDUAL
                        }
                    });
                    console.log(`Customer profile created for user: ${user.id}`);
                } catch (error) {
                    console.error(`Failed to create customer profile for user ${user.id}:`, error);
                }
            }

        }
    }
    // debug: process.env.NODE_ENV === "development",
})
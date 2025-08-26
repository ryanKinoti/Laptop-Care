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
    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin', // Redirect errors to a custom sign-in page
        verifyRequest: '/auth/verify-request', // Custom verify request page
    },
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({user, account, profile}) {
            if (account?.provider === "google" && user.email) {
                try {
                    // Check if the user with this email already exists
                    const existingUser = await prisma.user.findUnique({
                        where: {email: user.email},
                        include: {
                            accounts: true,
                            staffProfile: true,
                            customerProfile: true,
                        }
                    });

                    if (existingUser) {
                        // Check if Google account is already linked
                        const existingGoogleAccount = existingUser.accounts.find(
                            acc => acc.provider === "google" && acc.providerAccountId === account.providerAccountId
                        );

                        if (!existingGoogleAccount) {
                            // Link the Google account to the existing user
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

                        // Update user fields with Google profile data if they're missing
                        const updateData: {
                            name?: string;
                            image?: string;
                            emailVerified?: Date;
                        } = {};

                        if (!existingUser.name && profile?.name) {
                            updateData.name = profile.name;
                        }

                        if (!existingUser.image && profile?.picture) {
                            updateData.image = profile.picture;
                        }

                        if (!existingUser.emailVerified) {
                            updateData.emailVerified = new Date();
                        }

                        // Update user if there are fields to update
                        if (Object.keys(updateData).length > 0) {
                            await prisma.user.update({
                                where: {id: existingUser.id},
                                data: updateData
                            });
                        }

                        // Override the user object to use the existing user's ID
                        user.id = existingUser.id;
                        return true;
                    }

                    // If no existing user, let NextAuth create a new one
                    // The createUser event will handle setting them as customer
                    return true;

                } catch (error) {
                    console.error('Error in signIn callback:', error);
                    return false;
                }
            }

            // For email provider or other cases, allow sign in
            return true;
        },
        async session({session, user}) {
            if (session.user && user) {
                // Fetch complete user data with profiles
                const fullUser = await prisma.user.findUnique({
                    where: {id: user.id},
                    include: {
                        customerProfile: true,
                        staffProfile: true,
                    }
                });

                if (fullUser) {
                    // Add extended user information to the session
                    session.user.isStaff = fullUser.isStaff
                    session.user.isSuperuser = fullUser.isSuperuser
                    session.user.isActive = fullUser.isActive

                    if (fullUser.staffProfile) {
                        session.user.staffRole = fullUser.staffProfile.role
                    }

                    if (fullUser.customerProfile) {
                        session.user.customerRole = fullUser.customerProfile.role || undefined
                    }
                }
            }
            return session
        },
    },
    events: {
        createUser: async ({user}) => {
            try {
                // Get the full user data including profiles
                const fullUser = await prisma.user.findUnique({
                    where: {id: user.id},
                    include: {
                        staffProfile: true,
                        customerProfile: true,
                    }
                });

                if (!fullUser) {
                    console.error(`User not found after creation: ${user.id}`);
                    return;
                }

                // Only create a customer profile if:
                // 1. User is not staff (seeded staff users have isStaff = true)
                // 2. User doesn't already have a customer profile
                if (!fullUser.isStaff && !fullUser.customerProfile) {
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
                    console.log(`Customer profile created for new user: ${user.id} (${user.email})`);
                } else if (fullUser.isStaff) {
                    console.log(`Staff user signed in: ${user.id} (${user.email}) - Role: ${fullUser.staffProfile?.role || 'Unknown'}`);
                } else {
                    console.log(`User already has customer profile: ${user.id} (${user.email})`);
                }
            } catch (error) {
                console.error(`Error in createUser event for user ${user.id}:`, error);
            }
        },

        linkAccount: async ({account, user}) => {
            console.log(`Account linked: ${account.provider} for user ${user.id} (${user.email})`);
        },
    }
})
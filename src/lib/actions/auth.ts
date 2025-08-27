'use server'

import { signIn, signOut } from "@/lib/auth"

export async function signInAction() {
    await signIn()
}

export async function signOutAction() {
    await signOut()
}

export async function signInWithProvider(provider: string) {
    await signIn(provider, { redirectTo: "/" })
}

export async function signInWithCredentials(formData: FormData) {
    const email = formData.get("email") as string
    await signIn("email", { email, redirectTo: "/" })
}
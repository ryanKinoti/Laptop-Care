import Image from "next/image";
import {auth, signIn, signOut} from "@/lib/auth";

export default async function Home() {
    const session = await auth();

    return (
        <div className="font-sans min-h-screen">
            {/* Navigation */}
            <nav className="bg-gray-100 dark:bg-gray-800 p-4 border-b">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">Laptop Care Service</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {session?.user ? (
                            <div className="flex items-center gap-4">
                                <div className="text-sm">
                                    <p className="font-medium">{session.user.name || 'User'}</p>
                                    <p className="text-gray-600 dark:text-gray-400">{session.user.email}</p>
                                </div>
                                {session.user.image && (
                                    <Image
                                        src={session.user.image}
                                        alt="Profile"
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                )}
                                <form action={async () => {
                                    "use server";
                                    await signOut();
                                }}>
                                    <button
                                        type="submit"
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                                    >
                                        Sign Out
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <form action={async () => {
                                "use server";
                                await signIn();
                            }}>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                                >
                                    Sign In
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="grid grid-rows-[1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
                <main className="flex flex-col gap-[32px] items-center sm:items-start">
                    <Image
                        className="dark:invert"
                        src="/next.svg"
                        alt="Next.js logo"
                        width={180}
                        height={38}
                        priority
                    />
                    <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
                        <li className="mb-2 tracking-[-.01em]">
                            Get started by editing{" "}
                            <code
                                className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
                                src/app/page.tsx
                            </code>
                            .
                        </li>
                        <li className="tracking-[-.01em]">
                            Save and see your changes instantly.
                        </li>
                    </ol>

                    <div className="flex gap-4 items-center flex-col sm:flex-row">
                        <a
                            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                className="dark:invert"
                                src="/vercel.svg"
                                alt="Vercel logomark"
                                width={20}
                                height={20}
                            />
                            Deploy now
                        </a>
                        <a
                            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
                            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Read our docs
                        </a>
                    </div>
                </main>
                <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                    <a
                        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                        href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            aria-hidden
                            src="/file.svg"
                            alt="File icon"
                            width={16}
                            height={16}
                        />
                        Learn
                    </a>
                    <a
                        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                        href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            aria-hidden
                            src="/window.svg"
                            alt="Window icon"
                            width={16}
                            height={16}
                        />
                        Examples
                    </a>
                    <a
                        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                        href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            aria-hidden
                            src="/globe.svg"
                            alt="Globe icon"
                            width={16}
                            height={16}
                        />
                        Go to nextjs.org →
                    </a>
                </footer>
            </div>
        </div>
    );
}

import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
            {/* Main content container */}
            <main className="flex flex-col items-center text-center">
                {/* The application name */}
                <h1 className="!font-mono text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-center mb-8">
                    WestWay L
                    <span className="text-xl sm:text-2xl lg:text-3xl">ab</span>
                    LM AI
                </h1>
                {/* A call-to-action button that navigates to the chat page */}
                <Link href="/chat">
                    <button className="!font-mono bg-gray-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-900 transition-colors dark:bg-white dark:text-gray-800 dark:hover:bg-gray-200 cursor-pointer">
                        Start Chat
                    </button>
                </Link>
            </main>
        </div>
    );
}

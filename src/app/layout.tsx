import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { DocProvider } from "@/context/DocContext";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "WestWay LabLM AI",
    description:
        "This is an AI Chat UI designed to help lab scientists troubleshoot laboratory procedures and instruments in the context of multiple instruments/projects.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <DocProvider>
                        {children}

                        {/* Load Google API + Picker scripts */}
                        <Script
                            src="https://accounts.google.com/gsi/client"
                            strategy="afterInteractive"
                        />
                        <Script
                            src="https://apis.google.com/js/api.js"
                            strategy="afterInteractive"
                        />
                    </DocProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

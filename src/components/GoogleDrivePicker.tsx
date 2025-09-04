/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { importDriveFiles } from "@/lib/api";
import { Doc } from "@/lib/types";

interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

// Define the Picker types we care about
interface PickerDoc {
    id: string;
    name: string;
    mimeType: string;
    [key: string]: unknown; // fallback for extra fields
}

interface PickerCallbackData {
    action: string;
    docs: PickerDoc[];
}

interface GoogleDrivePickerProps {
    projectId: string;
    onImport: (docs: Doc[]) => void;
}

const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({
    projectId,
    onImport,
}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [pickerLoaded, setPickerLoaded] = useState(false);

    // Load Google API and Picker
    useEffect(() => {
        if (typeof window === "undefined") return;

        const loadGapi = async () => {
            // Load the main API script
            await new Promise<void>((resolve) => {
                if (
                    document.querySelector(
                        `script[src="https://apis.google.com/js/api.js"]`
                    )
                ) {
                    resolve();
                    return;
                }
                const script = document.createElement("script");
                script.src = "https://apis.google.com/js/api.js";
                script.onload = () => resolve();
                document.body.appendChild(script);
            });

            // Load Picker via gapi
            (window as any).gapi.load("picker", () => {
                setPickerLoaded(true);
            });
        };

        loadGapi();
    }, []);

    // Sign in with Google OAuth
    const handleSignIn = async () => {
        return new Promise<string>((resolve, reject) => {
            (window as any).google.accounts.oauth2
                .initTokenClient({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                    scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly",
                    callback: (tokenResponse: TokenResponse) => {
                        if (tokenResponse.access_token) {
                            setAccessToken(tokenResponse.access_token);
                            resolve(tokenResponse.access_token); // Resolve with the token
                        } else {
                            reject(new Error("Failed to get access token."));
                        }
                    },
                })
                .requestAccessToken();
        });
    };

    // Open Google Drive Picker
    const openPicker = async () => {
        if (!pickerLoaded) return;

        let token = accessToken;
        if (!token) {
            try {
                token = await handleSignIn();
            } catch (error) {
                console.error("Sign-in failed:", error);
                return;
            }
        }

        const view = new google.picker.DocsView()
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true);

        const picker = new google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(token!) // Use the token from the promise
            .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
            .setCallback(async (data: PickerCallbackData) => {
                if (data.action === google.picker.Action.PICKED) {
                    const files = data.docs.map((doc: PickerDoc) => ({
                        id: doc.id,
                        name: doc.name,
                        mimeType: doc.mimeType,
                    }));
                    const imported = await importDriveFiles(
                        projectId,
                        files,
                        token! // Use the same token
                    );
                    onImport(imported);
                }
            })
            .build();

        picker.setVisible(true);
    };

    return (
        <button
            onClick={openPicker}
            className="inline-flex items-center flex-nowrap gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 cursor-pointer"
        >
            {/* Simple Google Drive triangle icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 87.3 78"
                className="w-5 h-5"
                fill="currentColor"
            >
                <path
                    className="fill-gray-500"
                    d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                />
                <path
                    className="fill-gray-400"
                    d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                />
                <path
                    className="fill-gray-200"
                    d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                />
                <path
                    className="fill-gray-400"
                    d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                />
                <path
                    className="fill-gray-500"
                    d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                />
                <path
                    className="fill-gray-300"
                    d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                />
            </svg>
            Import from Google Drive
        </button>
    );
};

export default GoogleDrivePicker;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { importDriveFiles } from "@/lib/api";
import { Doc } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

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

// Define an enum for the status states
enum FileStatus {
    QUEUED = "queued",
    UPLOADING = "uploading",
    UPLOADED = "uploaded",
    INDEXING = "indexing",
    INDEXED = "indexed",
    ERROR = "error",
}

// Define the type for each item in the queue
interface FileQueueItem extends PickerDoc {
    status: FileStatus; // The current status
    progress?: number; // Optional progress value (0-100)
}

interface GoogleDrivePickerProps {
    projectId: string;
    instrumentIds: string[];
    onImport: (docs: Doc[]) => void;
}

const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({
    projectId,
    instrumentIds,
    onImport,
}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [pickerLoaded, setPickerLoaded] = useState(false);
    const [selectedInstrumentIds, setSelectedInstrumentIds] =
        useState(instrumentIds);
    const [importQueue, setImportQueue] = useState<FileQueueItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setSelectedInstrumentIds(instrumentIds);
    }, [instrumentIds]);

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
                        status: FileStatus.QUEUED,
                    }));

                    // Show status on upload
                    setImportQueue((prevQueue) => [...prevQueue, ...files]);

                    // processQueue();

                    // const imported = await importDriveFiles(
                    //     projectId,
                    //     selectedInstrumentIds,
                    //     files,
                    //     token! // Use the same token
                    // );
                    // onImport(imported);
                    // setIsProcessing(true);
                }
            })
            .build();

        picker.setVisible(true);
    };

    // --- File Processing Logic ---
    useEffect(() => {
        const processQueueItem = async (item: FileQueueItem) => {
            // Update status to UPLOADING
            setImportQueue((prevQueue) =>
                prevQueue.map((q) =>
                    q.id === item.id
                        ? { ...q, status: FileStatus.UPLOADING, progress: 0 }
                        : q
                )
            );

            try {
                // Call your import function, passing the progress callback
                const importedFiles = await importDriveFiles(
                    projectId,
                    instrumentIds,
                    [item as PickerDoc], // Pass the single item as an array
                    accessToken!
                    // (itemId, progress) => handleProgressUpdate(itemId, progress)
                );

                onImport(importedFiles);

                // Assume importDriveFiles returns results for the files it processed
                // For a single file, we expect one result.
                const processedFile = importedFiles[0];
                if (!processedFile)
                    throw new Error("Import function returned no results.");

                // Update status to UPLOADED
                setImportQueue((prevQueue) =>
                    prevQueue.map((q) =>
                        q.id === item.id
                            ? {
                                  ...q,
                                  status: FileStatus.UPLOADED,
                                  progress: 100,
                              }
                            : q
                    )
                );

                // Now, proceed to indexing
                setImportQueue((prevQueue) =>
                    prevQueue.map((q) =>
                        q.id === item.id
                            ? { ...q, status: FileStatus.INDEXING }
                            : q
                    )
                );

                // await indexFileContent(item); // Assuming indexFileContent is your function

                // Once indexing is complete, set status to INDEXED
                setImportQueue((prevQueue) =>
                    prevQueue.map((q) =>
                        q.id === item.id
                            ? { ...q, status: FileStatus.INDEXED }
                            : q
                    )
                );
            } catch (error) {
                console.error(
                    `Error processing file ${item.name} (ID: ${item.id}):`,
                    error
                );
                setImportQueue((prevQueue) =>
                    prevQueue.map((q) =>
                        q.id === item.id
                            ? { ...q, status: FileStatus.ERROR }
                            : q
                    )
                );
            }
        };

        // This effect runs whenever importQueue changes OR isProcessing becomes true
        // It finds the first QUEUED item and processes it.
        if (isProcessing && importQueue.length > 0) {
            // Find the next item to process that is in QUEUED state
            const nextItemToProcess = importQueue.find(
                (item) => item.status === FileStatus.QUEUED
            );

            if (nextItemToProcess) {
                // Start processing this item
                processQueueItem(nextItemToProcess)
                    .then(() => {
                        // After processing finishes (success or error), check if there are more items.
                        // This ensures sequential processing and prevents multiple loops running concurrently.
                        const remainingQueuedItems = importQueue.filter(
                            (item) => item.status === FileStatus.QUEUED
                        ).length;

                        // If there are more items to be processed, we don't need to do anything here
                        // because the state update in processQueueItem will trigger this effect again
                        // if the queue is not empty and isProcessing is still true.
                        // However, if this was the *last* item, we might want to signal completion.

                        // A simple way to re-evaluate: check if ANY item is still QUEUED, UPLOADING, or INDEXING
                        const stillActive = importQueue.some(
                            (item) =>
                                item.status === FileStatus.QUEUED ||
                                item.status === FileStatus.UPLOADING ||
                                item.status === FileStatus.INDEXING
                        );

                        if (!stillActive) {
                            // If no items are actively being processed or queued, stop processing
                            setIsProcessing(false);
                        }
                    })
                    .catch((err) => {
                        // Catch any unexpected errors from processQueueItem itself
                        console.error(
                            "Unexpected error in queue processing loop:",
                            err
                        );
                        setIsProcessing(false); // Stop processing if an unexpected error occurs
                    });
            } else {
                // If there are no more items in QUEUED state, but we were processing,
                // it means all items are now UPLOADED, INDEXED, or ERROR.
                // So, we can stop the processing loop.
                setIsProcessing(false);
            }
        } else if (isProcessing && importQueue.length === 0) {
            // If processing is true but queue is empty, stop processing.
            setIsProcessing(false);
        }
    }, [importQueue, isProcessing, accessToken]);

    return (
        <div className="w-full flex flex-col">
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

            {/* Display the queue below the button */}
            {importQueue.length > 0 && (
                <>
                    <div className="mt-4">
                        <ul className="border border-gray-300 dark:border-gray-700 p-1 rounded-md overflow-hidden flex flex-col gap-1">
                            {importQueue.map((item) => (
                                <li
                                    key={item.id}
                                    className="px-2 py-0.5 border border-gray-300 dark:border-gray-700 bg-gray-50 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100 last:border-b-0 flex items-center text-xs"
                                    title={item.name} // Show full filename on hover
                                >
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate">
                                                {item.name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {item.status ===
                                                    FileStatus.QUEUED &&
                                                    "Queued"}
                                                {item.status ===
                                                    FileStatus.UPLOADING &&
                                                    `Uploading (${Math.round(
                                                        item.progress || 0
                                                    )}%)`}
                                                {item.status ===
                                                    FileStatus.UPLOADED &&
                                                    "Uploaded"}
                                                {item.status ===
                                                    FileStatus.INDEXING &&
                                                    "Indexing..."}
                                                {item.status ===
                                                    FileStatus.INDEXED &&
                                                    "Indexed"}
                                                {item.status ===
                                                    FileStatus.ERROR && "Error"}
                                            </span>
                                            <button
                                                className="ml-2 text-gray-500 hover:text-gray-300 cursor-pointer"
                                                onClick={() =>
                                                    setImportQueue((prev) =>
                                                        prev.filter(
                                                            (f) =>
                                                                f.id !== item.id
                                                        )
                                                    )
                                                }
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {(item.status ===
                                            FileStatus.UPLOADING ||
                                            item.status ===
                                                FileStatus.INDEXING) && (
                                            <Progress
                                                value={item.progress}
                                                className="w-32"
                                            />
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-center mt-2">
                        <button
                            className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer disabled:hover:bg-green-600 disabled:cursor-default disabled:opacity-50"
                            onClick={() => setIsProcessing(true)}
                            disabled={
                                importQueue.find(
                                    (file) => file.status === FileStatus.QUEUED
                                ) == null
                            }
                        >
                            Start Import
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GoogleDrivePicker;

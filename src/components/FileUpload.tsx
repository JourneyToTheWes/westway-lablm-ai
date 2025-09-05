"use client";

import { useState, useEffect } from "react";
import { Doc } from "@/lib/types";
import { uploadFiles } from "@/lib/api";

type FileUploadProps = {
    projectId: string;
    instrumentIds: string[];
    onUpload?: (docs: Doc[]) => void;
};

type UploadFile = {
    file: File;
    status: "queued" | "uploading" | "uploaded" | "indexed" | "error";
};

const FileUpload: React.FC<FileUploadProps> = ({
    projectId,
    instrumentIds = [],
    onUpload,
}) => {
    const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
    const [selectedInstrumentIds, setSelectedInstrumentIds] =
        useState<string[]>(instrumentIds);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setSelectedInstrumentIds(instrumentIds);
    }, [instrumentIds]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles: UploadFile[] = Array.from(e.target.files).map((f) => ({
            file: f,
            status: "queued",
        }));
        setUploadQueue((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (idx: number) => {
        setUploadQueue((prev) => prev.filter((_, i) => i !== idx));
    };

    const uploadFile = async (uf: UploadFile) => {
        // Set uploading
        setUploadQueue((prev) =>
            prev.map((f) =>
                f.file === uf.file ? { ...f, status: "uploading" } : f
            )
        );

        // Mock upload delay
        await new Promise((r) => setTimeout(r, 1000));

        // Set uploaded
        setUploadQueue((prev) =>
            prev.map((f) =>
                f.file === uf.file ? { ...f, status: "uploaded" } : f
            )
        );

        // Mock indexing delay
        await new Promise((r) => setTimeout(r, 500));

        // Set indexed
        setUploadQueue((prev) =>
            prev.map((f) =>
                f.file === uf.file ? { ...f, status: "indexed" } : f
            )
        );

        const newDocs = await uploadFiles(projectId, selectedInstrumentIds, [
            uf.file,
        ]);
        if (onUpload) onUpload(newDocs);
    };

    const handleUpload = async () => {
        try {
            for (const uf of uploadQueue.filter((f) => f.status === "queued")) {
                await uploadFile(uf);
            }

            // After successful upload, clear upload queue
            setUploadQueue([]);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    return (
        <div className="p-2 border rounded-md dark:border-gray-700">
            {/* File Picker */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const droppedFiles: UploadFile[] = Array.from(
                        e.dataTransfer.files
                    ).map((f) => ({ file: f, status: "queued" }));
                    setUploadQueue((prev) => [...prev, ...droppedFiles]);
                }}
            >
                <label
                    className={`flex flex-col items-center justify-center cursor-pointer py-4 px-2 border-2 border-dashed rounded text-center text-sm ${
                        isDragging
                            ? "border-gray-700 bg-gray-50 dark:border-gray-500 dark:bg-gray-700"
                            : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                    }`}
                >
                    <span className="text-gray-700 dark:text-gray-200 mb-1">
                        📁 Click or drag files here
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOCX, PPTX, TXT
                    </span>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.pptx,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Upload queue */}
            {uploadQueue.length > 0 && (
                <>
                    <ul className="border border-gray-300 dark:border-gray-700 p-1 rounded-md overflow-hidden flex flex-col gap-1">
                        {uploadQueue.map((uf, idx) => (
                            <li
                                key={idx}
                                className="px-2 py-0.5 border border-gray-300 dark:border-gray-700 bg-gray-50 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100 last:border-b-0 flex justify-between items-center text-xs"
                                title={uf.file.name} // Show full filename on hover
                            >
                                <span className="truncate">{uf.file.name}</span>
                                <span
                                    className={`ml-2 text-xs ${
                                        uf.status === "queued"
                                            ? "text-gray-500"
                                            : uf.status === "uploading"
                                            ? "text-blue-500"
                                            : uf.status === "uploaded"
                                            ? "text-green-500"
                                            : uf.status === "indexed"
                                            ? "text-purple-500"
                                            : "text-red-500"
                                    }`}
                                >
                                    {uf.status}
                                </span>
                                <button
                                    type="button"
                                    className="ml-2 text-gray-500 hover:text-gray-300 cursor-pointer"
                                    onClick={() => removeFile(idx)}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-center mt-2">
                        <button
                            className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer disabled:hover:bg-green-600 disabled:cursor-default disabled:opacity-50"
                            onClick={handleUpload}
                            disabled={uploadQueue.length === 0}
                        >
                            Upload
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FileUpload;

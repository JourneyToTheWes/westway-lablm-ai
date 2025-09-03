"use client";

import { useState } from "react";
import { Doc } from "@/lib/types";
import { uploadFiles } from "@/lib/api";

type FileUploadProps = {
    projectId: string;
    instruments?: { id: string; name: string }[];
    onUpload?: (docs: Doc[]) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({
    projectId,
    instruments = [],
    onUpload,
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [selectedInstrumentIds, setSelectedInstrumentIds] = useState<
        string[]
    >([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleInstrumentSelect = (id: string) => {
        setSelectedInstrumentIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleUpload = async () => {
        if (!files.length) return;

        try {
            const newDocs = await uploadFiles(projectId, files);
            if (onUpload) onUpload(newDocs); // Update parent state
            // Reset
            setFiles([]);
            setSelectedInstrumentIds([]);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    return (
        <div className="p-2 border rounded-md dark:border-gray-700">
            {/* File Picker */}
            <label className="flex justify-center cursor-pointer py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-center text-sm">
                Select Files
                <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </label>

            {instruments.length > 0 && (
                <div className="my-2">
                    <p className="text-sm font-semibold">
                        Associate with instrument(s):
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1 justify-center">
                        {instruments.map((instr) => (
                            <button
                                key={instr.id}
                                type="button"
                                className={`px-2 py-1 border rounded text-sm cursor-pointer ${
                                    selectedInstrumentIds.includes(instr.id)
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-800"
                                }`}
                                onClick={() => handleInstrumentSelect(instr.id)}
                            >
                                {instr.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <ul className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
                    {files.map((file, idx) => (
                        <li
                            key={idx}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-b last:border-b-0 flex justify-between items-center text-sm"
                            title={file.name} // Show full filename on hover
                        >
                            <span className="truncate">{file.name}</span>
                            <button
                                type="button"
                                className="ml-2 text-gray-500 hover:text-gray-300 cursor-pointer"
                                onClick={() =>
                                    setFiles((prev) =>
                                        prev.filter((_, i) => i !== idx)
                                    )
                                }
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-center mt-2">
                <button
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer disabled:hover:bg-green-600 disabled:cursor-default disabled:opacity-50"
                    onClick={handleUpload}
                    disabled={files.length === 0}
                >
                    Upload
                </button>
            </div>
        </div>
    );
};

export default FileUpload;

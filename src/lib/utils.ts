import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Doc, SupportedMimeType } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Maps a supported Google Drive MIME type to a DocType.
 * Throws an error for unsupported types.
 */
export function getDocTypeFromMime(
    mimeType: SupportedMimeType | null | undefined
): Doc["type"] | null {
    if (!mimeType) {
        return null;
    }

    switch (mimeType) {
        case "application/pdf":
            return "pdf";
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "docx";
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return "pptx";
        case "text/plain":
            return "txt";
        default:
            throw new Error(`Unsupported MIME type: ${mimeType}`);
    }
}

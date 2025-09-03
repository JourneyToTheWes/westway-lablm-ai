import { Doc } from "@/lib/types";

// Module-level in-memory storage
let mockDocsMemory: Doc[] | null = null;

/**
 * Generic loader for static JSON files
 */
export async function loadMock<T>(mockFile: string): Promise<T> {
    const data = await import(`@/data/${mockFile}`);
    return data.default as T;
}

// Mock Doc helpers for in-memory storage solution
/**
 * Get in-memory docs array (lazy load from JSON)
 */
export async function getMockDocs(): Promise<Doc[]> {
    if (!mockDocsMemory) {
        mockDocsMemory = await loadMock<Doc[]>("mock-docs.json");
    }
    return mockDocsMemory;
}

/**
 * Append new docs to in-memory storage
 */
export async function addMockDocs(newDocs: Doc[]): Promise<void> {
    const docs = await getMockDocs();
    docs.push(...newDocs);
}

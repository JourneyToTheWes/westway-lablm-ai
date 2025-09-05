import { Project, Chat, Message, Instrument, Doc } from "@/lib/types";

/**
 * Helper to fetch and handle errors
 */
async function safeFetch<T>(url: string): Promise<T> {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(
                `Failed to fetch ${url}: ${res.status} ${res.statusText}`
            );
        }

        return res.json();
    } catch (err) {
        console.error(err);
        throw err; // let the UI handle displaying error
    }
}

export async function fetchProjects(): Promise<Project[]> {
    return safeFetch<Project[]>("/api/projects");
}

export async function fetchProject(
    projectId: string
): Promise<Project | undefined> {
    const projects = await fetchProjects();
    return projects.find((p) => p.id === projectId);
}

export async function fetchInstruments(
    projectId?: string
): Promise<Instrument[]> {
    const url = projectId
        ? `/api/projects/${projectId}/instruments`
        : `/api/instruments`;
    return safeFetch<Instrument[]>(url);
}

export async function fetchDocs(projectId?: string): Promise<Doc[]> {
    const url = projectId ? `/api/projects/${projectId}/docs` : `/api/docs`;
    return safeFetch<Doc[]>(url);
}

export async function fetchChats(): Promise<Chat[]> {
    return safeFetch<Chat[]>("/api/chats");
}

export async function fetchMessages(chatId: string): Promise<Message[]> {
    return safeFetch<Message[]>(`/api/chats/${chatId}/messages`);
}

/**
 * Uploads files for a project.
 * Returns the new Doc objects created.
 */
export async function uploadFiles(
    projectId: string,
    instrumentIds: Instrument["id"][],
    files: File[]
): Promise<Doc[]> {
    try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        instrumentIds.forEach((instId) =>
            formData.append("instrumentIds", instId)
        );

        const res = await fetch(`/api/projects/${projectId}/files`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`Failed to upload files: ${res.statusText}`);
        }

        const data: Doc[] = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function importDriveFiles(
    projectId: string,
    instrumentIds: Instrument["id"][],
    files: { id: string; name: string; mimeType: string }[],
    accessToken: string
): Promise<Doc[]> {
    try {
        const res = await fetch("/api/google-drive/import", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include the token
            },
            body: JSON.stringify({
                projectId,
                instrumentIds,
                fileIds: files.map((f) => f.id),
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            const errorMessage = data.error || data.message || "Unknown error";
            console.error(
                `API Error: ${res.status} ${res.statusText} - ${errorMessage}`
            );

            throw new Error(`Failed to import files: ${errorMessage}`);
        }

        const importedDocs: Doc[] = data;
        return importedDocs;
    } catch (err) {
        console.error("Drive import failed:", err);
        throw err;
    }
}

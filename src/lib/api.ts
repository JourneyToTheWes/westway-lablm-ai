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
    projectId: string
): Promise<Instrument[]> {
    return safeFetch<Instrument[]>(`/api/projects/${projectId}/instruments`);
}

export async function fetchDocs(projectId: string): Promise<Doc[]> {
    return safeFetch<Doc[]>(`/api/projects/${projectId}/docs`);
}

export async function fetchChats(): Promise<Chat[]> {
    return safeFetch<Chat[]>("/api/chats");
}

export async function fetchMessages(chatId: string): Promise<Message[]> {
    return safeFetch<Message[]>(`/api/chats/${chatId}/messages`);
}

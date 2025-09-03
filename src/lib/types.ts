export interface Project {
    id: string;
    name: string;
    description?: string;
}

export interface Instrument {
    id: string;
    projectIds: string[];
    name: string;
    model: string;
}

export interface Doc {
    id: string;
    projectId: string; // Is associated with a project
    instrumentIds?: string[]; // optional, empty if general project doc
    title: string;
    type: "pdf" | "docx" | "pptx" | "txt";
    path: string; // file path or mock URL
    pageCount?: number;
    content?: string; // parsed text for AI semantic search
}

export interface Chat {
    id: string;
    projectId: string;
    title: string;
    createdAt: string; // ISO date string
}

export interface Message {
    id: string;
    chatId: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
    citations?: Array<{
        docId: string; // references Doc.id
        page?: number; // optional, only for PDFs
    }>;
}

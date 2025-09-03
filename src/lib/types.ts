export interface Project {
    id: string;
    name: string;
    description?: string;
}

export interface Instrument {
    id: string;
    projectId: string;
    name: string;
    model: string;
}

export interface Doc {
    id: string;
    instrumentId: string;
    title: string;
    type: "pdf" | "docx" | "pptx" | "txt";
    path: string; // file path or mock URL
    pageCount?: number;
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

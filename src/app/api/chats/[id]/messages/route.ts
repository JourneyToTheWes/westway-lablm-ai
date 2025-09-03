import { loadMock } from "@/lib/mock";
import { Message } from "@/lib/types";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const messages = await loadMock<Message[]>("mock-messages.json");
        const filtered = messages.filter((m) => m.chatId === params.id);
        return Response.json(filtered);
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch messages", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: chatId } = params;
        const { text } = await req.json();

        // Load existing messages
        const messages = await loadMock<Message[]>("mock-messages.json");

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            chatId,
            role: "user",
            content: text,
            createdAt: new Date().toISOString(),
        };

        // Mocked AI response
        const assistantMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            chatId,
            role: "assistant",
            content: `This is a mock reply to: "${text}"`,
            createdAt: new Date().toISOString(),
            citations: [
                { docId: "doc-1", page: 12 },
                { docId: "doc-2", page: 45 },
            ],
        };
        // For mocks, just echo back the new message
        return Response.json([userMessage, assistantMessage]);
    } catch (error) {
        console.error(error);
        return new Response("Failed to post message", { status: 500 });
    }
}

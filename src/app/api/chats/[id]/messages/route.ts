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
        const body = await req.json();
        // Normally you would save to DB; for mocks, just echo back
        const newMessage = {
            id: `m${Date.now()}`,
            chatId: params.id,
            role: "user",
            content: body.content,
        };
        return Response.json(newMessage);
    } catch (error) {
        console.error(error);
        return new Response("Failed to post message", { status: 500 });
    }
}

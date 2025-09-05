import { loadMock } from "@/lib/mock";
import { Message } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string; messageId: string }> }
) {
    try {
        const { chatId, messageId } = await params;
        const { feedback } = await req.json();

        const messages = await loadMock<Message[]>("mock-messages.json");
        const messageToUpdate = messages.find(
            (m) => m.chatId === chatId && m.id === messageId
        );

        const newMessage = { ...messageToUpdate, feedback }; // Not actually persisting feedback yet just for mock response
        return Response.json(newMessage);
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch messages", { status: 500 });
    }
}

import { NextRequest } from "next/server";
import { loadMock } from "@/lib/mock";
import { Message } from "@/lib/types";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: chatId } = await params;
        const messages = await loadMock<Message[]>("mock-messages.json");
        const filtered = messages.filter((m) => m.chatId === chatId);
        return Response.json(filtered);
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch messages", { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: chatId } = await params;
    const encoder = new TextEncoder();
    const { text } = await req.json();

    // Mock assistant response
    const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        chatId,
        role: "assistant",
        content: `This is a mock response to "${text}". It includes citations.`,
        createdAt: new Date().toISOString(),
        citations: [
            { docId: "doc-1", page: 12 },
            { docId: "doc-2", page: 45 },
        ],
    };

    const statusStages = ["Searching", "Thinking", "Drafting", "Generating"];

    const stream = new ReadableStream({
        async start(controller) {
            // 1. Stream AI thinking stages
            for (const stage of statusStages) {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ stage })}\n\n`)
                );
                await new Promise((r) => setTimeout(r, 400));
            }

            // 2. Stream assistant message character by character
            for (const char of assistantMessage.content) {
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ token: char })}\n\n`
                    )
                );
                await new Promise((r) => setTimeout(r, 40));
            }

            // 3. Append citations at the end
            controller.enqueue(
                encoder.encode(
                    `data: ${JSON.stringify({
                        citations: assistantMessage.citations,
                    })}\n\n`
                )
            );

            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}

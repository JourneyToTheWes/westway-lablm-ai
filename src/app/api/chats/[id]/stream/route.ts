import { Message } from "@/lib/types";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const encoder = new TextEncoder();

    // Example mock assistant message with citation
    const assistantMessage: Message = {
        id: `m${Date.now()}`,
        chatId: params.id,
        role: "assistant",
        content:
            "Please check the power cable is securely connected and the lid is locked.",
        createdAt: new Date().toISOString(),
        citations: [{ docId: "d1", page: 12 }],
    };

    const stream = new ReadableStream({
        start(controller) {
            const words = assistantMessage.content.split(" ");
            words.forEach((word, i) => {
                setTimeout(() => {
                    controller.enqueue(encoder.encode(`data: ${word} `));
                    if (i === words.length - 1) {
                        // Send citations at the end
                        controller.enqueue(
                            encoder.encode(
                                `\ndata: ${JSON.stringify({
                                    citations: assistantMessage.citations,
                                })}\n\n`
                            )
                        );
                        controller.close();
                    }
                }, i * 120);
            });
        },
    });

    return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
    });
}

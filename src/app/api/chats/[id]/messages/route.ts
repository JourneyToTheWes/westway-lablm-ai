import { NextRequest } from "next/server";
import { getMockDocs, loadMock } from "@/lib/mock";
import { Citation, Message } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";
import { parseStack } from "next/dist/server/lib/parse-stack";

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

    let assistantMessage: Message;
    // Message sent needs to contain "westway lablm ai demo" and should also contain part
    // of the file title that you want the citation to be from
    if (text.toLowerCase().includes("WestWay LabLM AI Demo:".toLowerCase())) {
        // Second mock assistant response for linking up an public/docs/ file to citation
        // for document previewing demo
        const specialFileNameCheck = text.split(":")[1].trim();
        const docs = await getMockDocs();
        console.log(docs);

        // const citations = docs
        //     .filter((doc) => doc.title.includes(specialFileNameCheck))
        //     .map((doc) => ({
        //         docId: doc.id,
        //         page: doc.pageCount
        //             ? Math.floor(Math.random() * doc.pageCount) + 1
        //             : 1,
        //     }));

        const docsDirectory = path.join(process.cwd(), "public", "docs");

        const fileNames = await fs.readdir(docsDirectory);
        const citations: Citation[] = fileNames
            .filter((fileName) => fileName.includes(specialFileNameCheck))
            .map((fileName) => {
                const docTitle = fileName.split(".").slice(0, -1).join(".");
                return {
                    docId: "d10",
                    page: 1,
                    docTitle, // Doc in-memory doesn't persist across serverless functions so I need a mocked out way to access an uploaded file temporarily
                };
            });

        console.log(citations);

        assistantMessage = {
            id: `msg-${Date.now()}`,
            chatId,
            role: "assistant",
            content: `This is a "special" mock response to "${text}". It includes "real" citations 😊. Heck yeah!!! That's what I'm talking about!`,
            createdAt: new Date().toISOString(),
            citations,
        };
    } else {
        // Mock assistant response
        assistantMessage = {
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
    }

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

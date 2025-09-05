import { NextRequest } from "next/server";
import { getMockDocs, loadMock } from "@/lib/mock";
import { Message } from "@/lib/types";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;
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
    { params }: { params: Promise<{ chatId: string }> }
) {
    const { chatId } = await params;
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

        const citations = docs
            .filter((doc) =>
                doc.title
                    .toLowerCase()
                    .includes(specialFileNameCheck.toLowerCase())
            )
            .map((doc) => ({
                docId: doc.id,
                page: doc.pageCount
                    ? Math.floor(Math.random() * doc.pageCount) + 1
                    : 1,
            }));

        assistantMessage = {
            id: `msg-${Date.now()}`,
            chatId,
            role: "assistant",
            content: `This is a "special" mock response to "${text}". It includes "real" citations 😊. Heck yeah!!! That's what I'm talking about!`,
            createdAt: new Date().toISOString(),
            citations,
        };
    } else if (text.toLowerCase().trim().includes("show me markdown")) {
        const response = `This is a mock response to "${text}". It includes citations.

# Lab Work: Protein Analyzer Project

**Project Title:** Protein Analyzer Project

**Project Description:** Research project using Protein Analyzer 3000 for protein folding studies.

![Protein Analyzer Machine](https://upload.wikimedia.org/wikipedia/commons/5/5b/Protein_pattern_analyzer.jpg)

## Troubleshooting Tips for the Protein Analyzer 3000

| Problem | Potential Cause | Troubleshooting Steps |
| --- | --- | --- |
| **No data output** | Instrument not powered on; loose cable connections; software not initiated. | 1. Check power light on instrument. <br> 2. Ensure all data and power cables are securely connected. <br> 3. Restart the instrument and software. |
| **Inconsistent readings** | Sample contamination; calibration required; temperature fluctuations. | 1. Use a fresh, sterile sample. <br> 2. Recalibrate the instrument using the standard protocol. <br> 3. Verify the lab's ambient temperature is stable. |
| **Error Code E-73** | Filter blockage; internal sensor malfunction. | 1. Clean or replace the instrument's filter. <br> 2. Refer to the user manual for E-73 specifics. <br> 3. Contact technical support if the error persists. |
| **Slow analysis speed** | Large data file size; outdated software firmware. | 1. Analyze smaller batches of data. <br> 2. Check for and install the latest firmware updates. <br> 3. Close other programs running on the connected computer. |
| **Distorted signal** | Electromagnetic interference; dirty sample chamber. | 1. Relocate the instrument away from other electronics. <br> 2. Thoroughly clean the sample chamber with a lint-free cloth. <br> 3. Run a baseline test with a blank sample. |
`;
        // Mock assistant response with markdown
        assistantMessage = {
            id: `msg-${Date.now()}`,
            chatId,
            role: "assistant",
            content: response,
            createdAt: new Date().toISOString(),
            citations: [
                { docId: "doc-1", page: 12 },
                { docId: "doc-2", page: 45 },
            ],
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

            // 2. Stream assistant message: Flush every N ms and batch tokens adaptively
            const batchDelay = 40;
            let buffer = "";

            for (const char of assistantMessage.content) {
                buffer += char;

                if (/[.,!?]$/.test(buffer) || buffer.length > 20) {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ token: buffer })}\n\n`
                        )
                    );

                    buffer = "";
                    await new Promise((r) => setTimeout(r, batchDelay));
                }
            }

            if (buffer) {
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ token: buffer })}\n\n`
                    )
                );
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

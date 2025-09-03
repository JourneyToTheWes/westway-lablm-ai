export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const encoder = new TextEncoder();
    const mockResponse =
        "Please check the power cable is securely connected and the lid is properly locked. [^1]";

    const stream = new ReadableStream({
        start(controller) {
            mockResponse.split(" ").forEach((word, i) => {
                setTimeout(() => {
                    controller.enqueue(encoder.encode(`data: ${word} `));
                    if (i === mockResponse.split(" ").length - 1)
                        controller.close();
                }, i * 100);
            });
        },
    });

    return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
    });
}

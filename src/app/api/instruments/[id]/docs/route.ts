import { loadMock } from "@/lib/mock";
import { Doc } from "@/lib/types";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: instrumentId } = await params;
        const docs = await loadMock<Doc[]>("mock-docs.json");
        const filteredDocs = docs.filter(
            (doc) =>
                doc.instrumentIds?.includes(instrumentId) ||
                doc.instrumentIds?.length === 0
        );

        return new Response(JSON.stringify(filteredDocs), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch docs", { status: 500 });
    }
}

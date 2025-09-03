import { loadMock } from "@/lib/mock";
import { Doc } from "@/lib/types";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const docs = await loadMock<Doc[]>("mock-docs.json");
        const filtered = docs.filter((doc) => doc.instrumentId === params.id);
        return Response.json(filtered);
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch docs", { status: 500 });
    }
}

import { loadMock } from "@/lib/mock";
import { Instrument } from "@/lib/types";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const instruments = await loadMock<Instrument[]>(
            "mock-instruments.json"
        );
        // Filter instruments by projectId
        const filtered = instruments.filter(
            (inst) => inst.projectId === params.id
        );
        return Response.json(filtered);
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch instruments", { status: 500 });
    }
}

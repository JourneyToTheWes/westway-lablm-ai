import { loadMock } from "@/lib/mock";
import { Instrument } from "@/lib/types";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const instruments = await loadMock<Instrument[]>(
            "mock-instruments.json"
        );
        // Filter instruments by projectId
        const filtered = instruments.filter((inst) =>
            inst.projectIds.includes(projectId)
        );
        return Response.json(filtered);
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch instruments", { status: 500 });
    }
}

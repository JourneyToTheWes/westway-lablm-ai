import { loadMock } from "@/lib/mock";

export async function GET() {
    try {
        const projects = await loadMock("mock-projects.json");
        return Response.json(projects);
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch projects", { status: 500 });
    }
}

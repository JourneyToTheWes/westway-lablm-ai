import { loadMock } from "@/lib/mock";

export async function GET() {
    try {
        const chats = await loadMock("mock-chats.json");
        return Response.json(chats);
    } catch (error) {
        console.error(error);
        return new Response("Failed to fetch chats", { status: 500 });
    }
}

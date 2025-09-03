import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Doc } from "@/lib/types";
import { getMockDocs, addMockDocs } from "@/lib/mock";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: projectId } = await params;

    const formData = await req.formData();
    const instrumentIdsRaw = formData.get("instrumentIds") as string | null;
    const instrumentIds = instrumentIdsRaw
        ? instrumentIdsRaw.split(",").map((id) => id.trim())
        : [];

    const files = Array.from(formData.entries())
        .filter(([_, value]) => value instanceof File)
        .map(([_, file]) => {
            const f = file as File;
            return {
                name: f.name,
                size: f.size,
                type: f.name.split(".").pop()?.toLowerCase(),
            };
        });

    // Load existing mock docs
    const docs: Doc[] = await getMockDocs();

    // Create new Doc entries
    const newDocs: Doc[] = files.map((file) => ({
        id: uuidv4(),
        projectId,
        instrumentIds,
        title: file.name,
        type: file.type as "pdf" | "docx" | "pptx" | "txt",
        path: `/mock-uploads/${file.name}`, // mock path
        pageCount: undefined,
        content: undefined,
    }));

    // Append to mocked data (in memory)
    docs.push(...newDocs);
    await addMockDocs(docs);

    return new Response(JSON.stringify(newDocs), {
        headers: { "Content-Type": "application/json" },
    });
}

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Doc } from "@/lib/types";
import { addMockDocs, getMockDocs } from "@/lib/mock";
import { put } from "@vercel/blob";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;

        const formData = await req.formData();
        const instrumentIds = formData.getAll("instrumentIds") as
            | string[]
            | null;

        const files = formData.getAll("files") as File[];

        // Create newDocs to be added to in-memory doc storage
        const newDocs: Doc[] = [];

        const docs = await getMockDocs();

        for (const file of files) {
            const fileId = uuidv4();
            const fileName = `${fileId}-${file.name}`;

            // Upload to Vercel Blob
            const { url: savePath } = await put(fileName, file, {
                access: "public",
            });

            // Create new Doc entry
            const newDoc: Doc = {
                id: fileId,
                projectId,
                instrumentIds: instrumentIds ? instrumentIds : [],
                title: file.name,
                type: file.type as "pdf" | "docx" | "pptx" | "txt",
                path: savePath,
                pageCount: 0,
                content: "",
            };

            newDocs.push(newDoc);
        }

        // Append to mocked data (in memory)
        docs.push(...newDocs);
        await addMockDocs(docs);

        return NextResponse.json(newDocs);
    } catch (err) {
        console.error("Upload failed: ", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

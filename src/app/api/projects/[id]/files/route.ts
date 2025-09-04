import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Doc } from "@/lib/types";
import { getMockDocs, addMockDocs } from "@/lib/mock";
import path from "path";
import { promises as fs } from "fs";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;

        const formData = await req.formData();
        const instrumentIdsRaw = formData.get("instrumentIds") as string | null;
        const instrumentIds = instrumentIdsRaw
            ? instrumentIdsRaw.split(",").map((id) => id.trim())
            : [];
        const files = formData.getAll("files") as File[];

        // Create newDocs to be added to in-memory doc storage
        const newDocs: Doc[] = [];

        const uploadDir = path.join(process.cwd(), "public", "docs");
        await fs.mkdir(uploadDir, { recursive: true });

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const fileId = uuidv4();
            const fileName = `${fileId}-${file.name}`;
            const savePath = path.join(uploadDir, fileName);

            // Save to /public/docs
            await fs.writeFile(savePath, buffer);

            // Create new Doc entry
            const newDoc: Doc = {
                id: fileId,
                projectId,
                instrumentIds,
                title: file.name,
                type: file.type as "pdf" | "docx" | "pptx" | "txt",
                path: `/docs/${fileName}`,
                pageCount: 0,
                content: "",
            };

            newDocs.push(newDoc);
        }

        // Append to mocked data (in memory)
        await addMockDocs(newDocs);

        return NextResponse.json(newDocs);
    } catch (err) {
        console.error("Upload failed: ", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

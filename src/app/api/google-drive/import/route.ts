// app/api/google-drive/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { google } from "googleapis";
import { Doc } from "@/lib/types";

const importedDocs: Doc[] = [];

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { fileIds, projectId } = body as {
        fileIds: string[];
        projectId: string;
    };

    const authorizationHeader = (await headers()).get("Authorization");
    if (!authorizationHeader) {
        return NextResponse.json(
            { error: "Authorization header is missing" },
            { status: 401 }
        );
    }
    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
        return NextResponse.json(
            { error: "Invalid Authorization header format" },
            { status: 401 }
        );
    }

    if (!fileIds || !projectId || !accessToken) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: "v3", auth });

        const newDocs: Doc[] = [];

        for (const fileId of fileIds) {
            const { data } = await drive.files.get({
                fileId,
                fields: "id, name, mimeType",
            });

            const contentResponse = await drive.files.get(
                { fileId, alt: "media" },
                { responseType: "arraybuffer" }
            );
            const contentBuffer = Buffer.from(
                contentResponse.data as ArrayBuffer
            );
            const contentText = contentBuffer.toString("utf-8").slice(0, 1000);

            const newDoc: Doc = {
                id: `gd-${data.id}`,
                projectId,
                instrumentIds: [],
                title: data.name || "Untitled",
                type: data.mimeType === "application/pdf" ? "pdf" : "txt",
                path: `/mock/path/${data.id}`,
                content: contentText,
            };

            importedDocs.push(newDoc);
            newDocs.push(newDoc);
        }

        return NextResponse.json(newDocs);
    } catch (err) {
        console.error(err);

        if (err instanceof Error && "message" in err) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "An unkown error occurred" },
            { status: 500 }
        );
    }
}

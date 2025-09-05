import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { google } from "googleapis";
import { Doc, SupportedMimeType } from "@/lib/types";
import path from "path";
import { promises as fs } from "fs";
import { getDocTypeFromMime } from "@/lib/utils";

const importedDocs: Doc[] = [];

/**
 * A type guard to check if a string is a supported MIME type.
 */
function isSupportedMimeType(
    mimeType: string | null | undefined
): mimeType is SupportedMimeType {
    if (!mimeType) {
        return false;
    }

    return (
        mimeType === "application/pdf" ||
        mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        mimeType === "text/plain"
    );
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { fileIds, instrumentIds, projectId } = body as {
        fileIds: string[];
        instrumentIds: string[];
        projectId: string;
    };

    console.log(instrumentIds);

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

        const uploadDir = path.join(process.cwd(), "public", "docs");
        await fs.mkdir(uploadDir, { recursive: true });

        for (const fileId of fileIds) {
            const { data } = await drive.files.get({
                fileId,
                fields: "id, name, mimeType",
            });

            if (!isSupportedMimeType(data.mimeType)) {
                console.error("File type not supported:", data.mimeType);
                throw new Error(`File type not supported: ${data.mimeType}`);
            }

            const docType = getDocTypeFromMime(data.mimeType);

            if (!docType) {
                console.error(
                    "Unsupported or missing file type. Cannot create document."
                );
                throw new Error(
                    "Unsupported or missing file type. Cannot create document."
                );
            }

            const contentResponse = await drive.files.get(
                { fileId, alt: "media" },
                { responseType: "arraybuffer" }
            );
            const contentBuffer = Buffer.from(
                contentResponse.data as ArrayBuffer
            );
            const contentText = contentBuffer.toString("utf-8").slice(0, 1000);
            const newFileId = `gd-${data.id}`;
            // const fileName = `${newFileId}-${data.name}`;
            const fileName = data.name ?? "";
            const savePath = path.join(uploadDir, fileName);

            // Save to /public/docs
            await fs.writeFile(savePath, contentBuffer);

            // Creatae new Doc entry
            const newDoc: Doc = {
                id: newFileId,
                projectId,
                instrumentIds: [],
                title: data.name || "Untitled",
                type: docType,
                path: `/docs/${fileName}`,
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

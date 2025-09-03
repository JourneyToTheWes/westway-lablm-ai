import { NextResponse } from "next/server";
import { getMockDocs } from "@/lib/mock";

export async function GET() {
    try {
        const docs = await getMockDocs();
        return NextResponse.json(docs);
    } catch (err) {
        console.error("Error fetching documents:", err);
        return NextResponse.json(
            { error: "Failed to fetch documents" },
            { status: 500 }
        );
    }
}

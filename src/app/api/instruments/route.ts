import { NextResponse } from "next/server";
import { loadMock } from "@/lib/mock";
import { Instrument } from "@/lib/types";

export async function GET() {
    try {
        const instruments = await loadMock<Instrument[]>(
            "mock-instruments.json"
        );
        return NextResponse.json(instruments);
    } catch (err) {
        console.error("Error fetching instruments:", err);
        return NextResponse.json(
            { error: "Failed to fetch instruments" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export async function POST() {
  try {
    await fetch(`${BACKEND_URL}/clear-cache`, { method: "POST" })
    return NextResponse.json({ cleared: true })
  } catch {
    return NextResponse.json({ cleared: false }, { status: 502 })
  }
}

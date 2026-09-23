import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db.json");

async function readDb() {
  const content = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(content);
}

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.trend || []);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch trend data" }, { status: 500 });
  }
}

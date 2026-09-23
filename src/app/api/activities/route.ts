import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Activity } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "db.json");

async function readDb() {
  const content = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(content);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const db = await readDb();
    let activities: Activity[] = db.activities || [];

    if (employeeId) {
      activities = activities.filter((a) => a.employeeId === Number(employeeId));
    }

    const sortOrder = searchParams.get("_order") === "asc" ? 1 : -1;
    activities.sort((a, b) => (new Date(a.date).getTime() - new Date(b.date).getTime()) * sortOrder);

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch activities" }, { status: 500 });
  }
}

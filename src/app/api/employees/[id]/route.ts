import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DEPARTMENTS, ROLES, LOCATIONS, type Employee } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "db.json");

async function readDb() {
  const content = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(content);
}

async function writeDb(data: unknown) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const db = await readDb();
    const employee = (db.employees || []).find((e: Employee) => e.id === id);

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const db = await readDb();
    const employees: Employee[] = db.employees || [];
    const index = employees.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    // --- Server-side validation for patch fields ---
    if (body.department && !DEPARTMENTS.includes(body.department)) {
      return NextResponse.json({ message: "Validation error: Invalid department" }, { status: 400 });
    }
    if (body.role && !ROLES.includes(body.role)) {
      return NextResponse.json({ message: "Validation error: Invalid role" }, { status: 400 });
    }
    if (body.location && !LOCATIONS.includes(body.location)) {
      return NextResponse.json({ message: "Validation error: Invalid location" }, { status: 400 });
    }
    if (body.salary !== undefined) {
      const s = Number(body.salary);
      if (isNaN(s) || s <= 0) {
        return NextResponse.json({ message: "Validation error: Salary must be a positive number" }, { status: 400 });
      }
      body.salary = s;
    }
    if (body.status && !["active", "on_leave", "inactive"].includes(body.status)) {
      return NextResponse.json({ message: "Validation error: Invalid status" }, { status: 400 });
    }

    const updatedEmployee = { ...employees[index], ...body };
    employees[index] = updatedEmployee;
    db.employees = employees;
    await writeDb(db);

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const db = await readDb();
    const employees: Employee[] = db.employees || [];
    const initialLen = employees.length;
    const filtered = employees.filter((e) => e.id !== id);

    if (filtered.length === initialLen) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    db.employees = filtered;
    await writeDb(db);

    return new Response(null, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete employee" }, { status: 500 });
  }
}

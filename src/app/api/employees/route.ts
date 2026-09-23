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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const db = await readDb();
    let employees: Employee[] = db.employees || [];

    // Search query
    const q = searchParams.get("q")?.toLowerCase();
    if (q) {
      employees = employees.filter(
        (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
      );
    }

    // Department filter
    const department = searchParams.get("department");
    if (department) {
      employees = employees.filter((e) => e.department.toLowerCase() === department.toLowerCase());
    }

    // Status filter
    const status = searchParams.get("status");
    if (status) {
      employees = employees.filter((e) => e.status === status);
    }

    // Sorting
    const sortField = searchParams.get("_sort") as keyof Employee | null;
    const sortOrder = searchParams.get("_order") === "desc" ? -1 : 1;
    if (sortField) {
      employees.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * sortOrder;
        }
        return String(valA ?? "").localeCompare(String(valB ?? "")) * sortOrder;
      });
    }

    const totalCount = employees.length;

    // Pagination
    const page = Math.max(1, Number(searchParams.get("_page") || 1));
    const limit = Math.max(1, Number(searchParams.get("_limit") || 10));
    const start = (page - 1) * limit;
    const paginatedEmployees = employees.slice(start, start + limit);

    return NextResponse.json(paginatedEmployees, {
      status: 200,
      headers: {
        "X-Total-Count": String(totalCount),
        "Access-Control-Expose-Headers": "X-Total-Count",
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to read employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- Strict Server-Side Validation ---
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ message: "Validation error: Name is required." }, { status: 400 });
    }

    if (!body.email || typeof body.email !== "string" || !/^\S+@\S+\.\S+$/.test(body.email)) {
      return NextResponse.json({ message: "Validation error: Valid email is required." }, { status: 400 });
    }

    if (!body.department || !DEPARTMENTS.includes(body.department)) {
      return NextResponse.json({ message: "Validation error: Invalid or missing department." }, { status: 400 });
    }

    if (!body.role || !ROLES.includes(body.role)) {
      return NextResponse.json({ message: "Validation error: Invalid or missing role." }, { status: 400 });
    }

    if (!body.location || !LOCATIONS.includes(body.location)) {
      return NextResponse.json({ message: "Validation error: Invalid or missing location." }, { status: 400 });
    }

    const salary = Number(body.salary);
    if (isNaN(salary) || salary <= 0) {
      return NextResponse.json({ message: "Validation error: Salary must be a positive number." }, { status: 400 });
    }

    const validStatuses = ["active", "on_leave", "inactive"];
    const status = body.status || "active";
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Validation error: Invalid status." }, { status: 400 });
    }

    if (status === "on_leave" && !body.leaveEndDate) {
      return NextResponse.json({ message: "Validation error: Leave end date is required when on leave." }, { status: 400 });
    }

    const db = await readDb();
    const existingEmployees: Employee[] = db.employees || [];
    const maxId = existingEmployees.reduce((max, e) => Math.max(max, e.id || 0), 0);
    const newId = maxId + 1;

    const newEmployee: Employee = {
      id: newId,
      name: body.name.trim(),
      email: body.email.trim(),
      department: body.department,
      role: body.role,
      status,
      salary,
      location: body.location,
      joinedAt: body.joinedAt || new Date().toISOString().slice(0, 10),
    };

    existingEmployees.push(newEmployee);
    db.employees = existingEmployees;
    await writeDb(db);

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create employee" }, { status: 500 });
  }
}

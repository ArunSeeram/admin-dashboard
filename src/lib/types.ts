// Central place for the shapes of data used across the app.
// Keeping types here (instead of scattering them) makes it easy for a beginner
// to see the whole "data model" of the app in one file.

export type EmployeeStatus = "active" | "on_leave" | "inactive";

export const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Sales",
  "Marketing",
  "Support",
  "HR",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const ROLES = [
  "Junior",
  "Senior",
  "Lead",
  "Manager",
  "Intern",
] as const;

export type Role = (typeof ROLES)[number];

export const LOCATIONS = [
  "In Office",
  "Hybrid",
  "Work From Home",
] as const;

export type LocationType = (typeof LOCATIONS)[number];

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  salary: number;
  joinedAt: string; // ISO date string, e.g. "2023-05-01"
  location: string;
}

export interface Activity {
  id: number;
  employeeId: number;
  type: "created" | "updated" | "status_change" | "note";
  message: string;
  date: string;
}

export interface TrendPoint {
  date: string;
  newHires: number;
  departures: number;
}

// The shape of a paginated list response, matching what our API layer returns
// after it reads json-server's pagination headers.
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Filters the Employees table understands. They double as URL query params,
// which is what makes the table's state shareable/bookmarkable.
export interface EmployeeFilters {
  search: string;
  department: string; // "" means "all departments"
  status: string; // "" means "all statuses"
  sortBy: "name" | "department" | "salary" | "joinedAt";
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
}

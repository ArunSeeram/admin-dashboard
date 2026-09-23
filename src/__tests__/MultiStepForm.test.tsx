import { render, screen, fireEvent } from "@testing-library/react";
import { MultiStepForm } from "@/components/employees/MultiStepForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
  useSWRConfig: () => ({ mutate: jest.fn() }),
}));

describe("MultiStepForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders Step 1 with Name and Email inputs", () => {
    render(<MultiStepForm />);

    expect(screen.getByText("Basic info")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  });

  it("shows validation errors when advancing Step 1 with empty fields", () => {
    render(<MultiStepForm />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
  });

  it("shows an error for invalid email format", () => {
    render(<MultiStepForm />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "invalid-email" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("advances to Step 2 and conditionally displays Leave end date when status is On leave", () => {
    render(<MultiStepForm />);

    // Step 1: Fill in valid name and email
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    // Now in Step 2: Role & status
    expect(screen.getByLabelText("Department")).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();

    // Leave end date should NOT be visible when status is 'active'
    expect(screen.queryByLabelText("Leave end date")).not.toBeInTheDocument();

    // Change status to 'on_leave'
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "on_leave" } });

    // Conditional field should now appear
    expect(screen.getByLabelText("Leave end date")).toBeInTheDocument();
  });
});

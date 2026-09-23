import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

// A small example test to show the testing setup works, and to demonstrate
// how to test "critical" interactive behavior (clicks, disabled state).
describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled while loading and does not fire onClick", () => {
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} isLoading>
        Save
      </Button>
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/employees/Pagination";

describe("Pagination", () => {
  it("renders page info and counts correctly", () => {
    render(<Pagination page={1} pageSize={10} total={45} onPageChange={jest.fn()} />);

    expect(screen.getByText("Showing")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
  });

  it("disables Previous button on the first page", () => {
    const onPageChange = jest.fn();
    render(<Pagination page={1} pageSize={10} total={50} onPageChange={onPageChange} />);

    const prevButton = screen.getByRole("button", { name: "Previous" });
    expect(prevButton).toBeDisabled();
    fireEvent.click(prevButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("calls onPageChange with next page when Next is clicked", () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} pageSize={10} total={50} onPageChange={onPageChange} />);

    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables Next button on the last page", () => {
    const onPageChange = jest.fn();
    render(<Pagination page={5} pageSize={10} total={50} onPageChange={onPageChange} />);

    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeDisabled();
    fireEvent.click(nextButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

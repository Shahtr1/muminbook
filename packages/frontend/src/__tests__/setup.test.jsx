import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@chakra-ui/react";

describe("Chakra UI Integration", () => {
  it("should render Chakra Button component", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("should apply Chakra props correctly", () => {
    render(
      <Button colorScheme="blue" size="lg" data-testid="test-button">
        Test Button
      </Button>,
    );

    const button = screen.getByTestId("test-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Test Button");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renders the heading and health link", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "NoAgency" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /estado del sistema/i })).toHaveAttribute(
      "href",
      "/api/health",
    );
  });
});

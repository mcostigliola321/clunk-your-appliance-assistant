import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it } from "vitest";

import { DemoVideo } from "./DemoVideo";

afterEach(cleanup);

it("loads only the submitted video after an explicit click, without autoplay", async () => {
  const user = userEvent.setup();
  const { container } = render(<DemoVideo />);
  const toggle = screen.getByRole("button", { name: "Watch the 2:30 demo" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(container.querySelector("iframe")).toBeNull();
  expect(screen.getByRole("link", { name: /Open on YouTube/ })).toHaveAttribute(
    "href",
    "https://youtu.be/9eQbt7B8rQs",
  );

  await user.click(toggle);
  const player = screen.getByTitle(/Clunk demo:/);
  const source = new URL(player.getAttribute("src")!);
  expect(source.origin).toBe("https://www.youtube-nocookie.com");
  expect(source.pathname).toBe("/embed/9eQbt7B8rQs");
  expect(source.searchParams.get("autoplay")).toBe("0");
  expect(player).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(document.getElementById(toggle.getAttribute("aria-controls")!)).toContainElement(player);

  await user.click(screen.getByRole("button", { name: "Close demo" }));
  expect(container.querySelector("iframe")).toBeNull();
  expect(toggle).toHaveFocus();
  expect(screen.getByRole("link", { name: /Open on YouTube/ })).toBeVisible();
});

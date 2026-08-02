import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GameCard } from "./GameCard";
import type { Game } from "../../types/game";

const game: Game = {
  id: "deal-1",
  gameId: "game-1",
  title: "Resident Evil",
  price: 12,
  originalPrice: 40,
  discountPercentage: 70,
  metacriticScore: 85,
  steamRatingPercent: 92,
  imageUrl: "https://example.com/resident-evil.jpg",
};

describe("GameCard", () => {
  it("displays the game information", () => {
    render(<GameCard game={game} />);

    expect(
      screen.getByRole("heading", {
        name: "Resident Evil",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Discount: 70%")).toBeInTheDocument();
    expect(screen.getByText("Metacritic: 85")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Add to cart",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Cover of Resident Evil",
      }),
    ).toBeInTheDocument();
  });
});

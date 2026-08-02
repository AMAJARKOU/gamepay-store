import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Game } from "../../types/game";
import { GameCatalog } from "./GameCatalog";
import { useGames } from "./useGames";
import type { UseGamesResult } from "./useGames";

vi.mock("./useGames", () => ({
  useGames: vi.fn(),
}));

const mockedUseGames = vi.mocked(useGames);
const retryMock = vi.fn();

const residentEvil: Game = {
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

const batman: Game = {
  id: "deal-2",
  gameId: "game-2",
  title: "Batman: Arkham City",
  price: 9.99,
  originalPrice: 29.99,
  discountPercentage: 67,
  metacriticScore: 91,
  steamRatingPercent: 95,
  imageUrl: "https://example.com/batman.jpg",
};

function mockGamesState(state: UseGamesResult["state"]): void {
  mockedUseGames.mockReturnValue({
    state,
    retry: retryMock,
  });
}

describe("GameCatalog", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();

    mockGamesState({
      status: "loading",
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("displays the catalog heading, search field and loading state", () => {
    render(<GameCatalog />);

    expect(
      screen.getByRole("heading", {
        name: "Game deals",
      }),
    ).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/search games/i);

    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "search");

    expect(screen.getByText("Loading game deals...")).toBeInTheDocument();

    expect(mockedUseGames).toHaveBeenCalledWith({
      search: "",
    });
  });

  it("displays the games when the request succeeds", () => {
    mockGamesState({
      status: "success",
      data: [residentEvil, batman],
    });

    render(<GameCatalog />);

    expect(screen.getByText("2 deals found")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Resident Evil",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Batman: Arkham City",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", {
        name: "Add to cart",
      }),
    ).toHaveLength(2);
  });

  it("displays the empty state when no game is found", () => {
    mockGamesState({
      status: "success",
      data: [],
    });

    render(<GameCatalog />);

    expect(
      screen.getByRole("heading", {
        name: "No games found",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No deal matches your search."),
    ).toBeInTheDocument();
  });

  it("displays an error and retries the request", () => {
    mockGamesState({
      status: "error",
      message: "Network unavailable",
    });

    render(<GameCatalog />);

    expect(
      screen.getByRole("heading", {
        name: "Unable to load games",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Network unavailable")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Try again",
      }),
    );

    expect(retryMock).toHaveBeenCalledTimes(1);
  });

  it("waits 400 milliseconds before sending the search", () => {
    vi.useFakeTimers();

    render(<GameCatalog />);

    const searchInput = screen.getByLabelText(/search games/i);

    fireEvent.change(searchInput, {
      target: {
        value: "batman",
      },
    });

    expect(searchInput).toHaveValue("batman");

    expect(
      screen.getByText("Waiting for you to finish typing..."),
    ).toBeInTheDocument();

    // La valeur debounced est encore vide.
    expect(mockedUseGames).toHaveBeenLastCalledWith({
      search: "",
    });

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(mockedUseGames).toHaveBeenLastCalledWith({
      search: "",
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Après 400 ms, debouncedSearch devient "batman".
    expect(mockedUseGames).toHaveBeenLastCalledWith({
      search: "batman",
    });

    expect(screen.getByText('Searching for "batman"...')).toBeInTheDocument();

    expect(
      screen.queryByText("Waiting for you to finish typing..."),
    ).not.toBeInTheDocument();
  });

  it("clears the search field when the user clicks Clear", () => {
    render(<GameCatalog />);

    const searchInput = screen.getByLabelText(/search games/i);

    fireEvent.change(searchInput, {
      target: {
        value: "resident evil",
      },
    });

    expect(searchInput).toHaveValue("resident evil");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear",
      }),
    );

    expect(searchInput).toHaveValue("");

    expect(
      screen.queryByRole("button", {
        name: "Clear",
      }),
    ).not.toBeInTheDocument();
  });
});

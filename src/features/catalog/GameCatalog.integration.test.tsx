import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  batmanDeal,
  cheapSharkDeals,
  residentEvilDeal,
} from "../../mocks/data/deals";
import { CHEAPSHARK_DEALS_URL } from "../../mocks/handlers";
import { server } from "../../mocks/server";
import { GameCatalog } from "./GameCatalog";

describe("GameCatalog integration", () => {
  it("loads, maps and displays deals returned by the API", async () => {
    render(<GameCatalog />);

    // État initial produit par le vrai useGames.
    expect(screen.getByText("Loading game deals...")).toBeInTheDocument();

    // Attend la vraie chaîne fetch → MSW → mapping → React.
    expect(await screen.findByText("2 deals found")).toBeInTheDocument();

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

    // Vérifie indirectement la transformation des chaînes du DTO.
    expect(screen.getByText("Discount: 70%")).toBeInTheDocument();

    expect(screen.getByText("Metacritic: 85")).toBeInTheDocument();
  });

  it("displays an error when the API returns an HTTP error", async () => {
    server.use(
      http.get(CHEAPSHARK_DEALS_URL, () => {
        return HttpResponse.json(
          {
            message: "Internal server error",
          },
          {
            status: 500,
          },
        );
      }),
    );

    render(<GameCatalog />);

    expect(
      await screen.findByRole("heading", {
        name: "Unable to load games",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Unable to load games. HTTP status: 500"),
    ).toBeInTheDocument();
  });

  it("retries the request and displays the games after a failure", async () => {
    let requestCount = 0;

    server.use(
      http.get(CHEAPSHARK_DEALS_URL, () => {
        requestCount += 1;

        if (requestCount === 1) {
          return HttpResponse.json(
            {
              message: "Temporary failure",
            },
            {
              status: 503,
            },
          );
        }

        return HttpResponse.json([residentEvilDeal]);
      }),
    );

    render(<GameCatalog />);

    expect(
      await screen.findByRole("heading", {
        name: "Unable to load games",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Try again",
      }),
    );

    expect(await screen.findByText("1 deal found")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Resident Evil",
      }),
    ).toBeInTheDocument();

    expect(requestCount).toBe(2);
  });

  it("sends the debounced search to the API", async () => {
    const receivedSearches: string[] = [];

    server.use(
      http.get(CHEAPSHARK_DEALS_URL, ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get("title") ?? "";

        receivedSearches.push(search);

        if (search.toLowerCase() === "batman") {
          return HttpResponse.json([batmanDeal]);
        }

        return HttpResponse.json(cheapSharkDeals);
      }),
    );

    render(<GameCatalog />);

    // Attend la requête initiale.
    expect(await screen.findByText("2 deals found")).toBeInTheDocument();

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

    // Le vrai debounce de 400 ms est utilisé.
    await waitFor(
      () => {
        expect(receivedSearches.at(-1)).toBe("batman");
      },
      {
        timeout: 1_500,
      },
    );

    expect(
      await screen.findByText('1 deal found for "batman"'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Batman: Arkham City",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Resident Evil",
      }),
    ).not.toBeInTheDocument();
  });
});

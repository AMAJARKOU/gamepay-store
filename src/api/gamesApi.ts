import type { CheapSharkDealDto, Game } from "../types/game";

const BASE_URL = "https://www.cheapshark.com/api/1.0";

export interface GetGamesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

function toOptionalNumber(value: string): number | null {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && value ? parsedValue : null;
}

function mapDealToGame(deal: CheapSharkDealDto): Game {
  return {
    id: deal.dealID,
    gameId: deal.gameID,
    title: deal.title,
    price: Number(deal.salePrice),
    originalPrice: Number(deal.normalPrice),
    discountPercentage: Number(deal.savings),
    metacriticScore: toOptionalNumber(deal.metacriticScore),
    steamRatingPercent: toOptionalNumber(deal.steamRatingPercent),
    imageUrl: deal.thumb,
  };
}

export async function getGames({
  page = 0,
  pageSize = 10,
  search,
  signal,
}: GetGamesParams): Promise<Game[]> {
  const params = new URLSearchParams({
    pageNumber: String(page),
    pageSize: String(pageSize),
  });

  if (search?.trim()) {
    params.set("title", search.trim());
  }

  const response = await fetch(`${BASE_URL}/deals?${params}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Unable to load games. HTTP status: ${response.status}`);
  }

  const deals = (await response.json()) as CheapSharkDealDto[];

  return deals.map(mapDealToGame);
}

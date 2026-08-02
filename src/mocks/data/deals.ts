import type { CheapSharkDealDto } from "../../types/game";

export const residentEvilDeal: CheapSharkDealDto = {
  dealID: "deal-1",
  gameID: "game-1",
  title: "Resident Evil",
  salePrice: "12.00",
  normalPrice: "40.00",
  savings: "70.00",
  metacriticScore: "85",
  steamRatingPercent: "92",
  thumb: "https://example.com/resident-evil.jpg",
};

export const batmanDeal: CheapSharkDealDto = {
  dealID: "deal-2",
  gameID: "game-2",
  title: "Batman: Arkham City",
  salePrice: "9.99",
  normalPrice: "29.99",
  savings: "66.69",
  metacriticScore: "91",
  steamRatingPercent: "95",
  thumb: "https://example.com/batman.jpg",
};

export const cheapSharkDeals: CheapSharkDealDto[] = [
  residentEvilDeal,
  batmanDeal,
];

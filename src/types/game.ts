export interface CheapSharkDealDto {
  dealID: string;
  gameID: string;
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  metacriticScore: string;
  steamRatingPercent: string;
  thumb: string;
}

export interface Game {
  id: string;
  gameId: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  metacriticScore: number | null;
  steamRatingPercent: number | null;
  imageUrl: string;
}

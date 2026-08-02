import type { Game } from "../../types/game";

interface GameCardProps {
  game: Game;
}

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export function GameCard({ game }: GameCardProps) {
  return (
    <article className="game-card">
      <img
        className="game-card__image"
        src={game.imageUrl}
        alt={`Cover of ${game.title}`}
        loading="lazy"
      />

      <div className="game-card__content">
        <h2 className="game-card__title">{game.title}</h2>

        <div className="game-card__prices">
          <strong>{currencyFormatter.format(game.price)}</strong>

          {game.originalPrice > game.price && (
            <del>{currencyFormatter.format(game.originalPrice)}</del>
          )}
        </div>

        <p>Discount: {Math.round(game.discountPercentage)}%</p>

        {game.metacriticScore !== null && (
          <p>Metacritic: {game.metacriticScore}</p>
        )}

        <button type="button">Add to cart</button>
      </div>
    </article>
  );
}

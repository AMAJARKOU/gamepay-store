import { GameCard } from "./GameCard";
import { useGames } from "./useGames";

export function GameCatalog() {
  const { state, retry } = useGames();

  switch (state.status) {
    case "idle":
    case "loading":
      return (
        <section aria-live="polite">
          <p>Loading game deals...</p>
        </section>
      );

    case "error":
      return (
        <section role="alert">
          <h2>Unable to load games</h2>
          <p>{state.message}</p>

          <button type="button" onClick={retry}>
            Try again
          </button>
        </section>
      );

    case "success":
      if (state.data.length === 0) {
        return (
          <section>
            <p>No games were found.</p>
          </section>
        );
      }

      return (
        <section>
          <p>{state.data.length} deals found</p>

          <div className="game-grid">
            {state.data.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      );
  }
}

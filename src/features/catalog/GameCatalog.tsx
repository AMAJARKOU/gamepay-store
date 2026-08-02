import { useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { GameCard } from "./GameCard";
import { useGames } from "./useGames";

export function GameCatalog() {
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 400);

  const { state, retry } = useGames({
    search: debouncedSearch,
  });

  const isWaitingForDebounce = search !== debouncedSearch;

  return (
    <section aria-labelledby="catalog-title">
      <div className="catalog-header">
        <div>
          <h2 id="catalog-title">Game deals</h2>
          <p>Search the current offers available on CheapShark.</p>
        </div>

        <form
          className="search-form"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="game-search">Search games</label>

          <div className="search-form__controls">
            <input
              id="game-search"
              type="search"
              value={search}
              placeholder="Example: Batman"
              autoComplete="off"
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />

            {search !== "" && (
              <button type="button" onClick={() => setSearch("")}>
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="search-status" aria-live="polite" aria-atomic="true">
        {isWaitingForDebounce && <p>Waiting for you to finish typing...</p>}
      </div>

      <CatalogContent state={state} retry={retry} search={debouncedSearch} />
    </section>
  );
}

interface CatalogContentProps {
  state: ReturnType<typeof useGames>["state"];
  retry: () => void;
  search: string;
}

function CatalogContent({ state, retry, search }: CatalogContentProps) {
  switch (state.status) {
    case "idle":
    case "loading":
      return (
        <div aria-live="polite">
          <p>
            {search ? `Searching for "${search}"...` : "Loading game deals..."}
          </p>
        </div>
      );

    case "error":
      return (
        <div role="alert">
          <h3>Unable to load games</h3>
          <p>{state.message}</p>

          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      );

    case "success":
      if (state.data.length === 0) {
        return (
          <div className="empty-state">
            <h3>No games found</h3>

            <p>
              No deal matches
              {search ? ` "${search}"` : " your search"}.
            </p>
          </div>
        );
      }

      return (
        <>
          <p>
            {state.data.length} {state.data.length === 1 ? "deal" : "deals"}{" "}
            found
            {search ? ` for "${search}"` : ""}
          </p>

          <div className="game-grid">
            {state.data.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      );
  }
}

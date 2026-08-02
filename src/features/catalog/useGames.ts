import { useCallback, useEffect, useState } from "react";
import { getGames } from "../../api/gamesApi";
import type { AsyncState } from "../../types/api";
import type { Game } from "../../types/game";

interface UseGamesOptions {
  search?: string;
}

export interface UseGamesResult {
  state: AsyncState<Game[]>;
  retry: () => void;
}

export function useGames({
  search = "",
}: UseGamesOptions = {}): UseGamesResult {
  const [state, setState] = useState<AsyncState<Game[]>>({
    status: "idle",
  });

  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGames(): Promise<void> {
      setState({ status: "loading" });

      try {
        const games = await getGames({
          pageSize: 12,
          search,
          signal: controller.signal,
        });

        setState({
          status: "success",
          data: games,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";

        setState({
          status: "error",
          message,
        });
      }
    }

    void loadGames();

    return () => {
      controller.abort();
    };
  }, [requestVersion, search]);

  return {
    state,
    retry,
  };
}

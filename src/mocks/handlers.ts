import { delay, http, HttpResponse } from "msw";

import { cheapSharkDeals } from "./data/deals";

export const CHEAPSHARK_DEALS_URL = "https://www.cheapshark.com/api/1.0/deals";

export const handlers = [
  http.get(CHEAPSHARK_DEALS_URL, async () => {
    // Petit délai pour rendre l'état loading observable
    await delay(25);

    return HttpResponse.json(cheapSharkDeals);
  }),
];

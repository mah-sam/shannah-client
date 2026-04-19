/**
 * ETA estimation — strategy pattern.
 *
 * Default provider: `HeuristicEtaProvider` (pure math based on prep time and
 * distance). When we want real-time traffic-aware ETAs we implement
 * `GoogleDistanceMatrixProvider` (or any other) and swap it in via a single
 * import — callers never change.
 *
 * Keeping the interface synchronous on purpose: all current consumers render
 * ETA inline while laying out a list, and we don't want a network call to
 * block the first paint. A future async provider should wrap an in-memory
 * cache and return the cached value synchronously; background-refresh on a
 * schedule. That keeps the caller contract stable.
 */

import type { LatLng } from "../utils/distance";
import { computeEtaRange, etaMidpoint, formatEtaRange } from "../utils/eta";
import type { EtaRange } from "../utils/eta";

export type { EtaRange };

export interface EtaEstimateInput {
  prepMinutes: number | null | undefined;
  distanceKm: number | null | undefined;
  // Optional richer context for future providers (traffic, turn-by-turn):
  origin?: LatLng | null;
  destination?: LatLng | null;
}

export interface EtaProvider {
  id(): string;
  estimate(input: EtaEstimateInput): EtaRange | null;
}

class HeuristicEtaProvider implements EtaProvider {
  id() {
    return "heuristic";
  }

  estimate({ prepMinutes, distanceKm }: EtaEstimateInput): EtaRange | null {
    return computeEtaRange(prepMinutes, distanceKm ?? 0);
  }
}

// Bind the default here; swap to Google later by replacing this line.
export const etaProvider: EtaProvider = new HeuristicEtaProvider();

/** Convenience helpers re-exported so callers don't need two imports. */
export const formatEta = formatEtaRange;
export const etaSortKey = etaMidpoint;

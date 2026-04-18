import { useMemo } from "react";
import { useGlobal } from "../context/GlobalContext";
import { LatLng } from "../utils/distance";

/**
 * Returns the best reference point for distance/ETA calculations:
 *   1. Selected delivery address (user actively picked "deliver here")
 *   2. Current user GPS location (fallback during discovery)
 *   3. null — no coordinate known
 */
export function useDeliveryReference(): LatLng | null {
  const { deliveryAddress, userLocation } = useGlobal();

  return useMemo(() => {
    const addrLat = Number(deliveryAddress?.latitude);
    const addrLng = Number(deliveryAddress?.longitude);
    if (isFinite(addrLat) && isFinite(addrLng) && addrLat !== 0 && addrLng !== 0) {
      return { latitude: addrLat, longitude: addrLng };
    }
    if (userLocation) return userLocation;
    return null;
  }, [deliveryAddress, userLocation]);
}

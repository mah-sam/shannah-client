import { getItemAsync } from "expo-secure-store";
import { useState } from "react";

export default function useAuth() {
  const [token, setToken] = useState(null);

  (async () => {
    const t = await getItemAsync("token");
    setToken(t);
  })();

  return { token };
}

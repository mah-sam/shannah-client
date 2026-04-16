import { getItemAsync } from "expo-secure-store";
import { useEffect, useState } from "react";

export default function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getItemAsync("token").then((t) => setToken(t));
  }, []);

  return { token };
}

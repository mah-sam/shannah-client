import { getItemAsync } from "expo-secure-store";
import { useState } from "react";

export default function useAuth() {
  const [signedIn, setSignedIn] = useState(false);
  const [token, setToken] = useState();

  (async () => {
    const t = await getItemAsync("token");
    setToken(t);
    t !== null && setSignedIn(true);
  })();

  return { token, signedIn };
}

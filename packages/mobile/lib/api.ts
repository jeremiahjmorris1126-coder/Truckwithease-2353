import { hc } from "hono/client";
import Constants from "expo-constants";
import type { AppType } from "@template/web";

const baseUrl =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL;

let accessToken: string | null = null;

/** Set the managed-auth bearer token after mobile sign-in; never persist it in AsyncStorage. */
export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** Removes the in-memory credential on sign-out or when an API call returns 401. */
export function clearAccessToken() {
  accessToken = null;
}

const client = hc<AppType>(baseUrl!, {
  fetch: async (input, init) => {
    const headers = new Headers(init?.headers);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    const response = await fetch(input, { ...init, headers });
    if (response.status === 401) clearAccessToken();
    return response;
  },
});

export const api = client.api;

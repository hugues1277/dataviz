import { betterAuthMock } from "./betterAuthMock";
import { betterAuthWebClient } from "./betterAuthWebClient";

const isTauri = import.meta.env.VITE_IS_TAURI_APP === 'true';

export const { useSession, signIn, signOut } = isTauri ? betterAuthMock : betterAuthWebClient;

export const isDisabledAuth = isTauri;
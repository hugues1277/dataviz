import { betterAuthMock } from "./betterAuthMock";
import { betterAuthWebClient } from "./betterAuthWebClient";
import { isTauri } from '../../../shared/utils/platform';

export const { useSession, signIn, signOut } = isTauri ? betterAuthMock : betterAuthWebClient;

export const isDisabledAuth = isTauri;
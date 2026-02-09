import { betterAuthProvider } from '../../providers/betterAuthProvider';

export interface BetterAuthProxyInput {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body?: string;
}

export interface BetterAuthProxyOutput {
  status: number;
  headers: Map<string, string>;
  body: string | null;
}

/**
 * Use case: Proxy pour Better Auth
 * Transforme une requête Node.js en Request Web API et appelle Better Auth
 */
export const betterAuthProxyUseCase = {
  execute: async (input: BetterAuthProxyInput): Promise<BetterAuthProxyOutput> => {

    // Le middleware Vite retire le préfixe '/api/auth' de req.url
    // Donc req.url sera '/sign-in/email' au lieu de '/api/auth/sign-in/email'
    // Better Auth a besoin du chemin complet avec le préfixe /api/auth
    const originalUrl = input.url || '';
    const fullPath = originalUrl.startsWith('/api/auth')
      ? originalUrl
      : `/api/auth${originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl}`;

    // Construire l'URL complète
    const protocol = input.headers['x-forwarded-proto'] || 'http';
    const host = input.headers.host || 'localhost:3001';
    const fullUrl = `${protocol}://${host}${fullPath}`;


    // Créer une Request Web API pour Better Auth
    const webRequest = new Request(fullUrl, {
      method: input.method,
      headers: input.headers as HeadersInit,
      body: input.body,
    });

    // exclude signup/email from better auth proxy
    if (fullPath.includes('/signup/email')) {
      return {
        status: 404,
        headers: new Map<string, string>(),
        body: null,
      };
    }

    // Appeler Better Auth handler
    const response = await betterAuthProvider.handler(webRequest);

    // Convertir les headers en Map
    const headers = new Map<string, string>();
    response.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    // Lire le body de la réponse
    let body: string | null = null;
    if (response.body) {
      body = await response.text();
    }

    return {
      status: response.status,
      headers,
      body,
    };
  },
};


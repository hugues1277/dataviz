import { NextRequest, NextResponse } from 'next/server';
import { betterAuthProxyUseCase } from '../../../../src/api/core/useCases/betterAuthProxyUseCase';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: /api/auth/* (catch-all)
 * Proxy pour tous les endpoints Better Auth (sign-in, sign-up, get-session, etc.)
 * Basée sur authApiPlugin.ts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleBetterAuthRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleBetterAuthRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleBetterAuthRequest(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleBetterAuthRequest(request, params);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

async function handleBetterAuthRequest(
  request: NextRequest,
  params: { slug: string[] }
) {
  try {
    // Construire le chemin à partir du slug (sans le préfixe /api/auth)
    // Le betterAuthProxyUseCase ajoutera automatiquement le préfixe /api/auth
    const slugPath = params.slug ? `/${params.slug.join('/')}` : '';
    
    // Ajouter les query params si présents
    const searchParams = request.nextUrl.searchParams.toString();
    const url = searchParams ? `${slugPath}?${searchParams}` : slugPath;

    // Lire le body si présent
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
      } catch {
        // Pas de body, c'est OK
      }
    }

    // Convertir les headers Next.js en format attendu
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // S'assurer que les headers host et protocol sont corrects pour Better Auth
    if (!headers.host) {
      headers.host = request.nextUrl.host;
    }
    if (!headers['x-forwarded-proto']) {
      headers['x-forwarded-proto'] = request.nextUrl.protocol.replace(':', '');
    }

    // Appeler le use case Better Auth
    const result = await betterAuthProxyUseCase.execute({
      method: request.method,
      url,
      headers,
      body,
    });

    // Créer la réponse avec les headers de Better Auth
    const response = new NextResponse(result.body, {
      status: result.status,
    });

    // Copier les headers de la réponse (notamment les cookies de session)
    result.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    // Ajouter les headers CORS
    const origin = request.headers.get('origin') || '*';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type, cookie');

    return response;
  } catch (error: unknown) {
    logger.error('betterAuthProxy API route', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

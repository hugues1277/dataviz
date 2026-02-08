import type { IncomingMessage, ServerResponse } from 'http';

// Pour que les cookies fonctionnent, on ne peut pas utiliser '*' avec credentials
// On doit spécifier l'origine exacte
const getAllowedOrigin = (req?: IncomingMessage) => {
  const origin = req?.headers.origin || 'http://localhost:3001';
  // En développement, autoriser localhost sur n'importe quel port
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return origin;
  }
  // En production, autoriser votre domaine
  return process.env.PRODUCTION_URL || 'http://localhost:3001';
};

export const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cookie',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true', // Important pour les cookies
};

/**
 * Lit le body d'une requête HTTP
 */
export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/**
 * Envoie une réponse JSON
 */
export function sendJson(res: ServerResponse, status: number, data: any, req?: IncomingMessage) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin(req));
  res.setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials']);
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

/**
 * Gère les headers CORS
 */
export function handleCORS(res: ServerResponse, req?: IncomingMessage) {
  // res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin(req));
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials']);
}


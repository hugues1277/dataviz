import { pgLiteDatabaseProvider } from "./pgLiteDatabaseProvider";
// import { databaseProvider as pgDatabaseProvider } from "./pgDatabaseProvider";

const isTauri = true;// import.meta.env.VITE_IS_TAURI_APP === 'true';

export const databaseProvider = isTauri ? pgLiteDatabaseProvider : pgLiteDatabaseProvider;
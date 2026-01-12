import { DBConnection } from "@/src/shared/types/types";
import ObjectRepositoryInterface from "./objectRepositoryInterface";

class ConnectionRepositoryInterface extends ObjectRepositoryInterface<DBConnection> {

    async getAll({ fullConfig = false, decrypt = false }: { fullConfig?: boolean, decrypt?: boolean } = {}): Promise<DBConnection[]> {
        throw new Error('Not implemented');
    }

    async get(id: string, { decrypt = true }: { decrypt?: boolean } = {}): Promise<DBConnection> {
        throw new Error('Not implemented');
    }
}

export default ConnectionRepositoryInterface;
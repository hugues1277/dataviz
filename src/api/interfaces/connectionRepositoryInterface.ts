import type { DBConnection } from "@/src/shared/types";
import ObjectRepositoryInterface from "@/src/api/interfaces/objectRepositoryInterface";

abstract class ConnectionRepositoryInterface extends ObjectRepositoryInterface<DBConnection> {
  override async getAll(
    _options: { fullConfig?: boolean; decrypt?: boolean } = {}
  ): Promise<DBConnection[]> {
    throw new Error("Not implemented");
  }

  override async get(
    _id: string,
    _options?: { decrypt?: boolean }
  ): Promise<DBConnection | null> {
    throw new Error("Not implemented");
  }
}

export default ConnectionRepositoryInterface;
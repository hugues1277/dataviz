/**
 * Interface de base pour les repositories CRUD.
 * Les méthodes par défaut lèvent "Not implemented" - les implémentations doivent les surcharger.
 */
abstract class ObjectRepositoryInterface<T> {
  async get(_id: string): Promise<T | null> {
    throw new Error("Not implemented");
  }

  async getAll(): Promise<T[]> {
    throw new Error("Not implemented");
  }

  async create(_object: T): Promise<void> {
    throw new Error("Not implemented");
  }

  async createMany(_objects: T[]): Promise<void> {
    throw new Error("Not implemented");
  }

  async update(_object: T): Promise<void> {
    throw new Error("Not implemented");
  }

  async delete(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async clear(): Promise<void> {
    throw new Error("Not implemented");
  }
}

export default ObjectRepositoryInterface;
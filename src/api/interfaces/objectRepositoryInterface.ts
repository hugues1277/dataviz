class IObjectRepository<T> {

    async get(id: string): Promise<T | null> {
        throw new Error('Not implemented');
    }

    async getAll(): Promise<T[]> {
        throw new Error('Not implemented');
    }

    async create(object: T): Promise<void> {
        throw new Error('Not implemented');
    }

    async createMany(objects: T[]): Promise<void> {
        throw new Error('Not implemented');
    }

    async update(object: T): Promise<void> {
        throw new Error('Not implemented');
    }

    async delete(id: string): Promise<void> {
        throw new Error('Not implemented');
    }

    async clear(): Promise<void> {
        throw new Error('Not implemented');
    }
}

export default IObjectRepository;
import { Cache, Store } from "@zkchainhub/shared";

export type Milliseconds = number;

interface CacheItem<T> {
    value: T;
    expiresAt: number | null;
}

// FIXME: This is a simple in-memory store implementation for development purposes.
export class InMemoryStore implements Store {
    private storage: Map<string, CacheItem<unknown>> = new Map();

    async get<T>(key: string): Promise<T | undefined> {
        const item = this.storage.get(key);
        if (!item) return undefined;
        if (item.expiresAt && item.expiresAt < Date.now()) {
            this.storage.delete(key);
            return undefined;
        }
        return item.value as T;
    }

    async set<T>(key: string, data: T, ttl?: Milliseconds): Promise<void> {
        const expiresAt = ttl ? Date.now() + ttl : null;
        this.storage.set(key, { value: data, expiresAt });
    }

    async del(key: string): Promise<void> {
        this.storage.delete(key);
    }

    async reset(): Promise<void> {
        this.storage.clear();
    }

    async mset(arguments_: Array<[string, unknown]>, ttl?: Milliseconds): Promise<void> {
        const expiresAt = ttl ? Date.now() + ttl : null;
        for (const [key, value] of arguments_) {
            this.storage.set(key, { value, expiresAt });
        }
    }

    async mget(...arguments_: string[]): Promise<unknown[]> {
        return Promise.all(arguments_.map((key) => this.get(key)));
    }

    async mdel(...arguments_: string[]): Promise<void> {
        arguments_.forEach((key) => this.storage.delete(key));
    }

    async keys(pattern?: string): Promise<string[]> {
        if (!pattern) return Array.from(this.storage.keys());
        const regex = new RegExp(pattern.replace("*", ".*"));
        return Array.from(this.storage.keys()).filter((key) => regex.test(key));
    }

    async ttl(key: string): Promise<number> {
        const item = this.storage.get(key);
        if (!item || !item.expiresAt) return -1;
        const remainingTime = item.expiresAt - Date.now();
        return remainingTime > 0 ? remainingTime : -1;
    }
}

export class InMemoryCache implements Cache<InMemoryStore> {
    store: InMemoryStore;

    constructor() {
        this.store = new InMemoryStore();
    }

    async set(key: string, value: unknown, ttl?: Milliseconds): Promise<void> {
        return this.store.set(key, value, ttl);
    }

    async get<T>(key: string): Promise<T | undefined> {
        return this.store.get<T>(key);
    }

    async del(key: string): Promise<void> {
        return this.store.del(key);
    }

    async reset(): Promise<void> {
        return this.store.reset();
    }
}

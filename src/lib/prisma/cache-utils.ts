/**
 * Cache Utilities for Prisma Accelerate
 * 
 * This file contains utilities and documentation for managing cache strategies
 * across different service operations.
 */

// Cache utilities for Prisma Accelerate - no direct prisma import needed

/**
 * Cache Strategy Guidelines:
 * 
 * 1. **Public Data (long TTL)**: Service categories, public service lists
 *    - TTL: 30 minutes, SWR: 1 hour
 * 
 * 2. **Frequently Read, Rarely Updated**: Service details, user profiles
 *    - TTL: 10 minutes, SWR: 30 minutes
 * 
 * 3. **Moderately Dynamic**: Service lists, device lists, parts lists
 *    - TTL: 5 minutes, SWR: 10 minutes
 * 
 * 4. **Highly Dynamic**: User lists, stock status, repair status
 *    - TTL: 3 minutes, SWR: 6 minutes
 * 
 * 5. **Real-time Critical**: Part movements, recent activities
 *    - TTL: 2 minutes, SWR: 4 minutes
 * 
 * 6. **Statistics**: Various based on update frequency
 *    - Stable stats: 10 minutes TTL
 *    - Dynamic stats: 5 minutes TTL
 */

export const CACHE_STRATEGIES = {
    // Service-related caching
    SERVICE_LIST: {
        ttl: 300,  // 5 minutes
        swr: 600,  // 10 minutes
        tags: ['services', 'service_list']
    },
    SERVICE_DETAILS: {
        ttl: 600,  // 10 minutes
        swr: 1800, // 30 minutes
        tags: ['services']
    },
    SERVICE_CATEGORIES_PUBLIC: {
        ttl: 1800, // 30 minutes
        swr: 3600, // 1 hour
        tags: ['service_categories', 'public_categories']
    },
    SERVICE_CATEGORIES_ADMIN: {
        ttl: 600,  // 10 minutes
        swr: 1200, // 20 minutes
        tags: ['service_categories', 'admin_categories']
    },
    SERVICE_STATS: {
        ttl: 600,  // 10 minutes
        swr: 1200, // 20 minutes
        tags: ['service_stats']
    },

    // User-related caching
    USER_LIST: {
        ttl: 180,  // 3 minutes
        swr: 360,  // 6 minutes
        tags: ['users', 'user_list']
    },
    USER_PROFILE: {
        ttl: 300,  // 5 minutes
        swr: 600,  // 10 minutes
        tags: ['users', 'user_profiles']
    },
    USER_STATS: {
        ttl: 600,  // 10 minutes
        swr: 1200, // 20 minutes
        tags: ['user_stats']
    },

    // Inventory-related caching
    DEVICE_LIST: {
        ttl: 300,  // 5 minutes
        swr: 600,  // 10 minutes
        tags: ['devices', 'device_list']
    },
    DEVICE_DETAILS: {
        ttl: 600,  // 10 minutes
        swr: 1200, // 20 minutes
        tags: ['devices', 'device_details']
    },
    PART_LIST: {
        ttl: 240,  // 4 minutes
        swr: 480,  // 8 minutes
        tags: ['parts', 'part_list']
    },
    PART_DETAILS: {
        ttl: 480,  // 8 minutes
        swr: 960,  // 16 minutes
        tags: ['parts', 'part_details']
    },
    MOVEMENTS: {
        ttl: 120,  // 2 minutes
        swr: 240,  // 4 minutes
        tags: ['movements']
    },
    INVENTORY_STATS: {
        ttl: 600,  // 10 minutes for stable stats
        swr: 1200, // 20 minutes
        tags: ['inventory_stats']
    },
    INVENTORY_DYNAMIC_STATS: {
        ttl: 300,  // 5 minutes for dynamic stats
        swr: 600,  // 10 minutes
        tags: ['inventory_stats']
    },
    INVENTORY_REALTIME_STATS: {
        ttl: 180,  // 3 minutes for real-time stats
        swr: 360,  // 6 minutes
        tags: ['inventory_stats']
    }
} as const

/**
 * Cache invalidation utilities
 * 
 * Use these functions to invalidate cache when data is modified
 */
export class CacheInvalidation {
    /**
     * Invalidate service-related caches
     */
    static async invalidateServices() {
        // Note: Prisma Accelerate doesn't have a direct invalidation API
        // Cache invalidation happens automatically based on TTL and SWR
        // For manual invalidation, you would need to use Prisma Pulse or 
        // implement your own cache invalidation strategy
        console.log('🗑️ Service caches will be invalidated based on TTL/SWR strategy')
    }

    /**
     * Invalidate user-related caches
     */
    static async invalidateUsers() {
        console.log('🗑️ User caches will be invalidated based on TTL/SWR strategy')
    }

    /**
     * Invalidate inventory-related caches
     */
    static async invalidateInventory() {
        console.log('🗑️ Inventory caches will be invalidated based on TTL/SWR strategy')
    }

    /**
     * Invalidate specific entity cache
     */
    static async invalidateEntity(type: 'service' | 'user' | 'device' | 'part', id: string) {
        console.log(`🗑️ ${type}-${id} cache will be invalidated based on TTL/SWR strategy`)
    }
}

/**
 * Cache monitoring utilities
 */
export class CacheMonitoring {
    /**
     * Log cache hit/miss information
     */
    static logCacheMetrics(operation: string, cacheStrategy: { ttl: number; swr: number; tags: string[] }) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Cache strategy for ${operation}:`, {
                ttl: `${cacheStrategy.ttl}s`,
                swr: `${cacheStrategy.swr}s`,
                tags: cacheStrategy.tags
            })
        }
    }
}

/**
 * Dynamic cache strategy builder
 */
export function buildCacheStrategy(
    baseStrategy: typeof CACHE_STRATEGIES[keyof typeof CACHE_STRATEGIES],
    additionalTags: string[] = []
) {
    return {
        ...baseStrategy,
        tags: [...baseStrategy.tags, ...additionalTags]
    }
}
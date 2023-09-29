// imports
import IRateLimiter from "./IRateLimiter";
import FixedWindowInMemoryRateLimiter from "./FixedWindowInMemoryRateLimiter";
import FixedWindowMemcachedRateLimiter from "./FixedWindowMemcachedRateLimiter";
import SlidingWindowMinHeapRateLimiter from "./SlidingWindowMinHeapRateLimiter";
import SlidingWindowListRateLimiter from "./SlidingWindowListRateLimiter";
import SlidingWindowRedisListRateLimiter from "./SlidingWindowRedisListRateLimiter";
import SlidingWindowRedisSortedSetsRateLimiter from "./SlidingWindowRedisSortedSetsRateLimiter";

/**
 * RateLimiterFactory is a factory class that creates a new IRateLimiter.
 */
class RateLimiterFactory {

    /**
     * creates a new IRateLimiter with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    private static createRateLimiterInstance(threshold: number, timeInterval: number) : IRateLimiter {
        // return new FixedWindowInMemoryRateLimiter(threshold, timeInterval);
        // return new FixedWindowMemcachedRateLimiter(threshold, timeInterval);
        // return new SlidingWindowMinHeapRateLimiter(threshold, timeInterval);
        // return new SlidingWindowListRateLimiter(threshold, timeInterval);
        // return new SlidingWindowRedisListRateLimiter(threshold, timeInterval);
        return new SlidingWindowRedisSortedSetsRateLimiter(threshold, timeInterval)
    }
    /**
     * Creates a new IRateLimiter with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    static createRateLimiter(threshold: number, timeInterval: number) : IRateLimiter {
        // create a new rate-limiter
        const rateLimiter : IRateLimiter = RateLimiterFactory.createRateLimiterInstance(threshold, timeInterval);

        // when process is terminated, destroy the rate limiter
        // ignore coverage
        // istanbul ignore next
        process.on('SIGINT', () => {
            rateLimiter.destroy();
            // istanbul ignore next
            process.exit();
        });

        // return the rate limiter
        return rateLimiter;
    }
}

// export the class
export default RateLimiterFactory;

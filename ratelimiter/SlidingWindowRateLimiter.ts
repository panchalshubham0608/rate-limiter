// imports
import RateLimiterImpl from "./RateLimiterImpl";

/**
 * SlidingWindowRateLimiter is an abstract class that implements the RateLimiter interface.
 * It provides default implementation for destroy and reset methods.
 */
abstract class SlidingWindowRateLimiter extends RateLimiterImpl {

    /**
     * Initializes a new SlidingWindowRateLimiter with the given threshold and time interval.
     */
    constructor(threshold: number, timeInterval: number) {
        // call the super constructor
        super(threshold, timeInterval);
    }

    /**
     * Destroys the rate limiter.
     */
    destroy(): void {
        // do nothing
    }

    /**
     * Resets the rate limiter.
     */
    reset(): void {
        // do nothing - needed only for Fixed window rate-limiter testing
    }
}

// export the class
export default SlidingWindowRateLimiter;

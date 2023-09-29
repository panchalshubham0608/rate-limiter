// imports
import IRateLimiter from "./IRateLimiter";

/**
 * RateLimiterImpl is an abstract class that implements the IRateLimiter interface.
 * It provides the threshold and time interval for the rate limiter.
 */
abstract class RateLimiterImpl implements IRateLimiter {
    protected threshold: number;
    protected timeInterval: number;

    /**
     * Initializes a new RateLimiterImpl with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    constructor(threshold: number, timeInterval: number) {
        this.threshold = threshold;
        this.timeInterval = timeInterval;
    }

    /**
     * Returns the threshold for the rate limiter
     * i.e. the number of times a user is allowed to perform the action in a given time interval
     * @return the threshold
     */
    getThreshold(): number {
        return this.threshold;
    }

    /**
     * Returns the time interval for the rate limiter
     * i.e. the time interval in which the threshold is applied
     * @return the time interval
     */
    getTimeInterval(): number {
        return this.timeInterval;
    }

    /**
     * Checks if the user is allowed to perform the action or not.
     */
    abstract isAllowed(userId: string): Promise<boolean>;

    /**
     * When the FixedWindowMemcachedRateLimiter is destroyed, it should stop clearing the request count every time interval.
     */
    abstract destroy() : void;

    /**
     * Resets the rate-limiter.
     */
    abstract reset() : void;
}

// export the class
export default RateLimiterImpl;

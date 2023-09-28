// imports
import IRateLimiter from './IRateLimiter';

/**
 * FixedWindowInMemoryRateLimiter is a class that implements the RateLimiter interface.
 * It uses an in-memory data structure to keep track of the number of requests made by a user.
 * It clears the request count every time interval.
 * If the request count exceeds the threshold, then the user is not allowed to perform the action.
 * If the request count does not exceed the threshold, then the user is allowed to perform the action.
 * 
 * An obvious drawback of this implementation is that it does not scale.
 * If the application is deployed on multiple servers, then the request count will not be shared across servers.
 * This means that a user can perform the action more than the threshold if the requests are distributed across servers.
 */
class FixedWindowInMemoryRateLimiter implements IRateLimiter {

    private threshold: number;
    private timeInterval: number;
    private requestCount: Map<string, number>;
    private timeIntervalId: NodeJS.Timeout;

    /**
     * Initializes a new FixedWindowRateLimiter with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    constructor(threshold: number, timeInterval: number) {
        this.threshold = threshold;
        this.timeInterval = timeInterval;
        this.requestCount = new Map<string, number>();

        // clear the request count every time interval
        this.timeIntervalId = setInterval(() => {
            this.requestCount.clear();
        }, timeInterval);
    }

    /**
     * When the FixedWindowRateLimiter is destroyed, it should stop clearing the request count every time interval.
     */
    destroy() : void {
        // stop clearing the request count every time interval
        clearInterval(this.timeIntervalId);
    }

    /**
     * Checks if the user is allowed to perform the action or not.
     * If user is allowed, then the rate limiter should record the action.
     * And when the threshold is reached, the user should not be allowed to perform the action.
     * @param userId - the user id to check against
     * @return true if the user is allowed to perform the action, false otherwise
     */
    isAllowed(userId: string): boolean {
        // if the user has not made any requests, then allow the request
        let requestCount = this.requestCount.get(userId) || 0;
        // check if threshold is reached
        if (requestCount >= this.threshold) {
            // threshold reached, do not allow the request
            return false;
        }

        // threshold not reached, allow the request
        // increment the request count
        this.requestCount.set(userId, requestCount + 1);
        return true;
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
     * Returns the time interval for the rate limiter in milliseconds
     * @return
     */
    getTimeInterval(): number {
        return this.timeInterval;
    }
}

// export the FixedWindowInMemoryRateLimiter class
export default FixedWindowInMemoryRateLimiter;

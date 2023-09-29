// imports
import FixedWindowRateLimiter from './FixedWindowRateLimiter';

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
class FixedWindowInMemoryRateLimiter extends FixedWindowRateLimiter {

    // the request count for each user
    private requestCount: Map<string, number>;

    /**
     * Initializes a new FixedWindowRateLimiter with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    constructor(threshold: number, timeInterval: number) {
        // invoke the super constructor
        super(threshold, timeInterval)

        // initialize the request count
        this.requestCount = new Map<string, number>();

        // clear the request count every time interval
        this.setupInterval();
    }

    // flushes the request count
    protected flush() : Promise<void> {
        return new Promise((resolve, _) => {
            // clear the request count
            this.requestCount.clear();
            resolve();
        });
    }

    /**
     * Checks if the user is allowed to perform the action or not.
     * If user is allowed, then the rate limiter should record the action.
     * And when the threshold is reached, the user should not be allowed to perform the action.
     * @param userId - the user id to check against
     * @return true if the user is allowed to perform the action, false otherwise
     */
    isAllowed(userId: string): Promise<boolean> {
        // create a new promise
        return new Promise<boolean>((resolve, _) => {
            // if the user has not made any requests, then allow the request
            let requestCount = this.requestCount.get(userId) || 0;
            // check if threshold is reached
            if (requestCount >= this.threshold) {
                // threshold reached, do not allow the request
                resolve(false);
                return;
            }

            // threshold not reached, allow the request
            // increment the request count
            this.requestCount.set(userId, requestCount + 1);

            // allow the request
            resolve(true);
        });
    }

}

// export the FixedWindowInMemoryRateLimiter class
export default FixedWindowInMemoryRateLimiter;

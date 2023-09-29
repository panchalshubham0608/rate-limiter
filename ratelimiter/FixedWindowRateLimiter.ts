// imports
import RateLimiterImpl from "./RateLimiterImpl";

/**
 * FixedWindowRateLimiter is an abstract class that implements the RateLimiter interface.
 * It provides the threshold and time interval for the rate limiter.
 * It also provides the destroy method.
 */
abstract class FixedWindowRateLimiter extends RateLimiterImpl {
    protected timeIntervalId: NodeJS.Timeout | null;

    /**
     * Initializes a new FixedWindowRateLimiter with the given threshold and time interval.
     */
    constructor(threshold: number, timeInterval: number) {
        // call the super constructor
        super(threshold, timeInterval);
        this.timeIntervalId = null;
    }

    /**
     * When the FixedWindowRateLimiter is destroyed, it should stop clearing the request count every time interval.
     */
    destroy() : void {
        // stop clearing the request count every time interval
        if (this.timeIntervalId) {
            clearInterval(this.timeIntervalId);
        }
    }

}

// export the class
export default FixedWindowRateLimiter;


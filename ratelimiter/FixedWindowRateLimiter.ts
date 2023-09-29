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
     * Flushes the rate limiter.
     */
    protected abstract flush() : Promise<void>;

    // setup the interval to clear the request count
    protected setupInterval() {
        if (this.timeIntervalId) clearInterval(this.timeIntervalId);
        // clear the request count every time interval
        this.timeIntervalId = setInterval(() => {
            this.flush().then(() => {
                // console.log(`${this.constructor.name} flushed at ${Date.now()}`);
            }).catch(err => {
                console.log(`${this.constructor.name} flush error: ${err}`);
            });
        }, this.getTimeInterval());
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

    /**
     * Resets the rate-limiter.
     */
    reset() : void {
        // flush the rate limiter
        this.flush().then(() => {
            // console.log(`${this.constructor.name} flushed at ${Date.now()}`);
        }).catch(err => {
            console.log(`${this.constructor.name} flush error: ${err}`);
        }).finally(() => {
            // setup the interval again
            this.setupInterval();
        });
    }

}

// export the class
export default FixedWindowRateLimiter;


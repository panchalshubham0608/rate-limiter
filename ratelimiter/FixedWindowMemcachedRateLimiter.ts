// imports
import FixedWindowRateLimiter from './FixedWindowRateLimiter';
import Memcached from 'memcached';

/**
 * FixedWindowMemcachedRateLimiter is a class that implements IRateLimiter.
 * It uses memcached to store the request count for each user.
 * It's an extension of FixedWindowInMemoryRateLimiter but uses memcached instead of an in-memory object.
 * And therefore, it can be used in a distributed environment.
 * 
 * It fixes the drawback of FixedWindowInMemoryRateLimiter.
 * But it has a drawback of its own i.e. it's a fixed window rate limiter.
 * This can result into a burst of requests at the start of the time interval.
 * For example, if the threshold is 10 and time interval is 1 minute, then a user can make 10 requests in the first second of the minute.
 * And then the user will not be allowed to make any more requests for the rest of the minute.
 * 
 * Furthermore it can allow a user to make more than the threshold number of requests in a given time interval.
 * For example, if the threshold is 10 and time interval is 1 minute.
 * Let's say we make 10 requests at 59th second of the minute.
 * And then we make 10 more requests at 1st second of the next minute.
 * In this case, the user will be allowed to make 20 requests in 2 seconds.
 * Which is a violation of the threshold.
 */
class FixedWindowMemcachedRateLimiter extends FixedWindowRateLimiter {

    // the memcached client
    private memcached: Memcached;

    /**
     * Initializes a new FixedWindowMemcachedRateLimiter with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    constructor(threshold: number, timeInterval: number) {
        // invoke the super constructor
        super(threshold, timeInterval);

        // initialize the memcached client
        let memcachedUrl = process.env.MEMCACHED_URL || 'localhost:11211';
        this.memcached = new Memcached(memcachedUrl);

        // clear the request count every time interval
        this.timeIntervalId = setInterval(() => {
            this.memcached.flush((err: Error) => {
                if (err) {
                    console.error(err);
                    return;
                }
                // console.log('Flushed memcached');
            });
        }, timeInterval);
    }

    /**
     * When the FixedWindowMemcachedRateLimiter is destroyed, it should stop clearing the request count every time interval.
     * And it should also close the memcached client.
     */
    destroy(): void {
        // stop clearing the request count every time interval
        super.destroy();

        // close the memcached client
        this.memcached.end();
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
        return new Promise<boolean>((resolve, reject) => {
            // get the request count for the user
            this.memcached.get(userId, (err: Error, count: any) => {
                // in case of error, reject the promise
                if (err) {
                    reject(err);
                    return;
                }

                // if the request count is undefined, then set it to 0
                count = count || 0;

                // check if the threshold is reached
                if (count >= this.threshold) {
                    // threshold is reached, resolve the promise with false
                    resolve(false);
                    return;
                }

                // threshold is not reached, increment the request count
                this.memcached.set(userId, count + 1, this.timeInterval, (err: Error) => {
                    // in case of error, reject the promise
                    if (err) {
                        reject(err);
                        return;
                    }

                    // resolve the promise with true
                    resolve(true);
                });
            });
        });
    }
}

// export the FixedWindowMemcachedRateLimiter class
export default FixedWindowMemcachedRateLimiter;

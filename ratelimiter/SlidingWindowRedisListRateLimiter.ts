// imports
import SlidingWindowRateLimiter from "./SlidingWindowRateLimiter";
import { RedisClientType, createClient } from "redis";

/**
 * SlidingWindowListRateLimiter is a class that implements IRateLimiter.
 * It uses redis list sorted by timestamps for each user to store the request count.
 * 
 * This is a sliding window rate limiter.
 * Since this uses redis to store information it can be used in a distributed environment.
 * 
 * Furthermore, let's say we have a threshold of T.
 * The time taken to check if the user is allowed to perform the action or not is O(T).
 */
class SlidingWindowRedisListRateLimiter extends SlidingWindowRateLimiter {
    // redis client
    private redisClient : RedisClientType<any>;

    /**
     * Initializes a new SlidingWindowInMemoryRateLimiter with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    constructor(threshold: number, timeInterval: number) {
        // invoke the super constructor
        super(threshold, timeInterval);

        // initialize the redis instance
        this.redisClient = createClient({
            url: 'redis://localhost:6379',
        });

        // connect to the redis servcer
        this.redisClient.connect().then(() => {
            // console.log('Connected to redis server.')
        }).catch((err) => {
            console.log(err);
            console.log('Failed to connect to redis server.');
        });
    }

    /**
     * Checks if the user is allowed to perform the action or not.
     * If user is allowed, then the rate limiter should record the action.
     * And when the threshold is reached, the user should not be allowed to perform the action.
     * @param userId - the user id to check against
     */
    isAllowed(userId: string): Promise<boolean> {
        // create a new promise
        return new Promise(async (resolve, reject) => {
                let currentTime = Date.now();
                // get list from redis corresponding to this user
                try {
                    while (true) {
                        // get the top element of the list
                        let items = await this.redisClient.lRange(userId, 0, 0);
                        if (items.length === 0) break;
                        let item = parseInt(items[0]);
                        if (item < currentTime - this.timeInterval) {
                            await this.redisClient.lPop(userId)
                        } else {
                            break;
                        }
                    }

                    // get the number of elements available in the list
                    let size = await this.redisClient.lLen(userId);

                    // check if limit is reached
                    if (size >= this.threshold) {
                        // do not allow the request
                        resolve(false);
                        return;
                    }

                    // allow the request
                    await this.redisClient.rPush(userId, `${currentTime}`);
                    resolve(true);
                } catch (err : any) {
                    // if fails then reject the promise
                    reject(err);
                }    
        });
    }

    /**
     * Destroys the rate limiter.
     */
    destroy(): void {
        this.redisClient.disconnect().then(() => {
            // console.log(`Redis client disconnected!`);
        }).catch(err => {
            console.log(err);
            console.log(`Failed to disconnec to redis client.`);
        });
    }

}

// export the class
export default SlidingWindowRedisListRateLimiter;

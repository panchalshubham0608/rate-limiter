// imports
import SlidingWindowRateLimiter from "./SlidingWindowRateLimiter";
import { RedisClientType, createClient } from "redis";

/**
 * SlidingWindowListRateLimiter is a class that implements IRateLimiter.
 * It uses redis sorted sets to store the request count.
 * 
 * This is a sliding window rate limiter.
 * Since this uses redis to store information it can be used in a distributed environment.
 * 
 * Furthermore, let's say we have a threshold of T.
 * The time taken to check if the user is allowed to perform the action or not is O(logT).
 */
class SlidingWindowRedisSortedSetsRateLimiter extends SlidingWindowRateLimiter {
    // redis client
    private redisClient : RedisClientType<any>;

    /**
     * Initializes a new SlidingWindowRedisSortedSetsRateLimiter with the given threshold and time interval.
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
        return new Promise((resolve, reject) => {
            // get the current timestamp
            let currentTime = Date.now();

            // add one new request received at current time to the set
            this.redisClient.zAdd(userId, {
                value: `${currentTime}`,
                score: currentTime
            }).then((_: number) => {
                // remove all entries that are older than the time interval
                // for given user from the set
                this.redisClient.zRemRangeByScore(userId, 0, currentTime - this.timeInterval)
                .then((_: number) => {
                    // count the number of enrties in the set for this user
                    this.redisClient.zRank(userId, `${currentTime}`).then((rankIdx: number | null) => {
                        // check if we have reached the threshold
                        if (rankIdx !== null && (rankIdx + 1) > this.threshold) {
                            // we have reached the threshold
                            // user is not allowed to perform the action
                            resolve(false);
                            return;
                        }

                        // user is allowed to perform the action
                        resolve(true);
                    }).catch(err => {
                        console.log(`Failed to get rank of entry from redis set for user ${userId}.`)
                    });
                }).catch(err => {
                    console.log(`Failed to remove entries from redis set for user ${userId}.`)
                    reject(err);
                })
            }).catch(err => {
                console.log(`Failed to add new entry to redis set for user ${userId}.`)
                reject(err);
            });
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
export default SlidingWindowRedisSortedSetsRateLimiter;

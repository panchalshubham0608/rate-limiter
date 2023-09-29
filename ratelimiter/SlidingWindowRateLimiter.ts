// // imports
// import RateLimiterImpl from "./RateLimiterImpl";
// import { RedisClientType, createClient } from 'redis';

// /**
//  * SlidingWindowRateLimiter is a class that implements IRateLimiter.
//  * It uses redis sorted sets to store the request count for each user.
//  */
// class SlidingWindowRateLimiter extends RateLimiterImpl {
//     // the redis client
//     private redisClient: RedisClientType<any>;

//     /**
//      * Initializes a new SlidingWindowRateLimiter with the given threshold and time interval.
//      * @param threshold 
//      * @param timeInterval 
//      */
//     constructor(threshold: number, timeInterval: number) {
//         // invoke the super constructor
//         super(threshold, timeInterval);

//         // initialize the redis client
//         this.redisClient = createClient();

//     }
// }
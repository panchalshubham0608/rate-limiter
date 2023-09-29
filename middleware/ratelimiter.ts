// imports
import { Request, Response, NextFunction } from 'express';
import IRateLimiter from '../ratelimiter/IRateLimiter';
import RateLimiterFactory from '../ratelimiter/RateLimiterFactory';

// create a new middleware function
const constructRateLimiterMiddleware = (rateLimiter: IRateLimiter) => {
    return (req: Request, res: Response, next: NextFunction) => {        
        // check if the user is allowed to perform the action
        let {userId} = req.params;
        rateLimiter.isAllowed(userId).then((isAllowed: boolean) => {
            if (!isAllowed) {
                // user is not allowed to perform the action
                return res.status(429).send('Too many requests');
            }
            // user is allowed to perform the action
            next();
        }).catch((err: Error) => {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        });
    }
};

// create a middleware function that uses the FixedWindowInMemoryRateLimiter
const threshold : number = process.env.THRESHOLD ? parseInt(process.env.THRESHOLD) : 5;
const timeInterval : number = process.env.TIME_INTERVAL ? parseInt(process.env.TIME_INTERVAL) : 60*10000;
console.log(`threshold: ${threshold}, timeInterval: ${timeInterval}`)

// construct the rate limiter middleware
const rateLimiter : IRateLimiter = RateLimiterFactory.createRateLimiter(threshold, timeInterval);
const rateLimiterMiddleware = constructRateLimiterMiddleware(rateLimiter);

// return the constructed middleware function
export default rateLimiterMiddleware;

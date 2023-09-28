// imports
import IRateLimiter from './IRateLimiter';
import { Request, Response, NextFunction } from 'express';
import FixedWindowInMemoryRateLimiter from './FixedWindowInMemoryRateLimiter';

// create a new middleware function
const constructRateLimiterMiddleware = (rateLimiter: IRateLimiter) => {
    return (req: Request, res: Response, next: NextFunction) => {        
        // check if the user is allowed to perform the action
        let {userId} = req.params;
        if (!rateLimiter.isAllowed(userId)) {
            // user is not allowed to perform the action
            return res.status(429).send('Too many requests');
        }

        // user is allowed to perform the action
        next();
    }
};

// create a middleware function that uses the FixedWindowInMemoryRateLimiter
const threshold : number = process.env.THRESHOLD ? parseInt(process.env.THRESHOLD) : 5;
const timeInterval : number = process.env.TIME_INTERVAL ? parseInt(process.env.TIME_INTERVAL) : 60*10000;
console.log(`threshold: ${threshold}, timeInterval: ${timeInterval}`)

// construct the rate limiter middleware
const rateLimiter : IRateLimiter = new FixedWindowInMemoryRateLimiter(threshold, timeInterval);
const rateLimiterMiddleware = constructRateLimiterMiddleware(rateLimiter);

// when process is terminated, destroy the rate limiter
// ignore coverage
// istanbul ignore next
process.on('SIGINT', () => {
    rateLimiter.destroy();
    // istanbul ignore next
    process.exit();
});

// return the constructed middleware function
export default rateLimiterMiddleware;

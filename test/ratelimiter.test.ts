// imports
import IRateLimiter from "../ratelimiter/IRateLimiter";
import FixedWindowInMemoryRateLimiter from "../ratelimiter/FixedWindowInMemoryRateLimiter";
import FixedWindowMemcachedRateLimiter from "../ratelimiter/FixedWindowMemcachedRateLimiter";
import SlidingWindowMinHeapRateLimiter from "../ratelimiter/SlidingWindowMinHeapRateLimiter";
import SlidingWindowListRateLimiter from "../ratelimiter/SlidingWindowListRateLimiter";
import SlidingWindowRedisListRateLimiter from "../ratelimiter/SlidingWindowRedisListRateLimiter";

// constants for testing - Allowing 4 requests per 1 second
const threshold : number = 4;
const timeInterval : number = 1000;
let userId = 'test-user';

// generates the list of rate limiters to test
function getRateLimiters(threshold : number, timeInterval: number) : IRateLimiter[] {
    return [
        new FixedWindowInMemoryRateLimiter(threshold, timeInterval),
        new FixedWindowMemcachedRateLimiter(threshold, timeInterval),
        new SlidingWindowMinHeapRateLimiter(threshold, timeInterval),
        new SlidingWindowListRateLimiter(threshold, timeInterval),
        new SlidingWindowRedisListRateLimiter(threshold, timeInterval),
    ];
}

// test rate-limited
describe('#should-be-rate-limited', () => {

    // get the list of rate limiters to test
    let rateLimiters = getRateLimiters(threshold, timeInterval);
    let numOfRequests = threshold + 1;
    let delayInterval = Math.ceil(timeInterval / numOfRequests);

    // spawn a test for each rate limiter
    for (let i = 0; i < rateLimiters.length; i++) {
        // fetch the rate limiter
        let rateLimiter = rateLimiters[i];

        // destory the rate limiter after the test
        afterAll(() => {
            rateLimiter.destroy();
        });

        // test the rate limiter
        it(`#${i+1}: ${rateLimiter.constructor.name}`, async () => {
            // reset the rate limiter to re-start the interval
            rateLimiter.reset();

            // can it allow more than threshold requests?
            // test each request
            for (let i = 0; i < numOfRequests; i++) {
                // make the request
                let isAllowed = await rateLimiter.isAllowed(userId);
                // check if the request should be allowed
                if (i < threshold) {
                    // request should be allowed
                    expect(isAllowed).toBe(true);
                } else {
                    // request should be denied
                    expect(isAllowed).toBe(false);
                }

                // delay the next request
                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, delayInterval);
                });
            }
        });
    }
});


describe('#test-boundary-spikes', () => {
    // get the list of rate limiters to test
    let rateLimiters = getRateLimiters(threshold, timeInterval);

    // spawn a test for each rate limiter
    for (let i = 0; i < rateLimiters.length; i++) {
        // fetch the rate limiter
        let rateLimiter = rateLimiters[i];

        // destory the rate limiter after the test
        afterAll(() => {
            rateLimiter.destroy();
        });

        // test the rate limiter
        it(`#${i+1}: ${rateLimiter.constructor.name}`, async () => {
            // If we make threshold requests at (timeInterval-10ms) 
            // and then make another request at (timeInterval+10ms),
            // then should the last request be allowed?
            // For fixed window rate limiters, the last request should be allowed.
            // For sliding window rate limiters, the last request should be denied.
            let delta = 100;

            // reset the rate limiter to re-start the interval
            rateLimiter.reset();

            // wait for (timeInterval - delta) ms
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, timeInterval - delta);
            });

            // make threshold requests
            for (let i = 0; i < threshold; i++) {
                // make the request
                let isAllowed = await rateLimiter.isAllowed(userId);
                // check if the request should be allowed
                expect(isAllowed).toBe(true);
            }

            // wait for (2*delta) ms
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2*delta);
            });

            // make another request
            let isAllowed = await rateLimiter.isAllowed(userId);
            // check if the request should be allowed
            if (rateLimiter.constructor.name.startsWith('FixedWindow')) {
                // request should be allowed
                expect(isAllowed).toBe(true);
            } else {
                // request should be denied
                expect(isAllowed).toBe(false);
            }
        });
    }
});

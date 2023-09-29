// imports
import IRateLimiter from "../ratelimiter/IRateLimiter";
import FixedWindowInMemoryRateLimiter from "../ratelimiter/FixedWindowInMemoryRateLimiter";
import FixedWindowMemcachedRateLimiter from "../ratelimiter/FixedWindowMemcachedRateLimiter";
import SlidingWindowMinHeapRateLimiter from "../ratelimiter/SlidingWindowMinHeapRateLimiter";

// constants for testing - Allowing 4 requests per 1 second
const threshold : number = 4;
const timeInterval : number = 1000;

// generates the list of rate limiters to test
function getRateLimiters(threshold : number, timeInterval: number) : IRateLimiter[] {
    return [
        new FixedWindowInMemoryRateLimiter(threshold, timeInterval),
        new FixedWindowMemcachedRateLimiter(threshold, timeInterval),
        new SlidingWindowMinHeapRateLimiter(threshold, timeInterval),
    ];
}

// test rate-limited
describe('#should-be-rate-limited', () => {

    // get the list of rate limiters to test
    let rateLimiters = getRateLimiters(threshold, timeInterval);
    let numOfRequests = threshold + 1;
    let userId = 'test-user';
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

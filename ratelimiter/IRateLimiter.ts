/**
 * Typescript interface for RateLimiter
 * IRateLimiter is an interface that allows a user to perform an action only a certain number of times in a given time interval.
 */
interface IRateLimiter {
    /**
     * Checks if the user is allowed to perform the action or not.
     * If user is allowed, then the rate limiter should record the action.
     * And when the threshold is reached, the user should not be allowed to perform the action.
     * @param userId - the user id to check against
     * @return true if the user is allowed to perform the action, false otherwise
     */
    isAllowed(userId: string): Promise<boolean>;

    /**
     * Returns the threshold for the rate limiter
     * i.e. the number of times a user is allowed to perform the action in a given time interval
     * @return the threshold
     */
    getThreshold(): number;

    /**
     * Returns the time interval for the rate limiter in milliseconds
     * @return
     */
    getTimeInterval(): number;

    /**
     * When the RateLimiter is destroyed, it should stop clearing the request count every time interval.
     */
    destroy(): void;
}


// export the RateLimiter interface
export default IRateLimiter;

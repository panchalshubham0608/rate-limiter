// imports
import RateLimiterImpl from "./RateLimiterImpl";

/**
 * Represents a node in the linked list.
 */
class Node<T> {
    public data : T;
    public next : Node<T> | null;

    /**
     * Initializes a new instance of Node with given data.
     * @param data
     */
    constructor(data : T) {
        this.data = data;
        this.next = null;
    }
}

/**
 * Represents a linked list.
 */
class LinkedList<T> {
    public head : Node<T> | null;
    public tail : Node<T> | null;
    public size : number;

    /**
     * Initializes a new instance of the LinkedList<T>
     */
    constructor() {
        this.head = this.tail = null;
        this.size = 0;
    }

    /**
     * Inserts the data to the end of the linked list.
     * @param data - data to be inserted
     */
    pushBack(data : T) {
        // create a new node
        let node : Node<T> = new Node<T>(data);
        // check if the list is empty
        if (this.tail === null) {
            this.head = this.tail = node;
        } else {
            this.tail.next = node;
            this.tail = node;
        }
        // increment the number of nodes in the list
        this.size++;
    }

    /**
     * Removes the data from the head of the linked list.
     * @return the data removed
     */
    popFront() : T {
        // check if the list is empty
        if (this.head === null) throw new Error('List is empty');
        let node = this.head;
        // check if this is the only node
        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            this.head = this.head?.next;
        }
        // decrement the size
        this.size--;
        // return the deleted node
        return node.data;
    }

    /**
     * Returns the data at the front of the linked list.
     * @returns data at the front of the linked list.
     */
    getFront() : T {
        // check if the list is empty
        if (this.head === null) throw new Error('List is empty');
        // return the data at the head of the list
        return this.head.data;
    }


    /**
     * Checks if the list is empty.
     * @returns true if the list is empty.
     */
    isEmpty() : boolean {
        return this.size === 0;
    }

    /**
     * Retrieves the size of the linked list.
     * @returns the size of the linked list.
     */
    getSize() : number {
        return this.size;
    }
}

/**
 * SlidingWindowListRateLimiter is a class that implements IRateLimiter.
 * It uses in-memory sorted-linked list by timestamps for each user to store the request count.
 * 
 * This is a sliding window rate limiter.
 * But it has a drawback of its own i.e. it's an in-memory rate limiter.
 * And therefore, it can't be used in a distributed environment.
 * 
 * Furthermore, let's say we have a threshold of T.
 * The time taken to check if the user is allowed to perform the action or not is O(T).
 */
class SlidingWindowListRateLimiter extends RateLimiterImpl {
    // the map of userId to min heap
    private userMap: Map<string, LinkedList<number>>;

    /**
     * Initializes a new SlidingWindowInMemoryRateLimiter with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    constructor(threshold: number, timeInterval: number) {
        // invoke the super constructor
        super(threshold, timeInterval);

        // initialize the user map
        this.userMap = new Map<string, LinkedList<number>>();
    }

    /**
     * Checks if the user is allowed to perform the action or not.
     * If user is allowed, then the rate limiter should record the action.
     * And when the threshold is reached, the user should not be allowed to perform the action.
     * @param userId - the user id to check against
     */
    isAllowed(userId: string): Promise<boolean> {
        // create a new promise
        return new Promise((resolve, _) => {
            // get the min heap for the user
            let list = this.userMap.get(userId) || new LinkedList<number>();
            // remove stale elements from the min heap
            let currentTime = Date.now();
            while (!list.isEmpty() && list.getFront() < currentTime - this.timeInterval) {
                list.popFront();
            }

            // check if the threshold is reached
            if (list.getSize() >= this.threshold) {
                // threshold is reached, resolve the promise with false
                resolve(false);
                return;
            }

            // insert the current time into the min heap
            list.pushBack(currentTime);

            // update the user map
            this.userMap.set(userId, list);

            // resolve the promise with true
            resolve(true);
        });
    }

    /**
     * Destroys the rate limiter.
     */
    destroy(): void {
        // do nothing
    }

    /**
     * Resets the rate limiter.
     */
    reset(): void {
        // clear the user map
        this.userMap.clear();
    }
}

// export the class
export default SlidingWindowListRateLimiter;

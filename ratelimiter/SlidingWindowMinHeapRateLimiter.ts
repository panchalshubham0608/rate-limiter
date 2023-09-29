// imports
import RateLimiterImpl from "./RateLimiterImpl";

/**
 * Implements a min heap for any type T.
 */
class MinHeap<T> {
    private heap: T[];
    private capacity: number;
    private size: number;

    /**
     * Initializes a new MinHeap with the given capacity.
     * @param capacity 
     */
    constructor(capacity : number) {
        this.heap = new Array(capacity);
        this.capacity = capacity;
        this.size = 0;
    }


    /**
     * Returns the parent index of the given index.
     * @param index 
     */
    private parent(index : number) : number {
        return Math.floor((index - 1) / 2);
    }

    /**
     * Returns the left child index of the given index.
     * @param index 
     */
    private left(index : number) : number {
        return 2 * index + 1;
    }

    /**
     * Returns the right child index of the given index.
     * @param index 
     */
    private right(index : number) : number {
        return 2 * index + 2;
    }

    /**
     * Check if the index is valid or not.
     */
    private isValid(index : number) : boolean {
        return index >= 0 && index < this.size;
    }

    /**
     * Fixes the heap from the given index to the root - heapify up.
     */
    private heapifyUp(index : number) : void {
        // check if the index is valid
        if (!this.isValid(index)) return;

        // check if te parent is valid
        let parentIdx = this.parent(index);
        if (!this.isValid(parentIdx)) return;

        // check if the parent is greater than the current element
        if (this.heap[parentIdx] > this.heap[index]) {
            // swap the parent and the current element
            let temp = this.heap[parentIdx];
            this.heap[parentIdx] = this.heap[index];
            this.heap[index] = temp;

            // recursively heapify up
            this.heapifyUp(parentIdx);
        }
    }

    /**
     * Fixes the heap from the given index to the leaf - heapify down.
     */
    private heapifyDown(index : number) : void {
        // check if the index is valid
        if (!this.isValid(index)) return;

        // stores the index of the smaller child
        let smallerIdx = index;

        // check if the left child is valid
        let leftIdx = this.left(index);
        if (this.isValid(leftIdx) && this.heap[leftIdx] < this.heap[smallerIdx]) {
            smallerIdx = leftIdx;
        }

        // check if the right child is valid
        let rightIdx = this.right(index);
        if (this.isValid(rightIdx) && this.heap[rightIdx] < this.heap[smallerIdx]) {
            smallerIdx = rightIdx;
        }

        // check if the smaller child is smaller than the current element
        if (smallerIdx !== index) {
            // swap the smaller child and the current element
            let temp = this.heap[smallerIdx];
            this.heap[smallerIdx] = this.heap[index];
            this.heap[index] = temp;

            // recursively heapify down
            this.heapifyDown(smallerIdx);
        }
    }



    /**
     * Returns the number of elements in the heap.
     * @returns the number of elements in the heap
     */
    public getSize() : number {
        return this.size;
    }

    /**
     * Returns the capacity of the heap.
     * @returns the capacity of the heap
     */
    public getCapacity() : number {
        return this.capacity;
    }

    /**
     * Checks if the heap is empty or not.
     */
    public isEmpty() : boolean {
        return this.size === 0;
    }

    /**
     * Returns the top element of the heap.
     * @returns the top element of the heap
     */
    public getTop() : T {
        if (this.isEmpty()) throw new Error('Heap is empty');
        return this.heap[0];
    }

    /**
     * Inserts the given element into the heap.
     * @param element - the element to insert
     */
    public insert(element : T) : void {
        if (this.size === this.capacity) throw new Error('Heap is full');
        this.heap[this.size] = element;
        this.size++;
        this.heapifyUp(this.size - 1);
    }

    /**
     * Removes the top element from the heap.
     * @returns the top element of the heap
     */
    public removeTop() : T {
        if (this.isEmpty()) throw new Error('Heap is empty');
        let top = this.heap[0];
        this.heap[0] = this.heap[this.size - 1];
        this.size--;
        this.heapifyDown(0);
        return top;
    }
}

/**
 * SlidingWindowMinHeapRateLimiter is a class that implements IRateLimiter.
 * It uses in-memory heap for each user to store the request count.
 * 
 * This is a sliding window rate limiter.
 * But it has a drawback of its own i.e. it's an in-memory rate limiter.
 * And therefore, it can't be used in a distributed environment.
 * 
 * Furthermore, let's say we have a threshold of T.
 * The time taken to check if the user is allowed to perform the action or not is O(TlogT).
 */
class SlidingWindowMinHeapRateLimiter extends RateLimiterImpl {
    // the map of userId to min heap
    private userMap: Map<string, MinHeap<number>>;

    /**
     * Initializes a new SlidingWindowInMemoryRateLimiter with the given threshold and time interval.
     * @param threshold 
     * @param timeInterval 
     */
    constructor(threshold: number, timeInterval: number) {
        // invoke the super constructor
        super(threshold, timeInterval);

        // initialize the user map
        this.userMap = new Map<string, MinHeap<number>>();
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
            let minHeap = this.userMap.get(userId) || new MinHeap<number>(this.threshold);
            // remove stale elements from the min heap
            let currentTime = Date.now();
            while (!minHeap.isEmpty() && minHeap.getTop() < currentTime - this.timeInterval) {
                minHeap.removeTop();
            }

            // check if the threshold is reached
            if (minHeap.getSize() >= this.threshold) {
                // threshold is reached, resolve the promise with false
                resolve(false);
                return;
            }

            // insert the current time into the min heap
            minHeap.insert(currentTime);

            // update the user map
            this.userMap.set(userId, minHeap);

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
export default SlidingWindowMinHeapRateLimiter;

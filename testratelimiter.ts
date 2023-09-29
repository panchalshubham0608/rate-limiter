// imports
import axios from 'axios';
import dotenv from 'dotenv';

// config dotenv
dotenv.config();

// read the port from command line arguments or use 8080 as default
const port : number = (process.argv[2] && parseInt(process.argv[2])) || 8080;
// read the threshold and time interval from environment variables or use 5 and 10*1000 as default
const threshold : number = process.env.THRESHOLD ? parseInt(process.env.THRESHOLD) : 5;
const timeInterval : number = process.env.TIME_INTERVAL ? parseInt(process.env.TIME_INTERVAL) : 10*1000;
console.log(`Allowing ${threshold} requests per ${Math.floor(timeInterval/1000)}s`);

// check if we can make a maximum of threshold requests in timeInterval
const checkRateLimiter = async () => {
    // create a new user
    let userId = Math.random().toString(36);

    // first check that we are rate-limited
    let numOfRequests = threshold + 2;
    let delayInterval = Math.floor(timeInterval/numOfRequests);
    let startTime = Date.now();
    // make numOfRequests requests
    for (let i = 1; i <= numOfRequests; i++) {
        // make a request
        try {
            process.stdout.write(`Request at t= ${Math.floor((Date.now() - startTime)/1000)}s: `);
            await axios.get(`http://localhost:${port}/${userId}`);
            console.log(`Allowed`);
            // request allowed, should it be allowed?
            if (i > threshold) {
                throw new Error('Rate Limiter is not working as expected');
            }
        } catch(err : any) {
            if (err.response && err.response.status === 429) {
                console.log(`Not Allowed`);
                // request rate-limited
                // should it be rate-limited?
                if (i <= threshold) {
                    throw new Error('Rate Limiter is not working as expected');
                }
            } else {
                throw err;
            }
        } 
        // wait for delayInterval
        await new Promise<void>((resolve, _) => {
            setTimeout(() => {
                resolve();
            }, delayInterval);
        });
    }
};

// run the checkRateLimiter function
checkRateLimiter().then(() => {
    console.log('Rate Limiter is working as expected');
}).catch((err: Error) => {
    console.error(err);
    console.error('Rate Limiter is not working as expected');
});

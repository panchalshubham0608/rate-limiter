// imports
import dotenv from 'dotenv';
dotenv.config();
import express, { Express, Request, Response } from 'express';
import rateLimiterMiddleware from './middleware/ratelimiter';


// Create a new express application instance
const app : Express = express();

// setup a simple route to hit
app.get('/:userId', rateLimiterMiddleware, (req: Request, res: Response) => {
    res.status(200).send('Hello World!');
});

// retrive the port from command line arguments or use 8080 as default
const port : number = (process.argv[2] && parseInt(process.argv[2])) || 8080;

// start the Express server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

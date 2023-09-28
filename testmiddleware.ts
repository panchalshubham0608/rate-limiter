// // imports
// import axios, { AxiosResponse } from 'axios';
// import dotenv from 'dotenv';

// // config dotenv
// dotenv.config();

// // read the port from command line arguments or use 3000 as default
// const port : number = (process.argv[2] && parseInt(process.argv[2])) || 3000;

// // read the threshold and time interval from environment variables or use 5 and 60*10000 as default
// const threshold : number = process.env.THRESHOLD ? parseInt(process.env.THRESHOLD) : 5;
// const timeInterval : number = process.env.TIME_INTERVAL ? parseInt(process.env.TIME_INTERVAL) : 60*10000;

// // make (threshold + 10) requests to the server
// // within given time interval
// let totalRequests : number = threshold + 10;
// let requestsMade : number = 0;
// let requestsAllowed : number = 0;
// let requestsDenied : number = 0;
// let requestsFailed : number = 0;
// let requestsSucceeded : number = 0;

// // make a request to the server
// const makeRequest = () => {
//     // make a request to the server
//     axios.get(`http://localhost:${port}`).then((res : AxiosResponse) => {

//     }).catch((err : Error) => {

//     });
// };

import axios from 'axios';

// Define the base URL in a .env file or any other configuration file
const baseURL = process.env.API_URL; // TODO not working

// Create an instance of axios with default configuration
export const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    // headers: {
    //     'Content-Type': 'application/json',
    // },
    // You can add other default settings such as timeouts or response type
});
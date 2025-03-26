import axios from "axios";
export const api = axios.create({
    baseURL: "http://localhost:3000", // Your NestJS backend URL
    headers: {
      "Content-Type": "application/json",
    },
});
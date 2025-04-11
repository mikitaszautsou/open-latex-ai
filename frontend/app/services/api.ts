import axios from "axios";
export const api = axios.create({
    baseURL: "https://open-latex-ai.onrender.com",
    headers: {
      "Content-Type": "application/json",
    },
});
import { api } from "./api";

export interface User {
    id: string;
    username: string;
}
export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface Credentials {
    username: string;
    password: string;
}

export const authApi = {
    login: async (credentials: Credentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        console.log('auth data', response)
        return response.data;
    },
    register: async (credentials: Credentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        return response.data;
    }
}
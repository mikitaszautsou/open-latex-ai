import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '~/store/auth-store';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    constructor() {
        this.connect()
    }
    connect(url: string = import.meta.env.VITE_WEBSOCKETS_URL, onConnect?: () => void, onDisconnect?: () => void) {
        const token = useAuthStore.getState().token
        this.socket = io(url, {
            autoConnect: true,
            transports: ['websocket'],
            path: '/socket.io/',
            auth: {
                token: `Bearer ${token}`
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket');
            onConnect?.()
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
            onDisconnect?.()
        });

        return this.socket;
    }

    private ensureSocketConnected(): Promise<void> {
        return new Promise(resolve => {
            if (!this.socket) {
                this.connect('http://localhost:8080', resolve)
            }
            resolve()
        })
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emitMessage(params: { message: string, payload?: any; callback?: (data: any) => void }) {
        console.log('emmitting', params)
        if (!this.socket) {
            throw new Error('Socket is not connected');
        }

        this.socket.emit(params.message, params.payload, params.callback);
    }

    onMessage(event: string, callback: (data: any) => void) {
        if (!this.socket) {
            throw new Error('Socket is not connected');
        }

        console.log('listening for', event)
        const socket = this.socket;
        socket.on(event, callback);

        // Store callback for potential cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);

        return () => {
            console.log('removing listener for', event, socket)
            socket?.off(event, callback);
            const callbacks = this.listeners.get(event) || [];
            this.listeners.set(event, callbacks.filter(cb => cb !== callback));
        };
    }

    // Remove all listeners for a specific event
    offMessage(event: string) {
        if (!this.socket) return;

        this.socket.off(event);
        this.listeners.delete(event);
    }
}

// Export as a singleton
export const socketService = new SocketService();
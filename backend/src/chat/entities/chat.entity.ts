export interface Chat {
    id: string;
    title: string;
    messages: Message[];
}

export interface Message {
    id: string;
    content: string;
}
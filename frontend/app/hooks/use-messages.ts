import { useQuery } from "@tanstack/react-query";
import { chatApi } from "~/services/chat-api";

export function useMessages(chatId?: string) {
    return useQuery({
        queryKey: ['messages', chatId],
        queryFn: () => chatId !== undefined ? chatApi.getMessages(chatId) : [],
        enabled: !!chatId,
    })
}
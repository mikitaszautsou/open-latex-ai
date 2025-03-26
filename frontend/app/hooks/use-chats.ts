import { useQuery } from "@tanstack/react-query";
import { chatApi } from "~/services/chat-api";

export function useChats() {
    return useQuery({
        queryKey: ['chats'],
        queryFn: chatApi.getChats,
    })
}
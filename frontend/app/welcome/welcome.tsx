import { useMutation, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChatItem } from "~/components/chat-item";
import { Conversation } from "~/components/conversation";
import { useChats } from "~/hooks/use-chats";
import { queryClient } from "~/query-client";
import { chatApi } from "~/services/chat-api";
import clsx from "clsx";
import { ChatsScreen } from "~/screens/chats-screen";
import { useBreakpoints } from "~/hooks/use-media-query";
import { io } from "socket.io-client";
import { socketService } from "~/services/socket-service";

// function WebSocketTest() {
//   const [socket, setSocket] = useState<any>(null);
//   const [message, setMessage] = useState<any>("");
//   const [receivedMessages, setReceivedMessages] = useState<any>([]);

//   useEffect(() => {
//     // Connect to the WebSocket server
//     const socketInstance = io("http://localhost:3000"); // Your NestJS server URL
//     setSocket(socketInstance);

//     // Listen for messages
//     socketInstance.on("messageResponse", (data) => {
//       console.log(data);
//       setReceivedMessages((prev: any) => [...prev, data]);
//     });

//     // Clean up on component unmount
//     return () => {
//       socketInstance.disconnect();
//     };
//   }, []);

//   const sendMessage = () => {
//     if (socket) {
//       socket.emit("message", { text: "test", sender: "User" });
//       setMessage("");
//     }
//   };
//   console.log("set up");

//   return <button onClick={sendMessage}>send</button>;
// }

export function Welcome() {
  const { data: chats, isLoading } = useChats();
  const { chatId } = useParams();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(
    chatId
  );

  const selectedChat = chats?.find((c) => c.id === chatId);
  const [isChatsOpen, setChatsOpen] = useState(!chatId);
  useEffect(() => {
    if (selectedChat) {
      document.title = `${selectedChat.emoji ?? ""} ${
        selectedChat.title ?? ""
      }`;
    }
  }, [selectedChat]);

  const { isDesktop, isMobile } = useBreakpoints();
  useEffect(() => {
      setChatsOpen(!chatId);
  }, [isDesktop, isMobile]);
  const handleChatClick = (id: string) => {
    setSelectedChatId(id);
    if (!isDesktop) {
      setChatsOpen(false);
    }
    window.history.pushState({ chatId: id }, "", `/chat/${id}`);
  };

  useEffect(() => {
    socketService.connect();
  }, []);

  return (
    <main className="flex flex-col h-dvh max-h-dvh text-black overflow-hidden overscroll-none pb-safe box-border">
      <Conversation
        chatId={selectedChatId}
        onGoBackClick={() => setChatsOpen(true)}
        isChatsOpen={isChatsOpen}
      />
      <ChatsScreen
        selectedChatId={selectedChatId}
        isOpen={isChatsOpen}
        onChatClick={handleChatClick}
      />
    </main>
  );
}

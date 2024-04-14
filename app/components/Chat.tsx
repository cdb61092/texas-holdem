import React, { FormEvent } from "react";
import { wsContext } from "~/ws.context";
import { Socket } from "socket.io-client";
import type { User } from "../../types";

interface ChatProps {
  tableId: string;
  user: User;
}

interface ChatMessage {
  message: string;
  senderId: string;
  tableId: string;
  user: User;
}

export function Chat({ tableId, user }: ChatProps) {
  const socket = React.useContext<Socket | undefined>(wsContext);
  const [message, setMessage] = React.useState<string>("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  console.log("tableId in Chat.tsx", tableId);
  console.log("user in Chat.tsx", user);

  React.useEffect(() => {
    if (!socket) {
      console.log("Socket not initialized");
      return;
    }

    socket.emit("join room", tableId);

    socket.on("chat message", (msg) => {
      console.log("in chat message");
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // socket.on("start game", (msg) => {
    //   console.log("in start game");
    //   console.log(msg);
    //   setMessages((prevMessages) => [...prevMessages, msg.message]);
    // });

    return () => {
      socket.off("chat message");
    };
  }, [socket, tableId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    console.log("in handlesubmit send msg");
    event.preventDefault();
    if (!socket) {
      console.log("Socket is not initialized");
      return;
    }
    socket.emit("chat message", { tableId, message, user }); // Assuming senderId is known
    setMessage("");
  }

  console.log(messages);

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg.user.displayName}: {msg.message}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

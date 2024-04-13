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

  React.useEffect(() => {
    if (!socket) {
      console.log("Socket not initialized");
      return;
    }

    socket.emit("join room", tableId);

    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("chat message");
    };
  }, [socket, tableId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!socket) {
      console.log("Socket is not initialized");
      return;
    }
    socket.emit("chat message", { tableId, message, user }); // Assuming senderId is known
    setMessage("");
  }

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

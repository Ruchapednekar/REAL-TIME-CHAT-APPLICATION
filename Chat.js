import React, { useState, useEffect } from "react";
import socket from "./socket";

const Chat = ({ username, room }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    socket.emit("join-room", { username, room });

    socket.on("chat-message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    socket.on("typing", (name) => {
      setTyping(`${name} is typing...`);
    });

    socket.on("stop-typing", () => {
      setTyping("");
    });

    return () => {
      socket.disconnect();
    };
  }, [username, room]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-message", { room, username, message });
      setChat((prev) => [...prev, { username, message }]);
      setMessage("");
      socket.emit("stop-typing", { room });
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { room, username });
    setTimeout(() => socket.emit("stop-typing", { room }), 1000);
  };

  return (
    <div>
      <h2>Room: {room}</h2>
      <div style={{ border: "1px solid gray", height: 300, overflowY: "scroll", padding: 10 }}>
        {chat.map((msg, i) => (
          <div key={i}><strong>{msg.username}:</strong> {msg.message}</div>
        ))}
        <p style={{ color: "gray" }}>{typing}</p>
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleTyping}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;

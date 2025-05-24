import React, { useState, useEffect } from "react";
import socket from "./socket";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (user) => {
      setTypingUsers((prev) => [...new Set([...prev, user])]);
    });

    socket.on("stop typing", (user) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user));
    });

    return () => {
      socket.off("chat message");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  const handleSend = () => {
    if (input.trim() === "") return;
    socket.emit("chat message", input);
    setMessages((prev) => [...prev, input]);
    setInput("");
    socket.emit("stop typing");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit("typing");
    if (e.target.value === "") {
      socket.emit("stop typing");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>CODTECH Chat</h1>
      <div style={styles.chatBox}>
        {messages.length === 0 ? (
          <p style={styles.noMessages}>No messages yet.</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={styles.message}>
              {msg}
            </div>
          ))
        )}
      </div>

      {typingUsers.length > 0 && (
        <p style={styles.typingIndicator}>
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </p>
      )}

      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={handleTyping}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: "30px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  chatBox: {
    height: 300,
    overflowY: "auto",
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  noMessages: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
  },
  message: {
    backgroundColor: "#e1f5fe",
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
  },
  typingIndicator: {
    fontStyle: "italic",
    color: "#666",
    marginBottom: 10,
  },
  inputArea: {
    display: "flex",
  },
  input: {
    flexGrow: 1,
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
    marginRight: 8,
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#0288d1",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;

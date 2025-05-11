// components/ChatWebSocket.js
import React, { useRef, useState } from "react";
import * as URLs from "../constants";
import getOrCreateSharedSecret from "../utils/sharedSecret";
import { encryptMessageShared, decryptMessageShared } from "../utils/enc_dec";

const Chat = () => {
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [connected, setConnected] = useState(false);

  const sharedSecretsRef = useRef({});
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  const connectSocket = async () => {
    if (!receiver) return alert("Please enter receiver's username first");
    if (!token) return alert("Token not found!");

    const socket = new WebSocket(`${URLs.webSocketUrl}/ws/chat`);
    socketRef.current = socket;

    socket.onopen = async () => {
      setConnected(true);
      socket.send(
        JSON.stringify({
          type: "init",
          token,
          receiver_username: receiver,
        })
      );

      try {
        await getOrCreateSharedSecret(receiver, token, sharedSecretsRef);
      } catch (err) {
        console.error("Error fetching public key:", err);
        alert("Could not fetch receiver's public key.");
      }
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          console.log("Received WebSocket message:", data);
          const { nonce, box } = data.message;
          console.log("Message Content: ", { nonce, box });

          // Get or create the shared secret
          const sharedSecret = await getOrCreateSharedSecret(
            data.sender,
            token,
            sharedSecretsRef
          );
          console.log("received shared secret", sharedSecret);

          const decryptedMsg = decryptMessageShared(
            { nonce, box },
            sharedSecret
          );
          console.log("decryptedMsg: ", decryptedMsg);

          setChat((prevChat) => [
            ...prevChat,
            {
              type: "received",
              text: decryptedMsg,
              sender: data.sender || null,
            },
          ]);
        }
      } catch (error) {
        console.error("Errror/Invalid message format:", event.data);
      }
      scrollToBottom();
    };

    socket.onclose = () => {
      setConnected(false);
    };
  };

  const sendMessage = () => {
    if (!sharedSecretsRef.current[receiver])
      return alert("Encryption not initialized yet!");
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log("sending shared secret", sharedSecretsRef.current[receiver]);

      const encryptedMsg = encryptMessageShared(
        message,
        sharedSecretsRef.current[receiver]
      );
      console.log("encryptedMsg", encryptedMsg);

      socketRef.current.send(
        JSON.stringify({
          type: "chat",
          message: encryptedMsg,
        })
      );
      setChat((prev) => [...prev, { type: "sent", text: message }]);
      setMessage("");
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Private Chat</h2>
        <span
          className={`text-sm font-semibold px-2 py-1 rounded ${
            connected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Receiver Input */}
      <div className="mb-2 flex gap-2">
        <input
          className="border border-gray-300 px-3 py-2 w-full rounded"
          placeholder="Enter receiver's username"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
        />
        <button
          onClick={connectSocket}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 border border-gray-300 overflow-y-auto rounded p-3 bg-gray-50 mb-2">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 px-3 py-2 rounded-lg max-w-xs break-words ${
              msg.type === "sent"
                ? "bg-green-500 text-white self-end ml-auto"
                : "bg-gray-200 text-black self-start mr-auto"
            }`}
          >
            {msg.sender && (
              <span className="text-xs font-semibold block text-gray-500">
                {msg.sender}
              </span>
            )}
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex">
        <input
          className="border border-gray-300 px-3 py-2 flex-1 rounded-l"
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

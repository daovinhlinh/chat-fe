import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { messageRoute } from "../utils/APIRoutes";
import { request } from "../utils/request";

export default function ChatContainer({
  chatId,
  recipient,
  currentUser,
  socket,
}) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    if (chatId) {
      getChatData();
    } else {
      setMessages([]);
    }
  }, [chatId]);

  const getChatData = async () => {
    const chatData = await request.get(`${messageRoute}/${chatId}`);
    console.log(chatData);
    if (chatData.data && chatData.data.length) {
      const newMessages = chatData.data.map((msg) => {
        return {
          fromSelf: msg.sender === currentUser.username,
          message: msg,
        };
      });
      console.log(newMessages);
      setMessages(newMessages);
    }
  };

  const handleSendMsg = async (msg) => {
    socket.emit("sendMessage", {
      sender: currentUser.username,
      recipient,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({
      fromSelf: true,
      message: {
        _id: uuidv4(),
        sender: currentUser.username,
        recipient,
        message: msg,
      },
    });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket) {
      console.log("subscribing to private chat");
      socket.on("receiveMessage", (msg) => {
        console.log("private chat", msg);
        if (msg.sender === recipient) {
          setMessages((prev) => [...prev, { fromSelf: false, message: msg }]);
        }
      });
    }

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, recipient]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="username">
        <h3>Current user: {recipient}</h3>
      </div>
      <div className="chat-messages">
        {messages.map(({ message, fromSelf }) => {
          return (
            <div ref={scrollRef} key={message._id}>
              <div className={`message ${fromSelf ? "sended" : "recieved"}`}>
                <h2 className="sender">{message.sender}</h2>
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: hidden;
  flex: 1;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .username {
    margin-top: 20px;
    h3 {
      color: white;
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    height: 100%;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      flex-direction: column;
      // align-items: flex-end;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sender {
      color: #fff;
      font-size: 0.8rem;
    }
    .sended {
      align-items: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      align-items: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;

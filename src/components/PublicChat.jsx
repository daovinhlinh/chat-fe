import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { messageRoute } from "../utils/APIRoutes";
import { request } from "../utils/request";
import ChatInput from "./ChatInput";

export default function PublicChat({ currentUser, socket, onClickUser }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const listRef = useRef();
  const [currPage, setCurrPage] = useState(1); // storing current page number
  const [prevPage, setPrevPage] = useState(0); // storing prev page number
  const [userList, setUserList] = useState([]); // storing list
  const [wasLastList, setWasLastList] = useState(false); // setting a flag to know the last list
  const firstUpdate = useRef(true);

  const getChatHistory = async () => {
    const { data } = await request.get(
      `${messageRoute}/getAll?page=${currPage}&limit=100`
    );
    if (data && data.length) {
      const newMessages = data.map((msg) => {
        return {
          fromSelf: msg.sender === currentUser.username,
          message: msg,
        };
      });
      setPrevPage(currPage);

      setMessages((prev) => [...prev, ...newMessages]);
    } else {
      setWasLastList(true);
    }
  };

  const handleSendMsg = async (msg) => {
    socket.emit("sendPublicMessage", {
      sender: currentUser.username,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({
      fromSelf: true,
      message: {
        _id: uuidv4(),
        sender: currentUser.username,
        message: msg,
        createdAt: new Date().toISOString(),
      },
    });
    setMessages(msgs);
  };

  const handleClickUser = (sender) => {
    if (sender !== currentUser.username) {
      onClickUser({
        recipient: sender,
      });
    }
  };

  const onScroll = () => {
    if (listRef.current) {
      const { scrollTop } = listRef.current;
      if (firstUpdate.current) {
        if (scrollTop == 1) {
          firstUpdate.current = false;
        }
        return;
      }
      if (
        !firstUpdate.current &&
        scrollTop < 300 &&
        !wasLastList &&
        prevPage === currPage &&
        currentUser
      ) {
        setCurrPage(currPage + 1);
      }
    }
  };

  useEffect(() => {
    if (!wasLastList && prevPage !== currPage && currentUser) {
      getChatHistory();
    }
  }, [currPage, wasLastList, prevPage, userList, currentUser]);

  useEffect(() => {
    if (socket) {
      socket.on("receivePublicMessage", (msg) => {
        setMessages((prev) => [...prev, { fromSelf: false, message: msg }]);
      });

      return () => {
        socket.off("receivePublicMessage");
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-messages" ref={listRef} onScroll={onScroll}>
        {messages.map(({ message, fromSelf }) => {
          return (
            <div
              // onScroll={onScroll}
              ref={scrollRef}
              key={message._id}
              style={{ cursor: "pointer" }}
              onClick={() => handleClickUser(message.sender)}
            >
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
  height: 100%;
  flex-direction: column;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  // @media screen and (min-width: 720px) and (max-width: 1080px) {
  //   grid-template-rows: 15% 70% 15%;
  // }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    overflow: auto;
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
      align-items: flex-end;
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

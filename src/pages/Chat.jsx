import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import styled from "styled-components";
import {
  allUsersRoute,
  chatRoute,
  host,
  messageRoute,
} from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import PublicChat from "../components/PublicChat";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { request } from "../utils/request";
import Logout from "../components/Logout";

export default function Chat() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [socket, setSocket] = useState(undefined);
  const [username, setUsername] = useState("");
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      } else {
        const user = await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        );
        if (user) {
          const chats = await request.get(`${chatRoute}/getAll`);
          console.log(chats);
          if (chats && chats.data.length > 0) {
            // return chat array with this format: [id: chat.id, recipient: get from chat.members but with the id different from the current user id]
            const chatArray = chats.data.map((chat) => {
              const recipient = chat.members.find(
                (member) => member !== user.username
              );
              return { id: chat._id, recipient };
            });
            setContacts(chatArray);
          }
          setCurrentUser(user);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (currentUser) {
      console.log(currentUser);
      const socketConnection = io(process.env.REACT_APP_WS_SOCKET, {
        query: { username: currentUser.username },
        auth: {
          token: currentUser.accessToken,
        },
      });

      socketConnection.on("connect", () => {
        console.log("Connected to socket");
        socketConnection.emit("connectSocket", {
          username: currentUser.username,
        });
        setSocket(socketConnection);

        socketConnection.on("newChat", (chat) => {
          console.log("new chat", chat);
          //check if contacts already have the recipient
          const isExist = contacts.find((contact) => contact.id === chat.id);
          if (!isExist) {
            const recipient = chat.members.find(
              (member) => member !== currentUser.username
            );

            const newChat = { id: chat._id, recipient };

            setContacts((prev) => [...prev, newChat]);
            return;
          }

          // Check if user have create a new chat
          const isNewChat = contacts.find(
            (contact) =>
              contact.recipient === chat.recipient && contact.id == null
          );
          console.log({ isNewChat });
          if (isNewChat) {
            console.log("new chat", chat);
            // Update id to current chat
            setCurrentChat({
              id: chat.id,
              recipient: chat.recipient,
            });
            setContacts((prev) =>
              prev.map((contact) =>
                contact.recipient === chat.recipient
                  ? { ...contact, id: chat.id }
                  : contact
              )
            );
          }
        });
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser]);

  const handleUsernameSubmit = (event) => {
    event.preventDefault();
    const recipient = event.target.username.value;
    if (
      event.target.username.value !== "" &&
      event.target.username.value !== currentUser.username
    ) {
      const currentContact = contacts.find(
        (contact) => contact.recipient === recipient && contact.id != null
      );

      setCurrentChat(currentContact ? currentContact : { id: null, recipient });
    }
  };

  const handleChatChange = async (chat) => {
    if (tabIndex === 0) {
      // get if current recipient is in contacts
      const currentContact = contacts.find(
        (contact) => contact.recipient === chat.recipient
      );
      if (currentContact) {
        setCurrentChat(currentContact);
      } else {
        setCurrentChat({
          id: null,
          recipient: chat.recipient,
        });
      }
      setTabIndex(1);

      return;
    }
    setCurrentChat(chat);
  };

  return (
    <>
      <Container>
        <Logout />
        {currentUser && (
          <h1 className="current-user">Welcome, {currentUser.username}</h1>
        )}
        <div className="container">
          <Tabs
            forceRenderTabPanel={true}
            className="container-tab"
            selectedIndex={tabIndex}
            onSelect={setTabIndex}
          >
            <TabList className="tab-list">
              <Tab className={`tab ${tabIndex === 0 && "active-tab"}`}>
                Chat tổng
              </Tab>
              <Tab className={`tab ${tabIndex === 1 && "active-tab"}`}>
                Chat riêng
              </Tab>
            </TabList>
            <TabPanel
              className="tab-panel"
              style={{
                display: tabIndex === 0 ? "flex" : "none",
              }}
            >
              <PublicChat
                socket={socket}
                currentUser={currentUser}
                onClickUser={handleChatChange}
              />
            </TabPanel>
            <TabPanel
              className="tab-panel"
              style={{
                display: tabIndex === 1 ? "flex" : "none",
              }}
            >
              <Contacts
                contacts={contacts}
                changeChat={handleChatChange}
                currentUser={currentUser}
              />
              {/* write input to enter username to connect to socket */}
              <form onSubmit={handleUsernameSubmit}>
                <label className="form-title" htmlFor="username">
                  New chat
                </label>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter username"
                />
                <button type="submit">Connect</button>
              </form>
              {currentChat && (
                <ChatContainer
                  chatId={currentChat.id}
                  recipient={currentChat.recipient}
                  currentUser={currentUser}
                  socket={socket}
                />
              )}
            </TabPanel>
          </Tabs>

          {/* {currentChat === undefined ? (
            <Welcome />
          ) : (
            <>
              <ChatContainer currentChat={currentChat} socket={socket} />
            </>
          )} */}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .current-user {
    color: white;
  }
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: flex;
    flex-direction: row;
    // grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
  .form-title {
    color: white;
    margin-right: 10px;
  }
  .tab-list {
    display: flex;
    width: 100%;
    background-color: gray;
  }
  .container-tab {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
  }
  .tab {
    color: black;
    text-align: center;
    flex: 1;
    padding: 16px 0;
    align-items: center;
    justify-content: center;
  }
  .active-tab {
    background-color: white;
    display: block;
  }
  .tab-panel {
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }
`;

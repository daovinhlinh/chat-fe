import React, { useState } from "react";
import styled from "styled-components";

export default function Contacts({ contacts, changeChat }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <Container>
      <h1 className="contact-title">Danh sách liên hệ</h1>
      <div className="contact-list">
        {contacts.map((contact, index) => {
          return (
            <div
              key={contact.id}
              className={`contact ${
                index === currentSelected ? "selected" : ""
              }`}
              onClick={() => changeCurrentChat(index, contact)}
            >
              <h3 style={{ color: "white" }}>{contact.recipient}</h3>
            </div>
          );
        })}
      </div>
    </Container>
  );

  // return (
  //   <>
  //     {currentUserImage && currentUserImage && (
  //       <Container>
  //         <div className="brand">
  //           <img src={Logo} alt="logo" />
  //           <h3>snappy</h3>
  //         </div>
  //         <div className="contacts">
  //           {contacts.map((contact, index) => {
  //             return (
  //               <div
  //                 key={contact._id}
  //                 className={`contact ${
  //                   index === currentSelected ? "selected" : ""
  //                 }`}
  //                 onClick={() => changeCurrentChat(index, contact)}
  //               >
  //                 <div className="avatar">
  //                   <img
  //                     src={`data:image/svg+xml;base64,${contact.avatarImage}`}
  //                     alt=""
  //                   />
  //                 </div>
  //                 <div className="username">
  //                   <h3>{contact.username}</h3>
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //         <div className="current-user">
  //           <div className="avatar">
  //             <img
  //               src={`data:image/svg+xml;base64,${currentUserImage}`}
  //               alt="avatar"
  //             />
  //           </div>
  //           <div className="username">
  //             <h2>{currentUserName}</h2>
  //           </div>
  //         </div>
  //       </Container>
  //     )}
  //   </>
  // );
}
const Container = styled.div`
  border-bottom: 1px solid #ffffff39;
  margin-bottom: 10px;
  .contact-title {
    color: #fff;
    text-align: center;
  }
  .contact-list {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    column-gap: 10px;
    padding: 10px;
    overflow: auto;
  }
  .username {
    color: #fff;
  }
  .contact {
    cursor: pointer;
    padding: 10px;
    border-radius: 5px;
    background-color: #ffffff34;
    transition: 0.5s ease-in-out;
    &:hover {
      background-color: #9a86f3;
    }
  }

  .selected {
    background-color: #9a86f3;
  }

  // .brand {
  //   display: flex;
  //   align-items: center;
  //   gap: 1rem;
  //   justify-content: center;
  //   img {
  //     height: 2rem;
  //   }
  //   h3 {
  //     color: white;
  //     text-transform: uppercase;
  //   }
  // }
  // .contacts {
  //   display: flex;
  //   flex-direction: column;
  //   align-items: center;
  //   overflow: auto;
  //   gap: 0.8rem;
  //   &::-webkit-scrollbar {
  //     width: 0.2rem;
  //     &-thumb {
  //       background-color: #ffffff39;
  //       width: 0.1rem;
  //       border-radius: 1rem;
  //     }
  //   }
  //   .contact {
  //     background-color: #ffffff34;
  //     min-height: 5rem;
  //     cursor: pointer;
  //     width: 90%;
  //     border-radius: 0.2rem;
  //     padding: 0.4rem;
  //     display: flex;
  //     gap: 1rem;
  //     align-items: center;
  //     transition: 0.5s ease-in-out;
  //     .avatar {
  //       img {
  //         height: 3rem;
  //       }
  //     }
  //     .username {
  //       h3 {
  //         color: white;
  //       }
  //     }
  //   }
  //   .selected {
  //     background-color: #9a86f3;
  //   }
  // }

  // .current-user {
  //   background-color: #0d0d30;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   gap: 2rem;
  //   .avatar {
  //     img {
  //       height: 4rem;
  //       max-inline-size: 100%;
  //     }
  //   }
  //   .username {
  //     h2 {
  //       color: white;
  //     }
  //   }
  //   @media screen and (min-width: 720px) and (max-width: 1080px) {
  //     gap: 0.5rem;
  //     .username {
  //       h2 {
  //         font-size: 1rem;
  //       }
  //     }
  //   }
  // }
`;

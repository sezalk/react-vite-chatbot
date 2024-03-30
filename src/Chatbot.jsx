import React, { useState, useEffect } from 'react';

const ChatMessage = ({ message }) => {
  const { text, incoming } = message;

  return (
    <li className={`chat ${incoming ? 'incoming' : 'outgoing'}`}>
      <span className="material-symbols-outlined">{incoming ? 'smart_toy' : ''}</span>
      <p>{text}</p>
    </li>
  );
};

const ChatInput = ({ onMessageSend }) => {
  const [inputValue, setInputValue] = useState('');
  const inputInitHeight = 20; // Initial height of the input

  useEffect(() => {
    const handleInput = () => {
      const chatInput = document.querySelector(".chat-input textarea");
      if (chatInput) {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
      }
    };
  
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleMessageSubmit(e);
      }
    };
  
    const handleMessageSubmit = (e) => {
      e.preventDefault();
      if (inputValue.trim() === '') return;
      onMessageSend(inputValue.trim());
      setInputValue('');
    };
  
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.getElementById("send-btn");
  
    if (chatInput) {
      chatInput.addEventListener("input", handleInput);
      chatInput.addEventListener("keydown", handleKeyDown);
    }
  
    if (sendChatBtn) {
      sendChatBtn.addEventListener("click", handleMessageSubmit);
    }
  
    return () => {
      if (chatInput) {
        chatInput.removeEventListener("input", handleInput);
        chatInput.removeEventListener("keydown", handleKeyDown);
      }
      if (sendChatBtn) {
        sendChatBtn.removeEventListener("click", handleMessageSubmit);
      }
    };
  }, [inputInitHeight, inputValue, onMessageSend]);
  

  return (
    <form className="chat-input">
      <textarea
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder="Enter a message..."
        spellCheck={false}
        required
      ></textarea>
      <span id="send-btn" class="material-symbols-rounded">send</span>
    </form>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    // Initial messages
    { id: 1, text: "Hi there 👋\nHow can I help you today?", incoming: true }
  ]);

  const handleMessageSend = async (messageText) => {
    const botResponse = await generateResponse(messageText);
    setMessages(prevMessages => [
      ...prevMessages,
      { id: prevMessages.length + 1, text: messageText, incoming: false },
      { id: prevMessages.length + 2, text: botResponse, incoming: true }
    ]);
  };

  const generateResponse = async (userMessage) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    
    
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_PUBLIC_API_KEY}` // Ensure you have your API key set as an environment variable
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: userMessage }],
      })

    };
    
    try {
      const response = await fetch(API_URL, requestOptions);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      return botResponse;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return "Oops! Something went wrong. Please try again.";
    }
  };

  const toggleChatbot = () => {
    document.body.classList.toggle("show-chatbot");
  };


  return (
    <div>
      <div className="chatbot">
        <header>
          <h2>Chatbot</h2>
          <span className="close-btn material-symbols-outlined" onClick={toggleChatbot}>close</span>
        </header>
        <ul className="chatbox">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </ul>
        <ChatInput onMessageSend={handleMessageSend} />
      </div>
      <button className="chatbot-toggler" onClick={toggleChatbot}><span className="material-symbols-rounded">mode_comment</span>
      <span className="material-symbols-outlined">close</span></button>
    </div>
  );
};

export default Chatbot;

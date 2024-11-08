import React, { useEffect, useState, useRef } from 'react';
import { IoSend } from "react-icons/io5";
import Message from '../../components/Message';
import NoChat from '../../components/NoChat';
import axios from 'axios'
import { addMessageEndpoint, deleteChatsEndpoint, geminiApi, getMessagesEndpoint } from '../../APIRoutes/index.js';

const Chat = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const messageEndRef = useRef(null);
    console.log(user);

    const [loading, setLoading] = useState(false);
    const sendMessageHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const apiUrl = `${geminiApi}=${import.meta.env.VITE_API_KEY}`
            const response = await axios.post(apiUrl, {
                "contents": [{
                    "parts": [{
                        "text": `${import.meta.env.VITE_PROMPT} ${input}`
                    }]
                }]
            });
            console.log(response);
            if (response.data.candidates) {
                const message = {
                    userId: user._id,
                    question: input,
                    answer: response.data.candidates[0].content.parts[0].text
                }
                const dataResponse = await axios.post(addMessageEndpoint, message, { withCredentials: true });
                console.log(dataResponse)
                if (dataResponse.data.success) {
                    setMessages(prevMessages => [...prevMessages, dataResponse.data.addedMessage]); // Use the previous state to update messages
                    setInput("");
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    // Scroll to the bottom of the message container whenever messages change
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleDeleteChat = async () => {
        try {
            const response = await axios.delete(deleteChatsEndpoint, {
                headers: {
                    userid: user._id
                },
                withCredentials: true
            });
            if (response.data.success) {
                setMessages([]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='flex w-full h-screen'>
            {/* Main Chat Section */}
            <div className='w-full flex flex-col h-full'>
                <div className='flex justify-start'>
                    <button className='px-2 py-2 mx-2 my-2 text-black font-bold rounded-md' onClick={handleDeleteChat}>Delete Chats</button>
                </div>
                {/* Message List */}
                {
                    messages.length === 0 ? (
                        <NoChat />
                    ) : (
                        <div className='flex-1 overflow-y-auto w-full flex flex-col items-start px-4 py-4'>
                            {messages.map((message, index) => (
                                <Message key={index} question={message.question} answer={message.answer} />
                            ))}
                            {/* Add a div to scroll into view */}
                            <div ref={messageEndRef} />
                        </div>
                    )
                }

                {/* Input Box */}
                <div className='flex justify-center items-center w-full'>
                    <form className='w-full flex gap-2 px-4 py-2 rounded-lg' onSubmit={sendMessageHandler}>
                        <input
                            type="text"
                            placeholder="Type a message"
                            className='w-full px-4 py-4 rounded outline-none'
                            value={input}
                            onChange={event => setInput(event.target.value)}
                            required
                        />
                        <button type="submit" className='px-2 py-2 text-3xl'>
                            <IoSend />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
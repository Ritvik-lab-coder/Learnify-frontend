import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  VStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  useToast,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { IoSend, IoTrash } from "react-icons/io5";
import axios from 'axios';
import { addMessageEndpoint, deleteChatsEndpoint, geminiApi } from '../../APIRoutes/index.js';
import { IoPersonCircle } from 'react-icons/io5';
import { BsRobot } from 'react-icons/bs';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const Message = ({ message }) => (
  <>
    {/* User's Question (on the right) */}
    <Flex mb={4} direction="column" align="flex-end">
      <Flex justify="flex-end">
        <IoPersonCircle size={24} color="gray" />
        <Box
          maxW="60%"
          minW="250px"
          bg="gray.100"
          p={3}
          borderRadius="lg"
          textAlign="left"
          mb={2}
          ml={3}  // Adds space between the icon and message
          wordBreak="break-word"  // Ensures the text wraps when too long
        >
          <Text>{message.question}</Text>
        </Box>
      </Flex>
    </Flex>

    {/* AI's Answer (on the left) */}
    <Flex mb={4} direction="column" align="flex-start">
      <Flex justify="flex-start">
        <BsRobot size={24} color="blue" />
        <Box
          maxW="60%"
          minW="250px"  // Ensures the box doesn't shrink too much
          bg="blue.100"
          p={3}
          borderRadius="lg"
          textAlign="left"
          ml={3}  // Adds space between the icon and message
          wordBreak="break-word"  // Ensures the text wraps when too long
        >
          {/* Render the AI's answer as Markdown */}
          <Markdown remarkPlugins={[remarkGfm]}>{message.answer}</Markdown>
        </Box>
      </Flex>
    </Flex>
  </>
);


const NoChat = () => (
  <Flex justify="center" align="center" h="full">
    <Text fontSize="xl" color="gray.500">No messages yet. Start a conversation!</Text>
  </Flex>
);

const Chat = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const sendMessageHandler = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const apiUrl = `${geminiApi}=${import.meta.env.VITE_API_KEY}`;
      const response = await axios.post(apiUrl, {
        "contents": [{
          "parts": [{
            "text": `${import.meta.env.VITE_PROMPT} ${input}`
          }]
        }]
      });
      
      if (response.data.candidates) {
        const message = {
          userId: user._id,
          question: input,
          answer: response.data.candidates[0].content.parts[0].text
        };
        const dataResponse = await axios.post(addMessageEndpoint, message, { withCredentials: true });
        
        if (dataResponse.data.success) {
          setMessages(prevMessages => [...prevMessages, dataResponse.data.addedMessage]);
          setInput("");
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = async () => {
    try {
      const response = await axios.delete(deleteChatsEndpoint, {
        headers: {
          userid: user._id
        },
        withCredentials: true
      });
      if (response.data.success) {
        setMessages([]);
        toast({
          title: "Chat Cleared",
          description: "All messages have been cleared.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    
      <Card  w="full" h="90vh" boxShadow="xl" borderRadius="lg">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="lg">Chatbot</Heading>
            <Button
              leftIcon={<IoTrash />}
              colorScheme="red"
              variant="ghost"
              onClick={handleClearChat}
              size="sm"
            >
              Clear Chat
            </Button>
          </Flex>
        </CardHeader>

        <CardBody overflowY="auto">
          <VStack spacing={4} align="stretch">
            {messages.length === 0 ? (
              <NoChat />
            ) : (
              messages.map((message, index) => (
                <Message key={index} message={message} />
              ))
            )}
            <div ref={messageEndRef} />
          </VStack>
        </CardBody>

        <CardFooter>
          <form onSubmit={sendMessageHandler} style={{ width: '100%' }}>
            <Flex>
              <Input
                flex={1}
                mr={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                disabled={loading}
              />
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Sending"
                leftIcon={loading ? <Spinner size="sm" /> : <IoSend />}
              >
                Send
              </Button>
            </Flex>
          </form>
        </CardFooter>
      </Card>
    
  );
};

export default Chat;
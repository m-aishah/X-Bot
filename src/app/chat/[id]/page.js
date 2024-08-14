'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Paper, IconButton, Drawer, Card, CardContent } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MicIcon from '@mui/icons-material/Mic';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, getDoc } from 'firebase/firestore';
import { generateChatResponse } from '@/lib/openrouter';

export default function ChatInterface() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [chatbot, setChatbot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [theme, setTheme] = useState({
    primaryColor: '#3f51b5',
    fontSize: 16,
    borderRadius: 4,
  });

  useEffect(() => {
    const fetchChatbot = async () => {
      const docRef = doc(db, "chatbots", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setChatbot(data);
        setTheme(data.theme || theme);
      } else {
        console.log("No such chatbot!");
        router.push('/dashboard');
      }
    };

    const fetchConversations = async () => {
      const q = query(
        collection(db, "conversations"),
        where("chatbotId", "==", id),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setConversations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchChatbot();
    fetchConversations();
  }, [id, currentUser, router, theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const response = await generateChatResponse(chatbot.systemPrompt, updatedMessages, chatbot.selectedModel);
      const botMessage = { role: 'assistant', content: response };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // Save the conversation
      const conversationRef = await addDoc(collection(db, "conversations"), {
        chatbotId: id,
        userId: currentUser.uid,
        messages: finalMessages,
        createdAt: serverTimestamp(),
        name: `Conversation ${conversations.length + 1}`, // Default name
      });

      // Update local state
      setConversations([
        { id: conversationRef.id, name: `Conversation ${conversations.length + 1}`, createdAt: new Date() },
        ...conversations,
      ]);

    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
    }
    setDrawerOpen(false);
  };

  const handleVoiceInput = () => {
    // Implement voice recognition here
    console.log("Voice input not implemented yet");
  };

  const handleAttachment = () => {
    // Implement attachment functionality here
    console.log("Attachment functionality not implemented yet");
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f5f5' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: theme.primaryColor, color: 'white' }}>
        <IconButton color="inherit" onClick={() => router.push('/dashboard')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">{chatbot?.name}</Typography>
        <IconButton color="inherit" onClick={() => setDrawerOpen(!drawerOpen)}>
          <MenuIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ overflow: 'auto', mt: 8, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Conversations
            </Typography>
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                onClick={() => loadConversation(conversation.id)}
                sx={{ display: 'block', mb: 1, textAlign: 'left' }}
              >
                {conversation.name || new Date(conversation.createdAt.toDate()).toLocaleString()}
              </Button>
            ))}
          </Box>
        </Drawer>
        <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Card sx={{ flexGrow: 1, overflow: 'auto', mb: 2, maxWidth: 800, width: '100%', mx: 'auto' }}>
            <CardContent>
              {messages.map((message, index) => (
                <Box key={index} sx={{ mb: 2, textAlign: message.role === 'user' ? 'right' : 'left' }}>
                  <Paper sx={{ 
                    display: 'inline-block', 
                    p: 1, 
                    maxWidth: '70%', 
                    bgcolor: message.role === 'user' ? theme.primaryColor : '#f5f5f5',
                    color: message.role === 'user' ? 'white' : 'black',
                    borderRadius: theme.borderRadius,
                    fontSize: theme.fontSize,
                  }}>
                    <Typography>{message.content}</Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
          </Card>
          <Box sx={{ display: 'flex', maxWidth: 800, width: '100%', mx: 'auto' }}>
            <IconButton onClick={handleAttachment}>
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={handleVoiceInput}>
              <MicIcon />
            </IconButton>
            <IconButton color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
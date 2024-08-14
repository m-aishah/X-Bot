'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Typography, Paper, TextField, Button, Slider, Select, MenuItem,
  FormControl, InputLabel, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { generateChatResponse } from '@/lib/openrouter';

export default function ChatbotPreview({ params }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [chatbot, setChatbot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [theme, setTheme] = useState({
    primaryColor: '#3f51b5',
    fontSize: 16,
    borderRadius: 4,
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const fetchChatbot = async () => {
      const docRef = doc(db, "chatbots", params.id);
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

    fetchChatbot();
  }, [currentUser, router, params.id, theme]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage = { role: 'user', content: inputMessage };
    setMessages([...messages, newMessage]);
    setInputMessage('');

    try {
      const response = await generateChatResponse(chatbot.systemPrompt, [...messages, newMessage]);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "I'm sorry, I'm having trouble responding right now." }]);
    }
  };

  const handleThemeChange = (property, value) => {
    setTheme(prevTheme => ({ ...prevTheme, [property]: value }));
  };

  const updateChatbotTheme = async () => {
    try {
      await updateDoc(doc(db, "chatbots", params.id), { theme });
      console.log("Chatbot theme updated successfully");
      router.push(`/dashboard`);
    } catch (error) {
      console.error("Error updating chatbot theme:", error);
    }
  };

  if (!chatbot) return <Typography>Loading...</Typography>;

  return (
    <Layout>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          <Typography variant="h4" gutterBottom>
            {chatbot.name} Preview
          </Typography>
          <Paper 
            elevation={3} 
            sx={{ 
              height: 'calc(100% - 100px)', 
              p: 2, 
              backgroundColor: theme.primaryColor + '10',
              borderRadius: theme.borderRadius,
              overflowY: 'auto',
            }}
          >
            {messages.map((message, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 2, 
                  textAlign: message.role === 'user' ? 'right' : 'left',
                }}
              >
                <Paper 
                  elevation={1} 
                  sx={{ 
                    display: 'inline-block', 
                    p: 1, 
                    maxWidth: '70%',
                    backgroundColor: message.role === 'user' ? theme.primaryColor : '#f5f5f5',
                    color: message.role === 'user' ? 'white' : 'black',
                    borderRadius: theme.borderRadius,
                    fontSize: theme.fontSize,
                  }}
                >
                  {message.content}
                </Paper>
              </Box>
            ))}
          </Paper>
          <Box sx={{ display: 'flex', mt: 2 }}>
            <IconButton>
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              variant="outlined"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <IconButton>
              <MicIcon />
            </IconButton>
            <IconButton onClick={handleSendMessage} sx={{ color: theme.primaryColor }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ width: 300, p: 2, borderLeft: '1px solid #e0e0e0' }}>
          <Typography variant="h6" gutterBottom>
            Chatbot Settings
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Primary Color</InputLabel>
            <Select
              value={theme.primaryColor}
              onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
            >
              <MenuItem value="#3f51b5">Blue</MenuItem>
              <MenuItem value="#f44336">Red</MenuItem>
              <MenuItem value="#4caf50">Green</MenuItem>
              <MenuItem value="#ff9800">Orange</MenuItem>
            </Select>
          </FormControl>
          <Typography gutterBottom>Font Size</Typography>
          <Slider
            value={theme.fontSize}
            min={12}
            max={24}
            step={1}
            onChange={(_, value) => handleThemeChange('fontSize', value)}
            valueLabelDisplay="auto"
          />
          <Typography gutterBottom>Border Radius</Typography>
          <Slider
            value={theme.borderRadius}
            min={0}
            max={20}
            step={1}
            onChange={(_, value) => handleThemeChange('borderRadius', value)}
            valueLabelDisplay="auto"
          />
          <Button 
            variant="contained" 
            onClick={updateChatbotTheme} 
            sx={{ mt: 2 }}
          >
            Save Theme
          </Button>
        </Box>
      </Box>
    </Layout>
  );
}
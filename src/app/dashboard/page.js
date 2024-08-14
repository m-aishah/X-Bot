'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Typography, Grid, Box, IconButton, Tooltip, CircularProgress, Alert,
  Card, CardContent, CardMedia, CardActions, Paper
} from '@mui/material';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Edit, Chat, Add } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: 140,
  justifyContent: 'space-between',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

export default function Dashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const fetchChatbots = async () => {
      try {
        const q = query(collection(db, "chatbots"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedChatbots = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          conversations: doc.data().conversations || 0,
          avgRating: doc.data().avgRating || 0,
          isActive: doc.data().isActive || false,
        }));
        setChatbots(fetchedChatbots);
      } catch (err) {
        console.error("Error fetching chatbots:", err);
        setError("Failed to fetch chatbots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatbots();
  }, [currentUser, router]);

  const columns = [
    { field: 'name', headerName: 'Chatbot Name', flex: 1, minWidth: 150 },
    { field: 'conversations', headerName: 'Total Conversations', width: 180, type: 'number' },
    { field: 'avgRating', headerName: 'Avg. Rating', width: 130, type: 'number'},
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <StyledIconButton size="small" onClick={() => router.push(`/edit-bot/${params.row.id}`)}>
              <Edit />
            </StyledIconButton>
          </Tooltip>
          <Tooltip title="Chat">
            <StyledIconButton size="small" onClick={() => router.push(`/chat/${params.row.id}`)}>
              <Chat />
            </StyledIconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const StatCard = ({ title, value, color }) => (
    <StyledPaper elevation={2}>
      <Typography variant="h6" color={color}>
        {title}
      </Typography>
      <Typography variant="h3" component="div">
        {value}
      </Typography>
    </StyledPaper>
  );

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ maxWidth: 1200, margin: '0 auto', mt: 4, p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ maxWidth: 1200, margin: '0 auto', mt: 4, p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Your Chatbots
        </Typography>
        
        <Grid container spacing={4}>
          {chatbots.map((chatbot) => (
            <Grid item key={chatbot.id} xs={12} sm={6} md={4}>
              <StyledCard>
                <CardMedia
                  component="img"
                  height="140"
                  image={chatbot.imageUrl || '/default-chatbot-image.jpg'}
                  alt={chatbot.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {chatbot.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {chatbot.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Edit">
                    <StyledIconButton size="small" onClick={() => router.push(`/edit-bot/${chatbot.id}`)}>
                      <Edit />
                    </StyledIconButton>
                  </Tooltip>
                  <Tooltip title="Chat">
                    <StyledIconButton size="small" onClick={() => router.push(`/chat/${chatbot.id}`)}>
                      <Chat />
                    </StyledIconButton>
                  </Tooltip>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        <Tooltip title="Create New Chatbot">
          <IconButton 
            color="primary" 
            size="large"
            onClick={() => router.push('/create-bot')}
            sx={{ 
              position: 'fixed', 
              bottom: 32, 
              right: 32,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <Add />
          </IconButton>
        </Tooltip>
      </Box>
    </Layout>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Container, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { EmojiObjects, Brush, Memory } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  padding: theme.spacing(15, 0),
  color: 'white',
}));

const FeatureCard = styled(motion.div)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const features = [
  { title: 'Easy to Use', description: 'Intuitive interface for quick setup', icon: EmojiObjects },
  { title: 'Customizable', description: 'Tailor your chatbot to your brand', icon: Brush },
  { title: 'AI-Powered', description: 'Leverage advanced language models', icon: Memory },
];

const chatbotTypes = ['Customer Support', 'Sales', 'FAQ', 'Personal Assistant'];

const AnimatedText = ({ words }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [words]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};

export default function LandingPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (currentUser) {
      router.push('/create-bot');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <Layout>
      <HeroSection>
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            gutterBottom
          >
            Create Your Own{' '}
            <AnimatedText words={chatbotTypes} />
            {' '}Chatbot
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Build, customize, and deploy your own AI-powered chatbot in minutes. No coding required!
          </Typography>
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </HeroSection>

      <Container sx={{ py: 12 }} maxWidth="lg">
        <Grid container spacing={6}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <FeatureCard
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <feature.icon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1">{feature.description}</Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
}
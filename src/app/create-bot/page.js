'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Stepper, Step, StepLabel, Button, Typography, Box, TextField, 
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Paper, CircularProgress, Card, CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateSystemPrompt, generateImage } from '@/lib/openrouter';

const steps = ['Basic Info', 'Personality', 'Knowledge Base', 'Review'];

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[3],
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export default function CreateBot() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [botData, setBotData] = useState({
    name: '',
    description: '',
    personality: '',
    knowledgeBase: 'default',
    customFiles: []
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBotData(prevData => ({ ...prevData, [name]: value }));
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'text/*',
    onDrop: acceptedFiles => {
      setBotData(prevData => ({ 
        ...prevData, 
        customFiles: [...prevData.customFiles, ...acceptedFiles]
      }));
    }
  });

  const handleSubmit = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Upload files if any
      const uploadedUrls = await Promise.all(botData.customFiles.map(async (file) => {
        const storageRef = ref(storage, `chatbots/${currentUser.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      }));

      // Generate system prompt 
      const systemPrompt = await generateSystemPrompt(botData);

      // Generate image for the chatbot
      const imagePrompt = `A visual representation of a chatbot named ${botData.name} with ${botData.personality} personality`;
      // const imageUrl = await generateImage(imagePrompt);
      const imageUrl = 'data:image/png;base64,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';

      // Save chatbot data to Firestore
      const docRef = await addDoc(collection(db, "chatbots"), {
        userId: currentUser.uid,
        name: botData.name,
        description: botData.description,
        personality: botData.personality,
        knowledgeBase: botData.knowledgeBase,
        customFileUrls: uploadedUrls,
        systemPrompt: systemPrompt,
        imageUrl: imageUrl,
        createdAt: new Date(),
      });

      router.push(`/chatbot-preview/${docRef.id}`);
    } catch (error) {
      console.error("Error creating chatbot:", error);
      // Handle error (show error message to user)
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <StyledCard>
            <CardContent>
              <TextField
                fullWidth
                label="Chatbot Name"
                name="name"
                value={botData.name}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={botData.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={4}
              />
            </CardContent>
          </StyledCard>
        );
      case 1:
        return (
          <StyledCard>
            <CardContent>
              <TextField
                fullWidth
                label="Personality"
                name="personality"
                value={botData.personality}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={4}
                helperText="Describe the chatbot's personality (e.g., friendly, professional, humorous)"
              />
            </CardContent>
          </StyledCard>
        );
      case 2:
        return (
          <>
            <FormControl component="fieldset">
              <FormLabel component="legend">Knowledge Base</FormLabel>
              <RadioGroup
                name="knowledgeBase"
                value={botData.knowledgeBase}
                onChange={handleInputChange}
              >
                <FormControlLabel value="default" control={<Radio />} label="Default" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom" />
              </RadioGroup>
            </FormControl>
            {botData.knowledgeBase === 'custom' && (
              <Paper {...getRootProps()} sx={{ p: 2, mt: 2, textAlign: 'center', cursor: 'pointer' }}>
                <input {...getInputProps()} />
                <p>Drag & drop some files here, or click to select files</p>
                {botData.customFiles.map((file, index) => (
                  <Typography key={index}>{file.name}</Typography>
                ))}
              </Paper>
            )}
          </>
        );
      case 3:
        return (
          <>
            <Typography variant="h6">Review Your Chatbot</Typography>
            <Typography>Name: {botData.name}</Typography>
            <Typography>Description: {botData.description}</Typography>
            <Typography>Personality: {botData.personality}</Typography>
            <Typography>Knowledge Base: {botData.knowledgeBase}</Typography>
            {botData.customFiles.length > 0 && (
              <>
                <Typography>Custom Files:</Typography>
                {botData.customFiles.map((file, index) => (
                  <Typography key={index}>{file.name}</Typography>
                ))}
              </>
            )}
          </>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 800, margin: '0 auto', mt: 4, p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Create a New Chatbot
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          {activeStep > 0 && (
            <StyledButton onClick={handleBack} variant="outlined">
              Back
            </StyledButton>
          )}
          {activeStep < steps.length - 1 ? (
            <StyledButton variant="contained" onClick={handleNext}>
              Next
            </StyledButton>
          ) : (
            <StyledButton variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create Chatbot'}
            </StyledButton>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
import OpenAI from "openai"

// const OPENROUTER_API_KEY = 'your-openrouter-api-key';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: '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',
    dangerouslyAllowBrowser: true
});

export const generateSystemPrompt = async (botData) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant that generates system prompts/instructions for chatbots.' },
        { role: 'user', content: `Generate a system prompt for a chatbot with the following details:
          Name: ${botData.name}
          Description: ${botData.description}
          Personality: ${botData.personality}
          Knowledge Base: ${botData.knowledgeBase}` }
      ]
    });
    console.log(response.choices[0].message.content)
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
};

export const generateChatResponse = async (systemPrompt, messages) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  };

  // Function to generate images
export const generateImage = async (imagePrompt) => {
    try {
      const response = await openai.images.create({
        model: 'dalle-2',  // Replace with the correct model if needed
        prompt: imagePrompt,
        n: 1, // Number of images to generate
        size: '1024x1024' // Image size (optional)
      });
      console.log(response.data[0].url);
      return response.data[0].url; // Return the URL of the generated image
    } catch (error) {
      console.error('Error generating image with OpenRouter API:', error);
      throw error;
    }
  };
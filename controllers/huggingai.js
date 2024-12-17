const express = require('express');
const Chat = require('../models/chat');
const axios = require('axios');  // Sử dụng axios để gọi API
const router = express.Router();

router.post('/', async (req, res) => {
  const { prompt, userId } = req.body;  // Lấy prompt và userId từ request

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = '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'; 

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2', 
      { inputs: prompt },  // Gửi prompt vào API
      {
        headers: {
          Authorization: `Bearer ${apiKey}`, 
        },
      }
    );

    const reply = response.data[0].generated_text;  


    const chat = new Chat({
      userId: userId,  // Lưu userId
      message: prompt,
      reply: reply,
    });

    await chat.save();

    return res.json({ response: reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find(); 
    return res.json(chats);  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedChat = await Chat.findByIdAndDelete(id); 
    if (!deletedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    return res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;  

  try {
    const chat = await Chat.findById(id);  
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    return res.json(chat);  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

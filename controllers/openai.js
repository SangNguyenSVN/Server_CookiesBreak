const express = require('express');
const Chat = require('../models/chat');
const openai = require('../config/openai')
const router = express.Router();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. POST - Gửi tin nhắn và lưu vào cơ sở dữ liệu
router.post('/', async (req, res) => {
  const { prompt, userId } = req.body;  // Lấy prompt và userId từ request

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  let retries = 3;  // Số lần thử lại nếu gặp lỗi rate limit
  let delayTime = 2000;  // Thời gian chờ giữa các lần thử lại (2 giây)

  while (retries > 0) {
    try {
      // Gửi yêu cầu đến OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { "type": "json_object" },
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const reply = response.choices[0].message.content;

      // Lưu cuộc trò chuyện vào cơ sở dữ liệu MongoDB
      const chat = new Chat({
        userId: userId,  // Lưu userId
        message: prompt,
        reply: reply,
      });

      // Lưu vào MongoDB
      await chat.save();

      // Trả về kết quả
      return res.json({ response: reply });
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Nếu gặp lỗi 429 (rate limit), thử lại
        console.log('Rate limit exceeded, retrying...');
        await delay(delayTime);
        retries--;
        delayTime *= 2;  // Tăng thời gian chờ giữa các lần thử
      } else {
        // Lỗi khác, trả về lỗi ngay lập tức
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  return res.status(429).json({ error: 'Rate limit exceeded, retry limit reached' });
});


// 2. GET - Lấy tất cả các cuộc trò chuyện
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find();  // Lấy tất cả các cuộc trò chuyện
    return res.json(chats);  // Trả về danh sách các cuộc trò chuyện
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. DELETE - Xóa cuộc trò chuyện theo ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;  // Lấy id từ URL

  try {
    const deletedChat = await Chat.findByIdAndDelete(id);  // Tìm và xóa cuộc trò chuyện
    if (!deletedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    return res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. FIND BY ID - Lấy cuộc trò chuyện theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;  // Lấy id từ URL

  try {
    const chat = await Chat.findById(id);  // Tìm cuộc trò chuyện theo ID
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    return res.json(chat);  // Trả về cuộc trò chuyện
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

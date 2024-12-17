require('dotenv').config();
const { OpenAI } = require('openai');  // Import OpenAIApi

// Cấu hình API Key trực tiếp
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // API Key từ file .env
});

module.exports = openai;  // Export đối tượng OpenAIApi

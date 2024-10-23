const express = require('express');
const router = express.Router();
const News = require('../models/news'); // Nhập model News
const cloudinary = require('../config/cloudinary'); // Nhập Cloudinary
const upload = require('../config/upload'); // Nhập Multer middleware

// Route lấy tất cả bài viết
router.get('/', async (req, res) => {
  try {
    const newsList = await News.find();
    res.status(200).json(newsList);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết', error });
  }
});

// Route lấy bài viết theo ID
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }
    res.status(200).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bài viết', error });
  }
});

// Route thêm bài viết mới với nhiều hình ảnh
router.post('/', upload.array('images'), async (req, res) => {
  try {
    // Lấy phần nội dung (text và image placeholders) từ body
    const sections = JSON.parse(req.body.sections);
    const imageUrls = [];

    // Xử lý upload từng hình ảnh
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path); // Upload hình ảnh lên Cloudinary
      imageUrls.push(result.secure_url); // Lưu URL của hình ảnh
    }

    // Cập nhật URL hình ảnh vào sections
    let imageIndex = 0;
    for (const section of sections) {
      if (section.type === 'image' && imageUrls[imageIndex]) {
        section.url = imageUrls[imageIndex]; // Cập nhật URL vào placeholder
        imageIndex++;
      }
    }

    const newNews = new News({
      title: req.body.title,
      sections: sections // Gán các section đã cập nhật URL hình ảnh
    });

    await newNews.save();
    res.status(201).json({ message: 'Bài viết đã được thêm', news: newNews });
  } catch (error) {
    console.error(error); // Log lỗi để kiểm tra
    res.status(500).json({ message: 'Lỗi khi thêm bài viết', error: error.message });
  }
});


// Route sửa bài viết theo ID với khả năng thêm hình ảnh mới
router.put('/:id', upload.array('images'), async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }

    const sections = JSON.parse(req.body.sections);
    const imageUrls = [];

    // Xử lý upload hình ảnh mới
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      imageUrls.push(result.secure_url);
    }

    // Cập nhật URL hình ảnh mới vào sections
    let imageIndex = 0;
    for (const section of sections) {
      if (section.type === 'image' && !section.url && imageUrls[imageIndex]) {
        section.url = imageUrls[imageIndex];
        imageIndex++;
      }
    }

    // Cập nhật thông tin bài viết
    newsItem.title = req.body.title || newsItem.title;
    newsItem.sections = sections;

    await newsItem.save();
    res.status(200).json({ message: 'Bài viết đã được cập nhật', news: newsItem });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật bài viết', error });
  }
});

// Route xóa bài viết theo ID
router.delete('/:id', async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }

    // Xóa từng ảnh trên Cloudinary nếu có
    for (const section of newsItem.sections) {
      if (section.type === 'image' && section.url) {
        const imageId = section.url.split('/').pop().split('.')[0]; // Lấy ID của ảnh từ URL
        await cloudinary.uploader.destroy(imageId);
      }
    }

    await newsItem.remove();
    res.status(200).json({ message: 'Bài viết đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa bài viết', error });
  }
});

module.exports = router;

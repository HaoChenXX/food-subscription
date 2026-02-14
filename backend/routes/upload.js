/**
 * 文件上传路由 - 支持本地上传
 */

const express = require('express');
const { query } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const { upload, handleUploadError, UPLOAD_DIR } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

// 上传图片 - 单文件
router.post('/image', authMiddleware, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '没有上传文件' });
    }
    
    const relativePath = path.relative(UPLOAD_DIR, req.file.path);
    const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
    
    // 保存上传记录到数据库
    await query(
      'INSERT INTO uploads (filename, original_name, mime_type, size, path, url, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.file.path, fileUrl, req.user.id]
    );
    
    res.json({
      message: '上传成功',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ message: '上传失败: ' + error.message });
  }
});

// 上传多张图片
router.post('/images', authMiddleware, upload.array('images', 5), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '没有上传文件' });
    }
    
    const uploadedFiles = [];
    
    for (const file of req.files) {
      const relativePath = path.relative(UPLOAD_DIR, file.path);
      const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
      
      // 保存上传记录
      await query(
        'INSERT INTO uploads (filename, original_name, mime_type, size, path, url, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [file.filename, file.originalname, file.mimetype, file.size, file.path, fileUrl, req.user.id]
      );
      
      uploadedFiles.push({
        url: fileUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      });
    }
    
    res.json({
      message: '上传成功',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('批量上传错误:', error);
    res.status(500).json({ message: '上传失败: ' + error.message });
  }
});

// 获取用户上传的文件列表
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const uploads = await query(
      'SELECT * FROM uploads WHERE uploaded_by = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(uploads);
  } catch (error) {
    console.error('获取上传列表错误:', error);
    res.status(500).json({ message: '获取上传列表失败' });
  }
});

// 删除上传的文件
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const uploads = await query('SELECT * FROM uploads WHERE id = ? AND uploaded_by = ?',
      [req.params.id, req.user.id]);
    
    if (uploads.length === 0) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    // 删除数据库记录
    await query('DELETE FROM uploads WHERE id = ?', [req.params.id]);
    
    // 删除物理文件
    const fs = require('fs');
    if (fs.existsSync(uploads[0].path)) {
      fs.unlinkSync(uploads[0].path);
    }
    
    res.json({ message: '文件已删除' });
  } catch (error) {
    console.error('删除文件错误:', error);
    res.status(500).json({ message: '删除文件失败' });
  }
});

module.exports = router;

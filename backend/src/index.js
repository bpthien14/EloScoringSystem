// src/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middleware/error');
const { connectDB } = require('./config/database');

// Khởi tạo express app
const app = express();

// Thiết lập middleware bảo mật
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api', routes);

// Xử lý 404
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Không tìm thấy đường dẫn yêu cầu' 
  });
});

// Chuyển đổi và xử lý lỗi
app.use(errorConverter);
app.use(errorHandler);

// Khởi động server
const startServer = async () => {
  try {
    // Kết nối đến MongoDB
    await connectDB();
    
    // Lắng nghe trên port từ config
    app.listen(config.port, () => {
      console.log(`Server đang chạy trên port ${config.port} ở chế độ ${config.env}`);
    });
  } catch (error) {
    console.error('Không thể khởi động server:', error);
    process.exit(1);
  }
};

startServer();
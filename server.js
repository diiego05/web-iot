const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// File để lưu danh sách vị trí
const LOCATIONS_FILE = path.join(__dirname, 'locations.json');

// Đọc danh sách vị trí từ file
let locations = [];
if (fs.existsSync(LOCATIONS_FILE)) {
  try {
    locations = JSON.parse(fs.readFileSync(LOCATIONS_FILE));
    console.log('Dữ liệu ban đầu từ locations.json:', locations);
  } catch (error) {
    console.error('Lỗi khi đọc file locations.json:', error);
  }
}

// API để lấy danh sách vị trí
app.get('/api/locations', (req, res) => {
  console.log('Nhận yêu cầu GET /api/locations');
  res.json(locations);
});

// API để thêm vị trí mới
app.post('/api/locations', (req, res) => {
  console.log('Nhận yêu cầu POST /api/locations:', req.body);
  const { label, lat, lng } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!label || typeof lat !== 'number' || typeof lng !== 'number') {
    console.log('Dữ liệu không hợp lệ:', { label, lat, lng });
    return res.status(400).json({ error: 'Thông tin vị trí không hợp lệ' });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.log('Tọa độ không hợp lệ:', { lat, lng });
    return res.status(400).json({ error: 'Tọa độ không hợp lệ' });
  }

  const newLocation = {
    id: Date.now(),
    label,
    lat,
    lng,
    timestamp: new Date().toLocaleString()
  };

  locations.push(newLocation);
  try {
    fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(locations, null, 2));
    console.log('Đã lưu vị trí mới:', newLocation);
  } catch (error) {
    console.error('Lỗi khi ghi file locations.json:', error);
    return res.status(500).json({ error: 'Không thể lưu vị trí' });
  }

  res.status(201).json(newLocation);
});

// API để xóa vị trí
app.delete('/api/locations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`Nhận yêu cầu DELETE /api/locations/${id}`);
  const index = locations.findIndex(loc => loc.id === id);
  if (index === -1) {
    console.log('Không tìm thấy vị trí với id:', id);
    return res.status(404).json({ error: 'Không tìm thấy vị trí' });
  }

  locations.splice(index, 1);
  try {
    fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(locations, null, 2));
    console.log('Đã xóa vị trí với id:', id);
  } catch (error) {
    console.error('Lỗi khi ghi file locations.json:', error);
    return res.status(500).json({ error: 'Không thể xóa vị trí' });
  }

  res.status(204).send();
});

// Serve trang HTML
app.get('/', (req, res) => {
  console.log('Phục vụ trang index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
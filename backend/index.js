const express = require('express');
const multer = require('multer');
const turf = require('@turf/turf');
const GeoTIFF = require('geotiff');
const { Client } = require('pg');
const fs = require('fs');

const app = express();
const port = 3000;

// PostgreSQL 配置
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'geodata',
  password: 'yourpassword',
  port: 5432,
};

// 设置 Multer 中间件，用于文件上传
const upload = multer({ dest: 'uploads/' });

// 解析 JSON 请求体
app.use(express.json());

// 上传多边形 GeoJSON 并处理
app.post('/process-polygon', upload.single('geotiff'), async (req, res) => {
  try {
    const geoJson = req.body; // 接收 GeoJSON 数据
    const geotiffPath = req.file.path; // 接收到的 GeoTIFF 文件路径

    // 解析 GeoTIFF 文件
    const tiffData = await fs.promises.readFile(geotiffPath);
    const tiff = await GeoTIFF.fromArrayBuffer(tiffData.buffer);
    const image = await tiff.getImage();

    const rasterBBox = image.getBoundingBox(); // 获取栅格边界
    const geoTransform = image.getGeoKeys(); // 地理坐标转换参数
    const rasterData = await image.readRasters(); // 获取栅格值

    // 检查多边形与栅格的重叠
    const polygon = turf.featureCollection([geoJson]);
    const rasterPolygon = turf.bboxPolygon(rasterBBox);
    const overlap = turf.intersect(polygon, rasterPolygon);

    if (!overlap) {
      return res.status(400).json({ message: 'Polygon does not overlap raster data' });
    }

    // 修改重叠区域中的栅格值
    const updatedRaster = rasterData[0].map((value, index) => {
      const coord = image.getOrigin(index, geoTransform);
      if (turf.booleanPointInPolygon(coord, polygon)) {
        return value + 10; // 示例：数值增加 10
      }
      return value;
    });

    // 保存修改后的 GeoTIFF
    const updatedTiffPath = 'outputs/updated.tif';
    await saveUpdatedTiff(updatedRaster, image, updatedTiffPath);

    // 存储到 PostGIS 数据库
    await saveToDatabase(dbConfig, geoJson, overlap);

    res.json({ message: 'Polygon processed successfully', updatedTiffPath });
  } catch (error) {
    console.error('Error processing polygon:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

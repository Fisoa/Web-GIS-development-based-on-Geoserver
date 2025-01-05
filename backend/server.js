const express = require('express');
const bodyParser = require('body-parser');
const GeoTIFF = require('geotiff');
const turf = require('@turf/turf');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
const port = 8080;

// PostGIS 数据库连接配置
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gis',
  password: 'yourpassword',
  port: 5432,
});

// 中间件
app.use(bodyParser.json());

// 加载 GeoTIFF 文件
const rasterPath = './data/your-raster.tif';

// 接收前端发送的多边形 GeoJSON
app.post('/api/polygon', async (req, res) => {
  try {
    const polygonGeoJSON = req.body;
    console.log('Received GeoJSON:', polygonGeoJSON);

    // 读取 GeoTIFF 文件
    const tiff = await GeoTIFF.fromFile(rasterPath);
    const image = await tiff.getImage();
    const bbox = image.getBoundingBox(); // 获取栅格边界
    const resolution = image.getResolution(); // 栅格分辨率
    console.log('GeoTIFF Bounds:', bbox);

    // 检查多边形是否与栅格重叠
    const geoBBox = turf.bboxPolygon(bbox); // 栅格边界转为 GeoJSON
    const overlap = turf.booleanIntersects(polygonGeoJSON, geoBBox);

    if (!overlap) {
      return res.status(400).json({ error: 'Polygon does not intersect the raster area.' });
    }

    // 获取多边形的栅格索引范围
    const [minX, minY, maxX, maxY] = turf.bbox(polygonGeoJSON);
    const rasterIndex = {
      x1: Math.floor((minX - bbox[0]) / resolution[0]),
      y1: Math.floor((bbox[3] - maxY) / resolution[1]),
      x2: Math.ceil((maxX - bbox[0]) / resolution[0]),
      y2: Math.ceil((bbox[3] - minY) / resolution[1]),
    };

    console.log('Raster Index:', rasterIndex);

    // 修改栅格区域的数值
    const data = await image.readRasters();
    const band = data[0]; // 获取栅格数据的第一波段
    for (let y = rasterIndex.y1; y <= rasterIndex.y2; y++) {
      for (let x = rasterIndex.x1; x <= rasterIndex.x2; x++) {
        const index = y * image.getWidth() + x;
        band[index] = 255; // 设置数值，例如将区域标记为 255
      }
    }

    // 保存修改后的 GeoTIFF
    const modifiedTiff = await GeoTIFF.write({
      fileDirectory: image.fileDirectory,
      width: image.getWidth(),
      height: image.getHeight(),
      rasters: [band],
    });
    fs.writeFileSync('./data/modified-raster.tif', modifiedTiff);

    // 将多边形和结果存储到 PostGIS
    const query = `
      INSERT INTO polygon_results (geometry, raster_path)
      VALUES (ST_GeomFromGeoJSON($1), $2)
      RETURNING id;
    `;
    const result = await pool.query(query, [JSON.stringify(polygonGeoJSON.geometry), 'modified-raster.tif']);
    const recordId = result.rows[0].id;

    res.json({
      message: 'Polygon processed successfully.',
      recordId,
    });
  } catch (error) {
    console.error('Error processing polygon:', error);
    res.status(500).json({ error: 'Error processing polygon.' });
  }
});

// 启动服务
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

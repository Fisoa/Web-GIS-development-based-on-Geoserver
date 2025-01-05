import React from 'react';
import { MapContainer, TileLayer, LayersControl, GeoJSON } from 'react-leaflet';
import axios from 'axios'; // 确保引入 axios
import 'leaflet/dist/leaflet.css';
import MapWithDraw from '../components/MapWithDraw';

// 栅格图层 WMS 配置
const wmsLayer = {
  url: "http://localhost:8080/geoserver/GIS/wms",
  params: {
    layers: "GIS:city", 
    format: "image/png",
    transparent: true,
  },
};

// 矢量图层配置（GeoJSON）
const vectorLayer = {
  url: "http://localhost:8080/geoserver/GIS/ows",
  params: {
    service: 'WFS',
    version: '1.1.0',
    request: 'GetFeature',
    typeName: 'GIS:city', 
    outputFormat: 'application/json',
  },
};

const MapPage = () => {
  const [vectorData, setVectorData] = React.useState(null);

  React.useEffect(() => {
    axios.get(vectorLayer.url, { params: vectorLayer.params })
      .then(response => {
        setVectorData(response.data);
      })
      .catch(error => {
        console.error('Error fetching vector data:', error);
      });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={[22.3193, 114.1694]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Raster Layer (WMS)">
            <TileLayer
              url={wmsLayer.url}
              params={wmsLayer.params}
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay name="Vector Layer (GeoJSON)">
            {vectorData && (
              <GeoJSON data={vectorData} />
            )}
          </LayersControl.Overlay>
        </LayersControl>
        {/* 添加绘制工具的地图组件 */}
        <MapWithDraw />
      </MapContainer>
    </div>
  );
};

export default MapPage;

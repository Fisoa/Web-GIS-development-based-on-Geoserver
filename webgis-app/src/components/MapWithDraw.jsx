import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const MapWithDraw = () => {
  const map = useMap();

  useEffect(() => {
    // 创建绘制控件
    const drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: '#e1e100',
            message: '<strong>Polygon draw error:<strong> polygons cannot intersect!',
          },
        },
      },
    });

    map.addControl(drawControl);

    // 监听绘制完成事件
    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      const geojson = layer.toGeoJSON();
      console.log('Exported GeoJSON:', geojson);

      // 可在此处通过 API 将 GeoJSON 发送到服务端
    });

    return () => {
      map.removeControl(drawControl); // 移除绘制控件
    };
  }, [map]);

  return null;
};

export default MapWithDraw;

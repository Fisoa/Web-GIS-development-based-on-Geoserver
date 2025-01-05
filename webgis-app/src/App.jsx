import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // 导入路由组件
import LoginPage from './pages/LoginPage'; // 登录页面
import MapPage from './pages/MapPage';     // 地图页面
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import "leaflet-draw/dist/leaflet.draw.css"; //引入 leaflet-draw 的样式
import 'leaflet-draw';


//function App() {
const App = () => {
  return (
    <Router>
      <div>
        {/* 其他页面内容 */}
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <div className="card">
        <button>
          count is 0
        </button>
        <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
      </div>

      {/* 添加路由功能 */}
      <Routes>
        <Route path="/" element={<LoginPage />} />  {/* 登录页面 */}
        <Route path="/map" element={<MapPage />} />  {/* 地图页面 */}
      </Routes>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </Router>
  );
}

export default App;
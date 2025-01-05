import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // 假设后端验证成功后跳转
    if (username && password) {
      navigate('/map');
    } else {
      alert('请输入用户名和密码');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20vh' }}>
      <h2>用户登录</h2>
      <input
        type="text"
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ margin: '10px', padding: '10px', width: '200px' }}
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ margin: '10px', padding: '10px', width: '200px' }}
      />
      <button onClick={handleLogin} style={{ padding: '10px 20px', marginTop: '20px' }}>
        登录
      </button>
    </div>
  );
};

export default LoginPage;
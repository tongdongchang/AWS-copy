import Home from './prop/Home';
import Main from './prop/Main';
import SliderAdmin from './Admin/SliderAdmin';
import Admin from './Admin/Admin';
import Register from './prop/Register';
import PlayList from './prop/PlayList';
import PlayVideoMusic from './prop/PlayVideoMusic';
import Search from './prop/Search';
import UserPlaylist from './prop/UserPlaylist';
import Users from "./Admin/Users";
import Track from "./Admin/Track";
import Artists from "./Admin/Artists";
import Album from "./Admin/Album";
import ViewDetail from './Admin/DetailAlbum';
import Login from './prop/Login';
import Dashboard from './Admin/Dashboard';
import PayPal from './prop/paypal';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { env } from './env';

// Component bảo vệ admin
function AdminGuard() {
  const [auth, setAuth] = useState({ loading: true, isAdmin: false });
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      setAuth({ loading: false, isAdmin: false });
      return;
    }
    axios.get(`${env}/api/profile/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setAuth({ loading: false, isAdmin: res.data.is_staff });
    })
    .catch(() => {
      setAuth({ loading: false, isAdmin: false });
    });
  }, [token]);

  if (auth.loading) {
    return <div className="loading">Đang xác thực...</div>;
  }

  if (!auth.isAdmin) {
    // Chuyển hướng về login nếu không phải admin
    return <Navigate to="/login" replace />;
  }

  // Nếu là admin, render layout Admin (đã chứa Outlet cho các route con)
  return <Admin />;
}

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />}>
        <Route index element={<Main />} />
        <Route path='/album' element={<PlayList />} />
        <Route path='/video' element={<PlayVideoMusic />} />
        <Route path='/paypal' element={<PayPal />} />
        <Route path='/search' element={<Search />} />
        <Route path='/playlist' element={<UserPlaylist />} />
      </Route>

      <Route path='/admin' element={<AdminGuard />}>
      <Route index element={<Dashboard />} />
        <Route path='users' element={<Users />} />
        <Route path='track' element={<Track />} />
        <Route path='artists' element={<Artists />} />
        <Route path='album' element={<Album />} />
        <Route path='viewdetailalbum' element={<ViewDetail />} />
      </Route>

      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
    </Routes>
  );
}

export default App;
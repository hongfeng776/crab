import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/Login';
import Nearby from '@/pages/Nearby';
import FaceVerify from '@/pages/FaceVerify';
import LivePlaza from '@/pages/LivePlaza';
import LiveRoom from '@/pages/LiveRoom';
import VideoCall from '@/pages/VideoCall';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/nearby" replace />} />
          <Route path="nearby" element={<Nearby />} />
          <Route path="face-verify" element={<FaceVerify />} />
          <Route path="live" element={<LivePlaza />} />
          <Route path="live/:roomId" element={<LiveRoom />} />
          <Route path="call/:userId" element={<VideoCall />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/nearby" replace />} />
      </Routes>
    </Router>
  );
}

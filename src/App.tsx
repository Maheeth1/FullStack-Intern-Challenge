import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// @ts-ignore
import Navbar from './components/Navbar';
// @ts-ignore
import Login from './pages/Login';
// @ts-ignore
import Register from './pages/Register';
// @ts-ignore
import Profile from './pages/Profile';
// @ts-ignore
import StoresList from './pages/user/StoresList';
// @ts-ignore
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<StoresList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;

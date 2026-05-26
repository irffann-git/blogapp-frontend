import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import CreateBlog from "./pages/CreateBlog";
import ProtectedRoute from "./Routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import EditBlog from "./pages/EditBlog";
import BlogDetails from "./pages/BlogDetails";

function App() {
  return (
    <BrowserRouter>
    <Navbar/>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/blogs/:id" element={<BlogDetails/>} />
        <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/edit-blog/:id" element={<ProtectedRoute><EditBlog/></ProtectedRoute>} />


      </Routes>

    </BrowserRouter>
  );
}

export default App;


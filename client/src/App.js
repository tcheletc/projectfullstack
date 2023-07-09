import './App.css';
import NoPage from './js/NoPage';
import Login from "../src/js/Login.js";
import Main from "../src/js/Main.js";
import Register from "./js/Registration";
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Whatsapp from './js/Whatsapp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/users/:username" element={<Whatsapp />} />
          <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

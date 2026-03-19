import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Gems from "./pages/Gems";
import GemDetail from "./pages/GemDetail";
import Locations from "./pages/Locations";
import Chatbot from "./pages/Chatbot";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gems" element={<Gems />} />
        <Route path="/gems/:id" element={<GemDetail />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/generate" element={<Home />} />
    </Routes>
  );
}

export default App;
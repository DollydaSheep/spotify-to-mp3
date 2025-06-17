import{
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Home from "./pages/home/home";
import Download from "./pages/home/download";
import { useState } from "react";


const App = () => {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App

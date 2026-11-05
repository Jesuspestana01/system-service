import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./views/Home";
import Signup from "./views/Signup";

const Layout = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
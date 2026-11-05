import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./views/Signup";
import Main from "./views/Main";
import Landing from "./views/Landing";

const Layout = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/main" element={<Main/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
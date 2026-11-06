import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./views/Signup";
import Main from "./views/Main";
import Landing from "./views/Landing";
import Orders from "./views/Orders";
import Inventory from "./views/Inventory";
import Customers from "./views/Customers";

const Layout = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/main" element={<Main/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/inventory" element={<Inventory/>}/>
        <Route path="/customers" element={<Customers/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
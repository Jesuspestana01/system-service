import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Signup from "./views/Signup";
import Main from "./views/Main";
import Landing from "./views/Landing";
import Orders from "./views/Orders";
import OrderDetail from "./views/OrderDetail";
import Inventory from "./views/Inventory";
import Customers from "./views/Customers";
import Employees from "./views/Employees";
import NotFound from "./views/NotFound";

const ProtectedView = () => {
  const isAuthenticated = Boolean(localStorage.getItem("role") && localStorage.getItem("id"));
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const Layout = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedView />}>
          <Route path="/main" element={<Main />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/employees" element={<Employees />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;

import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Signup from "./views/Signup";
import Main from "./views/Main";
import Landing from "./views/Landing";
import Orders from "./views/Orders";
import OrderDetail from "./views/OrderDetail";
import Inventory from "./views/Inventory";
import Customers from "./views/Customers";
import CustomerDetail from "./views/CustomerDetail";
import Employees from "./views/Employees";
import NotFound from "./views/NotFound";
import { DEMO_SESSION_EVENT } from "./services/demo.service";

const ProtectedView = () => {
  const [sessionVersion, setSessionVersion] = useState(0);
  const isAuthenticated = Boolean(localStorage.getItem("role") && localStorage.getItem("id"));

  // remount active protected view when demo role switches or demo data resets
  useEffect(() => {
    const handleDemoChange = () => setSessionVersion((prev) => prev + 1);
    window.addEventListener(DEMO_SESSION_EVENT, handleDemoChange);
    return () => window.removeEventListener(DEMO_SESSION_EVENT, handleDemoChange);
  }, []);

  return isAuthenticated ? <Outlet key={sessionVersion} /> : <Navigate to="/" replace />;
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
          <Route path="/customers/:customerId" element={<CustomerDetail />} />
          <Route path="/employees" element={<Employees />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./views/Signup";
import Main from "./views/Main";
import Landing from "./views/Landing";
import Orders from "./views/Orders";
import OrderDetail from "./views/OrderDetail";
import Inventory from "./views/Inventory";
import Customers from "./views/Customers";

const Layout = () => {
  return (
    // TODO [BACKEND - Rutas protegidas]:
    // Envolver `/main`, `/orders`, `/orders/:orderId`, `/inventory` y `/customers` en un `<ProtectedRoute>`
    // que verifique si existe un token válido (`src/services/api.js`) y redirija a `/` si no hay sesión.
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/main" element={<Main/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/orders/:orderId" element={<OrderDetail/>}/>
        <Route path="/inventory" element={<Inventory/>}/>
        <Route path="/customers" element={<Customers/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
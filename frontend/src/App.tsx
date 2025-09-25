import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OAuth2Redirect from "./pages/OAuth2Redirect";
import ActivateAccount from "./pages/ActiveAccount";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import AdminPage from "./pages/AdminPage";
import Profile from "./pages/Profile";
import BookDetail from "./pages/BookDetail";
import Checkout from "./pages/Checkout";
import PayPalResult from "./pages/PayPalResult";
import UserOrdersPage from "./pages/UserOrdersPage";
import AllOrdersPage from "./pages/AllOrdersPage";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

const App = () => {
    const { token, role } = useSelector((state: RootState) => state.auth);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
            <Route path="/activate/:code" element={<ActivateAccount />} />
            <Route path="/forgot-password" element={<ResetPasswordRequest />} />
            <Route path="/reset/:code" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/paypal/result" element={<PayPalResult />} />
            <Route path="/my-orders" element={<UserOrdersPage />} />
            {(role === "ADMIN" || role === "STAFF") && <Route path="/orders" element={<AllOrdersPage />} />}
            {role === "ADMIN" && <Route path="/admin/*" element={<AdminPage />} />}
        </Routes>
    );
};

export default App;

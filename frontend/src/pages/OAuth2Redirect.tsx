import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../auth/authSlice";

const OAuth2Redirect = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            dispatch(setToken(token));
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    }, [dispatch, navigate]);

    return null;
};

export default OAuth2Redirect;

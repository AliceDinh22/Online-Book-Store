import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, UserDTO } from "../types/types";

const initialState: AuthState = {
    token: sessionStorage.getItem("jwt"),
    user: sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")!) : null,
    role: sessionStorage.getItem("role")
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ token: string; user: UserDTO; role: string }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.role = action.payload.role;

            sessionStorage.setItem("jwt", action.payload.token);
            sessionStorage.setItem("role", action.payload.role);
            sessionStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            sessionStorage.setItem("jwt", action.payload);
        },
        setRole: (state, action: PayloadAction<string>) => {
            state.role = action.payload;
            sessionStorage.setItem("role", action.payload);
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.role = null;

            sessionStorage.removeItem("jwt");
            sessionStorage.removeItem("role");
            sessionStorage.removeItem("user");
        }
    }
});

export const { loginSuccess, setToken, setRole, logout } = authSlice.actions;
export default authSlice.reducer;

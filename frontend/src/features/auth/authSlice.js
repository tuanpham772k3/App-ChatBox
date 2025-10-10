import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "@/lib/axios";

// Register
export const registerUser = createAsyncThunk(
    "auth/register",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await instance.post("/auth/register", payload);
            return res.data;
        } catch (err) {
            const data = err.response?.data;
            return rejectWithValue({
                message: data?.message || "Lỗi không xác định",
                idCode: data?.idCode || -1,
                status: err.response?.status,
            });
        }
    }
);

// Login
export const loginUser = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
    try {
        const res = await instance.post("/auth/login", payload);
        return res.data;
    } catch (err) {
        const data = err.response?.data;
        return rejectWithValue({
            message: data?.message || "Lỗi không xác định",
            idCode: data?.idCode || -1,
            status: err.response?.status,
        });
    }
});

// Tạo slice
const authSlice = createSlice({
    name: "auth",
    // state manage
    initialState: {
        user: null,
        accessToken: null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.error = null;
            localStorage.removeItem("accessToken");
        },
    },
    extraReducers: (builder) => {
        builder
            //register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            //login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

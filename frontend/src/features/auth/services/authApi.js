import instance from "@/lib/axios";

const authApi = {
    register: async (payload) => {
        const res = await instance.post("/auth/register", payload);
        return res.data;
    },
    login: async (payload) => {
        const res = await instance.post("/auth/login", payload);
        return res.data;
    },
    refreshToken: async () => {
        const res = await instance.post("/auth/refresh");
        return res.data;
    },
    logout: async () => {
        const res = await instance.post("/auth/logout");
        return res.data;
    },
};

export default authApi;

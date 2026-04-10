import instance from "@/lib/axios";

const authApi = {
  register: (payload) => {
    return instance.post("/auth/register", payload);
  },
  login: (payload) => {
    return instance.post("/auth/login", payload);
  },
  refreshToken: () => {
    return instance.post("/auth/refresh");
  },
  logout: () => {
    return instance.post("/auth/logout");
  },
};

export default authApi;

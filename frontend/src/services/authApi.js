import instance from "@/lib/axios";

const authApi = {
  register: (payload) => {
    return instance.post("/auth/register", payload, {
      skipAuthRefresh: true,
    });
  },
  login: (payload) => {
    return instance.post("/auth/login", payload, {
      skipAuthRefresh: true,
    });
  },
  logout: () => {
    return instance.post("/auth/logout");
  },

  refreshToken: () => {
    return instance.post("/auth/refresh-token");
  },
};

export default authApi;

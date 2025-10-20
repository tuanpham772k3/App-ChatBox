import instance from "@/lib/axios";

const userApi = {
  // get profile
  getProfile: async () => {
    const res = await instance.get("/user/profile");
    return res.data;
  },

  // update profile
  updateProfile: async (formData) => {
    const res = await instance.put("/user/profile", formData);
    return res.data;
  },
};

export default userApi;

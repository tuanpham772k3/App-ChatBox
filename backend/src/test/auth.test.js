const request = require("supertest");
const app = require("../app.js");
const { connectDB } = require("../config/db.js");
const mongoose = require("mongoose");

describe("Auth API", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ================= REGISTER =================
  // test đăng ký thành công
  it("should register user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "test123",
      email: "test@gmail.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("data.user");
    expect(res.body.data.user.email).toBe("test@gmail.com");
  });

  // test đăng ký với email đã tồn tại
  it("should fail register with existing email", async () => {
    // đăng ký lại
    const res = await request(app).post("/api/auth/register").send({
      username: "test456",
      email: "test@gmail.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(409);
  });

  // ================= LOGIN =================
  // test đăng nhập thành công
  it("should login user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@gmail.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data.user");
    expect(res.body).toHaveProperty("data.accessToken");
  });

  // test đăng nhập với mật khẩu sai
  it("should fail login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@gmail.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
  });

  // test đăng nhập khi thiếu email
  it("should fail login when missing email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
  });
});

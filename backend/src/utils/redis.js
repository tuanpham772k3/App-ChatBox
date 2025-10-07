import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

// Tạo redis client chứa url chưa kết nối
const redisClient = createClient({ url: REDIS_URL });

// Bắt sự kiện lỗi
redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error:", err);
});

// Biến đánh dấu trạng thái kết nối, tránh kết nối Redis nhiều lần nếu connectRedis() bị gọi lặp lại
let connected = false;

// Kết nối redis server
export const connectRedis = async () => {
    if (connected) return; // Nếu connect rồi không lặp lại
    await redisClient.connect(); // gửi yêu cầu kết nối
    connected = true;
    console.log("✅ Connected to Redis");
};

// Thêm token vào blacklist
export const blacklistAccessToken = async (token, ttlSeconds) => {
    const key = `blacklist:${token}`;
    await redisClient.set(key, "1", { EX: ttlSeconds });
};

// Kiểm tra token có trong blacklist không
export const isAccessTokenBlacklisted = async (token) => {
    const result = await redisClient.exists(`blacklist:${token}`);
    return result === 1;
};

export default redisClient;

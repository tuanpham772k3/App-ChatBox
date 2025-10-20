import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Form, Input, Button, Upload } from "antd";
import { User, Phone, Home, FileText } from "lucide-react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { fetchProfile, editProfile } from "@/features/user/userSlice";
import { useNotification } from "@/hooks/useNotification";

const { TextArea } = Input;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.user);

  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);

  const notification = useNotification();

  // Fetch profile khi mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Xử lý ảnh preview
  const handleAvatarChange = ({ file }) => {
    setAvatarFile(file);
  };

  // Cập nhật profile
  const handleFinish = async (values) => {
    // So sánh với profile hiện tại
    const changed = form.isFieldsTouched(true); // trả về true khi người dùng thật sự sửa form
    if (!changed && avatarFile === profile.avatarUrl) {
      notification.info({
        message: "Không có thay đổi nào",
        description: "Vui lòng chỉnh sửa thông tin trước khi cập nhật.",
      });
      return;
    }

    try {
      // Tạo FormData để gửi file ảnh + thông tin khác
      const formData = new FormData();

      formData.append("username", values.username || "");
      formData.append("bio", values.bio || "");
      formData.append("status", values.status || "");
      if (avatarFile) {
        formData.append("avatar", avatarFile); // Gửi file thật
      }

      const res = await dispatch(editProfile(formData)).unwrap();
      console.log("cập nhật thành công ", res);

      if (res && res.idCode === 0) {
        notification.success({
          message: "Thành công!",
          description: res.message || "Cập nhật hồ sơ thành công!",
        });
        setAvatarFile(null);
      }
    } catch (err) {
      console.error("Update profile error:", err);
      switch (err.idCode) {
        case 1:
          notification.warning({
            message: "Không thành công",
            description: err.message || "User không tồn tại!",
          });
          break;
        case 3:
          notification.warning({
            message: "Lỗi hệ thống!",
            description: err.message || "Internal server error!",
          });
          break;
        default:
          notification.error({
            message: "Cập nhật thất bại",
            description: err.message || "Lỗi không xác định!",
          });
      }
    }
  };

  // Khi chưa có dữ liệu
  if (loading || !profile) {
    return <div className="text-center mt-10">Đang tải hồ sơ...</div>;
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <User size={20} />
          <span className="font-semibold text-lg">Hồ sơ cá nhân</span>
        </div>
      }
      className="max-w-xl mx-auto mt-6 shadow-md rounded-2xl border border-gray-200"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          username: profile?.username || "",
          bio: profile?.bio || "",
          status: profile?.status || "active",
          address: "",
          phone: "",
        }}
        onFinish={handleFinish}
        className="space-y-3"
      >
        {/* Avatar */}
        <Form.Item label="Ảnh đại diện">
          <div className="flex items-center gap-4">
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleAvatarChange}
            >
              <Button icon={<AiOutlineCloudUpload size={18} />}>Chọn ảnh</Button>
            </Upload>

            <div className="flex flex-col">
              <img
                src={profile?.avatarUrl?.url}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border border-gray-300 mb-2"
              />

              {avatarFile && (
                <span className="text-sm text-gray-600 italic">
                  File được chọn: {avatarFile.name}
                </span>
              )}
            </div>
          </div>
        </Form.Item>

        {/* Username */}
        <Form.Item
          label="Tên người dùng"
          name="username"
          rules={[{ required: true, message: "Vui lòng nhập tên người dùng" }]}
        >
          <Input prefix={<User size={16} />} placeholder="Nhập tên..." />
        </Form.Item>

        {/* Bio */}
        <Form.Item label="Giới thiệu" name="bio">
          <TextArea
            rows={3}
            prefix={<FileText size={16} />}
            placeholder="Giới thiệu ngắn gọn về bạn..."
          />
        </Form.Item>

        {/* Address */}
        <Form.Item label="Địa chỉ" name="address">
          <Input prefix={<Home size={16} />} placeholder="VD: 123 Nguyễn Huệ, Huế" />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" }]}
        >
          <Input prefix={<Phone size={16} />} placeholder="VD: 0901234567" />
        </Form.Item>

        {/* Submit */}
        <Form.Item className="text-right">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 rounded-lg"
          >
            Cập nhật hồ sơ
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfilePage;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Form, Input, Button, Upload } from "antd";
import { Menu, User, Phone, Home, FileText } from "lucide-react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { useNotification } from "@/hooks/useNotification";
import { useLayout } from "@/contexts/LayoutContext";
import { updateMyProfile, getMyProfile } from "@/store/userSlice";
import UserAvatar from "@/components/ui/avatar/UserAvatar";

const { TextArea } = Input;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.user);
  const { openMobileSidebar } = useLayout();

  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);

  const notification = useNotification();

  // Fetch profile khi mount
  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  // Xử lý ảnh preview
  const handleAvatarChange = ({ file }) => {
    setAvatarFile(file);
  };

  // Cập nhật profile
  const handleFinish = async (values) => {
    // So sánh với profile hiện tại
    const changed = form.isFieldsTouched(true); // trả về true khi người dùng thật sự sửa form
    if (!changed && avatarFile === profile.avatar?.url) {
      notification.info({
        message: "Không có thay đổi nào",
        description: "Vui lòng chỉnh sửa thông tin trước khi cập nhật.",
      });
      return;
    }

    try {
      // Tạo FormData để gửi file ảnh + thông tin khác
      const formData = new FormData();

      formData.append("displayName", values.displayName || "");
      formData.append("bio", values.bio || "");
      formData.append("status", values.status || "");
      if (avatarFile) {
        formData.append("avatar", avatarFile); // Gửi file thật
      }

      const res = await dispatch(updateMyProfile(formData)).unwrap();
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
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)]">
        Đang tải hồ sơ...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <header className="h-16 sm:h-20 flex items-center gap-3 px-4 border-b border-[var(--color-border)] shrink-0 lg:hidden">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={openMobileSidebar}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] active:bg-[var(--color-active)] transition-colors"
        >
          <Menu size={22} />
        </button>
        <h1 className="min-w-0 truncate font-bold text-2xl text-[var(--color-primary)] text-shadow-sm">
          Hồ sơ
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <Card
          title={
            <div className="flex items-center gap-2">
              <User size={20} />
              <span className="font-semibold text-lg">Hồ sơ cá nhân</span>
            </div>
          }
          className="max-w-xl mx-auto mt-6 shadow-md rounded-2xl border border-[var(--color-border)]"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              displayName: profile?.displayName || "",
              bio: profile?.bio || "",
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
                  <UserAvatar
                    avatarUrl={profile?.avatar?.url}
                    name={profile?.displayName}
                    size={64}
                  />

                  {avatarFile && (
                    <span className="text-sm text-[var(--color-text-secondary)] italic">
                      File được chọn: {avatarFile.name}
                    </span>
                  )}
                </div>
              </div>
            </Form.Item>

            {/* displayName */}
            <Form.Item
              label="Tên người dùng"
              name="displayName"
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
              rules={[
                { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input prefix={<Phone size={16} />} placeholder="VD: 0901234567" />
            </Form.Item>

            {/* Submit */}
            <Form.Item className="text-right">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-6 rounded-lg"
              >
                Cập nhật hồ sơ
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

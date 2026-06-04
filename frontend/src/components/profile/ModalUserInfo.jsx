import React, { useEffect, useState } from "react";
import { Button, Descriptions, Image, Modal, Upload } from "antd";
import { Typography } from "antd";
import ImgCrop from "antd-img-crop";
import { ArrowLeft, Camera, PencilLine } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../store/userSlice";
import { useNotification } from "@/hooks/useNotification";
import UserProfileEditForm from "./UserProfileEditForm";
import UserAvatar from "../ui/avatar/UserAvatar";

const { Title, Text } = Typography;

const ModalUserInfo = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);
  const notification = useNotification();

  const [mode, setMode] = useState("view"); // view || editInfo || editAvatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [fileList, setFileList] = useState([]);

  const modalTransition = (type) => setMode(type);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        await dispatch(fetchProfile()).unwrap();
      } catch (error) {
        notification.error({
          message: "Lấy thông tin người dùng thất bại",
          description: error.message || "Đã có lỗi xảy ra",
        });
      }
    };

    fetchUserProfile();
  }, [dispatch]);

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width="min(calc(100vw - 2rem), 25rem)"
    >
      {mode === "view" && (
        <>
          <header className="border-b border-[var(--color-border)]">
            <Title level={4}>Thông tin tài khoản</Title>
          </header>
          {/* Body */}
          <div className="mb-4 flex flex-col">
            {/* Ảnh */}
            <div className="relative flex flex-col border-b-4 border-[var(--color-border)]">
              <Image
                src="https://24hstore.vn/upload_images/images/anh-bia-facebook-dep/anh-bia-facebook-dep_(1).jpg"
                alt="Ảnh bìa"
                className="h-50 object-cover"
              />
              <div className="h-20">
                <div className="absolute bottom-5 flex items-center gap-4 px-4">
                  <div className="relative">
                    <UserAvatar
                      name={profile?.username || "Người dùng"}
                      avatarUrl={profile?.avatar?.url}
                      size={72}
                    />
                    <button
                      onClick={() => modalTransition("editAvatar")}
                      className="absolute bottom-0 right-0 p-1 text-[var(--color-text-secondary)] bg-[var(--color-app)] hover:bg-[var(--color-hover)] rounded-full border border-[var(--color-border)]"
                    >
                      <Camera size={22} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="min-w-0 truncate text-xl font-medium">
                      {profile?.username}
                    </h2>
                    <Button
                      type="text"
                      shape="circle"
                      icon={<PencilLine size={16} />}
                      onClick={() => modalTransition("editInfo")}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-medium">Thông tin cá nhân</h2>
              <Descriptions column={1}>
                <Descriptions.Item label="Giới tính">Nam</Descriptions.Item>

                <Descriptions.Item label="Ngày sinh">07 tháng 07, 2003</Descriptions.Item>

                <Descriptions.Item label="Email">
                  <Text copyable>{profile?.email}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Bio">{profile?.bio || "..."}</Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          {/* Footer */}
          <footer className="border-t border-[var(--color-border)]">
            <Button
              type="primary"
              block
              icon={<PencilLine size={18} />}
              onClick={() => modalTransition("editInfo")}
            >
              Cập nhật
            </Button>
          </footer>
        </>
      )}

      {mode === "editInfo" && (
        <>
          {/* Header */}
          <header className="flex items-center gap-4 mb-4 border-b border-[var(--color-border)]">
            <Button
              type="text"
              shape="circle"
              icon={<ArrowLeft size={18} />}
              onClick={() => modalTransition("view")}
            />
            <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
              Cập nhật thông tin cá nhân
            </h2>
          </header>
          <UserProfileEditForm
            profile={profile}
            onCancel={() => modalTransition("view")}
            onSubmit={(data) => {
              console.log("SUBMIT:", data);
              modalTransition("view");
            }}
          />
        </>
      )}

      {mode === "editAvatar" && (
        <>
          {/* Header */}
          <header className="mb-4 flex items-center gap-4 border-b border-[var(--color-border)]">
            <Button
              type="text"
              shape="circle"
              icon={<ArrowLeft size={18} />}
              onClick={() => modalTransition("view")}
            />
            <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
              Cập nhật ảnh đại diện
            </h2>{" "}
          </header>
          {/* Đang làm */}
          <div className="mb-4 flex flex-col items-center justify-center">
            <ImgCrop rotationSlider>
              <Upload
                listType="picture-card"
                fileList={fileList}
                maxCount={1}
                beforeUpload={(file) => {
                  setAvatarFile(file);
                  setFileList([
                    {
                      uid: file.uid,
                      name: file.name,
                      status: "done",
                      url: URL.createObjectURL(file),
                    },
                  ]);
                  return false; // ❗ chặn auto upload
                }}
                onRemove={() => {
                  setAvatarFile(null);
                  setFileList([]);
                }}
              >
                {fileList.length === 0 && "+ Tải ảnh"}
              </Upload>
            </ImgCrop>
          </div>

          {/* Footer */}
          <footer className="pt-4 flex justify-end gap-2 border-t border-[var(--color-border)]">
            <Button onClick={() => modalTransition("view")}>Hủy</Button>

            <Button
              type="primary"
              disabled={!avatarFile}
              onClick={() => {
                const formData = new FormData();
                formData.append("avatar", avatarFile);

                // TODO: call API upload avatar
                console.log("UPLOAD FILE:", avatarFile);

                modalTransition("view");
              }}
            >
              Cập nhật
            </Button>
          </footer>
        </>
      )}
    </Modal>
  );
};

export default ModalUserInfo;

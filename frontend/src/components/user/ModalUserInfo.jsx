import React, { useEffect, useState } from "react";
import {
  Checkbox,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { CloseOutlined } from "@ant-design/icons";
import { ArrowLeft, Camera, PencilLine } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../store/userSlice";
import { useNotification } from "@/hooks/useNotification";
import UserProfileEditForm from "./UserProfileEditForm";

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
      centered
      closeIcon={<CloseOutlined style={{ color: "var(--color-text-secondary)" }} />}
      styles={{
        content: {
          backgroundColor: "var(--color-app)",
          padding: 0,
        },
      }}
    >
      {mode === "view" && (
        <>
          {/* Header */}
          <div className="px-4 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
              Thông tin tài khoản
            </h2>
          </div>
          {/* Body */}
          <div className="flex flex-col">
            {/* Ảnh */}
            <div className="relative flex flex-col border-b-4 border-[var(--color-border)]">
              <img
                src="https://24hstore.vn/upload_images/images/anh-bia-facebook-dep/anh-bia-facebook-dep_(1).jpg"
                alt="Ảnh bìa"
                className="h-50 object-cover"
              />
              <div className="h-20">
                <div className="absolute bottom-5 flex items-center gap-4 px-4">
                  <div className="relative">
                    <img
                      src={profile?.avatarUrl.url}
                      alt={profile?.username}
                      className="w-20 h-20 rounded-full border-2 border-[var(--color-border)] object-cover"
                    />
                    <button
                      onClick={() => modalTransition("editAvatar")}
                      className="absolute bottom-0 right-0 p-1 text-[var(--color-text-secondary)] bg-[var(--color-app)] hover:bg-black/10 rounded-full border border-[var(--color-border)]"
                    >
                      <Camera size={22} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium">{profile?.username}</h2>
                    <button
                      onClick={() => modalTransition("editInfo")}
                      className="p-1 rounded-full hover:bg-black/10"
                    >
                      <PencilLine size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-col gap-2 p-4">
              <h2 className="text-lg font-medium">Thông tin cá nhân</h2>
              <div className="flex flex-col gap-2">
                <div className="flex">
                  <span className="w-30">Giới tính</span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    Nam
                  </span>
                </div>
                <div className="flex">
                  <span className="w-30">Ngày sinh</span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    07 tháng 07, 2003
                  </span>
                </div>
                <div className="flex">
                  <span className="w-30">Email</span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {profile?.email}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-30">Bio</span>
                  <span>{profile?.bio}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="p-3 border-t border-[var(--color-border)]">
            <button
              onClick={() => modalTransition("editInfo")}
              className="w-full flex justify-center items-center gap-2 py-1 bg-[var(--color-chat)] hover:bg-black/10 rounded"
            >
              <PencilLine size={20} />
              <span className="text-lg font-medium">Cập nhật</span>
            </button>
          </div>
        </>
      )}

      {mode === "editInfo" && (
        <>
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-[var(--color-border)]">
            <button className="p-2 hover:bg-[var(--color-chat)] rounded-full">
              <ArrowLeft onClick={() => modalTransition("view")} />
            </button>
            <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
              Cập nhật thông tin cá nhân
            </h2>
          </div>
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
          <div className="flex items-center gap-4 p-4 border-b border-[var(--color-border)]">
            <button className="p-2 hover:bg-[var(--color-chat)] rounded-full">
              <ArrowLeft onClick={() => modalTransition("view")} />
            </button>
            <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
              Cập nhật ảnh đại diện
            </h2>
          </div>
          {/* Đang làm */}
          <div className="flex flex-col items-center justify-center py-6">
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
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--color-border)]">
            <button
              onClick={() => modalTransition("view")}
              className="px-4 py-2 bg-[var(--color-chat)] hover:bg-black/10 rounded"
            >
              Hủy
            </button>

            <button
              disabled={!avatarFile}
              onClick={() => {
                const formData = new FormData();
                formData.append("avatar", avatarFile);

                // TODO: call API upload avatar
                console.log("UPLOAD FILE:", avatarFile);

                modalTransition("view");
              }}
              className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded disabled:opacity-50"
            >
              Cập nhật
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default ModalUserInfo;

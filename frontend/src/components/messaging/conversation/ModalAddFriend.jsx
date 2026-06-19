import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Descriptions, Modal, Spin, Typography } from "antd";
import { ArrowLeft } from "lucide-react";
import SearchBar from "../../ui/search/SearchBar";
import { useNotification } from "@/hooks/useNotification";
import userApi from "@/services/userApi";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import { getUserDetail } from "@/store/userSlice";
import { createFriendRequest } from "@/store/relationshipSlice";

const { Text } = Typography;

const ModalAddFriend = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();

  const { selectedUser } = useSelector((state) => state.user);

  const [view, setView] = useState("add_friend"); // add_friend || profile
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const notification = useNotification();

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);

      const res = await userApi.getUsers(query);

      setResults(res.data);
    } catch (error) {
      notification.error({
        message: "Không thể tải danh sách người dùng",
        description: error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  useEffect(() => {
    const query = searchText.trim();

    const handler = setTimeout(() => {
      fetchUsers(query);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText, dispatch]);

  const handleSelectUser = async (userId) => {
    setView("profile");

    dispatch(getUserDetail(userId));
  };

  const handleCreateFriendRequest = async (e, userId) => {
    e.stopPropagation();
    try {
      await dispatch(createFriendRequest(userId)).unwrap();

      notification.success({
        message: "Đã gửi yêu cầu kết bạn",
      });
    } catch (error) {
      notification.error({
        message: "Gửi yêu cầu kết bạn thất bại!",
        description: error.message || "Vui lòng thử lại sau",
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      width="min(calc(100vw - 2rem), 25rem)"
      footer={null}
      styles={{
        content: {
          padding: 0,
        },
      }}
      centered
    >
      <div className="h-[70vh] flex flex-col overflow-hidden">
        {view === "add_friend" && (
          <>
            <header className="h-12 flex items-center px-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)] text-base font-semibold">
                Thêm bạn
              </h2>
            </header>

            <section className="flex-1 min-h-0 flex flex-col py-4 overflow-hidden">
              <div className="px-4">
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  placeholder="Tìm kiếm..."
                />
              </div>

              <ul className="flex-1 min-h-0 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <span className="h-full flex items-center justify-center">
                    <Spin />
                  </span>
                ) : results.length === 0 ? (
                  <span className="flex justify-center">Không có người dùng nào</span>
                ) : (
                  results.map((user) => {
                    return (
                      <li
                        key={user._id}
                        onClick={() => handleSelectUser(user._id)}
                        className="min-w-0 flex items-center justify-between gap-3 px-4 py-2 hover:bg-[var(--color-hover)] rounded cursor-pointer transition-all"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <UserAvatar
                            avatarUrl={user?.avatar?.url}
                            name={user.displayName}
                            size={40}
                          />
                          <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                            {user?.displayName}
                          </span>
                        </div>
                        <Button
                          onClick={(e) => handleCreateFriendRequest(e, user._id)}
                          type="primary"
                        >
                          Kết bạn
                        </Button>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          </>
        )}

        {view === "profile" && (
          <>
            <header className="h-12 flex items-center gap-1 px-1 border-b border-[var(--color-border)]">
              <Button
                type="text"
                shape="circle"
                icon={<ArrowLeft size={18} />}
                onClick={() => setView("add_friend")}
              />
              <h2 className="text-[var(--color-text-primary)] text-base font-semibold">
                Thông tin tài khoản
              </h2>
            </header>

            <section className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col pb-4 border-b-4 border-[var(--color-border)]">
                <img
                  src="https://24hstore.vn/upload_images/images/anh-bia-facebook-dep/anh-bia-facebook-dep_(1).jpg"
                  alt="Ảnh bìa"
                  className="h-40 object-cover"
                />
                {/* Avatar + Name */}
                <div className="relative h-20 px-4">
                  <div className="absolute bottom-4 flex items-center gap-4">
                    <div className="relative">
                      <UserAvatar
                        name={selectedUser?.displayName || "Người dùng"}
                        avatarUrl={selectedUser?.avatar?.url}
                        size={80}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <h2 className="min-w-0 truncate text-base font-medium">
                        {selectedUser?.displayName}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Button */}
                <div className="flex items-center justify-between gap-3 px-4">
                  <button
                    onClick={(e) => handleCreateFriendRequest(e, selectedUser._id)}
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium text-[var(--color-text-primary)]
                    bg-[var(--color-chat)] hover:bg-[var(--color-hover-elevated)] active:bg-[var(--color-active)]"
                  >
                    Kết bạn
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium text-white
                    bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
                    active:bg-[var(--color-primary-active)]"
                  >
                    Nhắn tin
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="mb-4 text-base font-medium">Thông tin cá nhân</h2>
                <Descriptions column={1}>
                  <Descriptions.Item label="Giới tính">Nam</Descriptions.Item>

                  <Descriptions.Item label="Ngày sinh">
                    07 tháng 07, 2003
                  </Descriptions.Item>

                  <Descriptions.Item label="Email">
                    <Text copyable>{selectedUser?.email}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Bio">
                    {selectedUser?.bio || "..."}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </section>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ModalAddFriend;

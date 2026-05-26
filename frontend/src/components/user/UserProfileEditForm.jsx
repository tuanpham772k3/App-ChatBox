import React, { useEffect } from "react";
import { Form, Input, Radio, Select } from "antd";

const days = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1).padStart(2, "0"),
  value: i + 1,
}));

const months = Array.from({ length: 12 }, (_, i) => ({
  label: String(i + 1).padStart(2, "0"),
  value: i + 1,
}));

const years = Array.from({ length: 100 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: year, value: year };
});

const UserProfileEditForm = ({ profile, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!profile) return;

    form.setFieldsValue({
      displayName: profile.username,
      gender: profile.gender || "male",
      day: 7,
      month: 7,
      year: 2003,
    });
  }, [profile, form]);

  const handleFinish = (values) => {
    const payload = {
      displayName: values.displayName,
      gender: values.gender,
      birthday: {
        day: values.day,
        month: values.month,
        year: values.year,
      },
    };

    onSubmit?.(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      className="flex flex-col h-full"
    >
      {/* Body */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        <Form.Item
          label="Tên hiển thị"
          name="displayName"
          rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
        >
          <Input placeholder="Nhập tên hiển thị" />
        </Form.Item>

        <div>
          <div className="mb-2 text-base font-medium text-[var(--color-text-primary)]">
            Thông tin cá nhân
          </div>

          <Form.Item name="gender">
            <Radio.Group>
              <Radio value="male">Nam</Radio>
              <Radio value="female">Nữ</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="grid grid-cols-3 gap-2">
            <Form.Item name="day" rules={[{ required: true, message: "Chọn ngày" }]}>
              <Select placeholder="Ngày" options={days} />
            </Form.Item>

            <Form.Item name="month" rules={[{ required: true, message: "Chọn tháng" }]}>
              <Select placeholder="Tháng" options={months} />
            </Form.Item>

            <Form.Item name="year" rules={[{ required: true, message: "Chọn năm" }]}>
              <Select placeholder="Năm" options={years} />
            </Form.Item>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-[var(--color-chat)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] rounded"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={!form.isFieldsTouched(true)}
          className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded disabled:opacity-50"
        >
          Cập nhật
        </button>
      </div>
    </Form>
  );
};

export default UserProfileEditForm;

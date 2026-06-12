import React, { useEffect } from "react";
import { Button, Form, Input, Radio, Select } from "antd";

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
      className="flex-1 flex flex-col"
    >
      <section className="flex-1 min-h-0 space-y-4 px-4 py-4 overflow-y-auto custom-scrollbar">
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
      </section>

      <footer className="flex justify-end gap-4 px-4 py-4 border-t border-[var(--color-border)]">
        <Button onClick={onCancel}>Hủy</Button>

        <Button type="primary" disabled={!form.isFieldsTouched(true)}>
          Cập nhật
        </Button>
      </footer>
    </Form>
  );
};

export default UserProfileEditForm;

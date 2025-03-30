import React from 'react';
import { Modal, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const EditModal = ({ 
  visible, 
  onOk, 
  onCancel, 
  form, 
  module, 
  token, 
  API_URL, 
  title
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        {module === 'carousel' && (
          <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="描述" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name="buttonText" label="按钮文本" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="imageUrl" label="轮播图片" rules={[{ required: true, message: '请上传轮播图片' }]}>
              <Upload
                name="file"
                listType="picture-card"
                showUploadList={true}
                action={`${API_URL}/carousel/upload`}
                headers={{ Authorization: `Bearer ${token}` }}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('只能上传图片文件!');
                  }
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('图片必须小于5MB!');
                  }
                  return isImage && isLt5M;
                }}
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    message.success(`${info.file.name} 上传成功`);
                    form.setFieldsValue({ imageUrl: info.file.response.imageUrl });
                  } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 上传失败`);
                  }
                }}
              >
                {form.getFieldValue('imageUrl') ? (
                  <img
                    src={form.getFieldValue('imageUrl')}
                    alt="轮播图预览"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>上传</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item name="order" label="排序" rules={[{ required: true, type: 'number' }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="isActive" label="是否激活" valuePropName="checked">
              <Input type="checkbox" />
            </Form.Item>
          </>
        )}

        {module === 'services' && (
          <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="icon" label="图标" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="描述" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </>
        )}

        {module === 'stats' && (
          <>
            <Form.Item name="number" label="数字" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </>
        )}

        {module === 'whyus' && (
          <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="描述" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default EditModal;

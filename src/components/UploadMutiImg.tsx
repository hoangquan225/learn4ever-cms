import { PlusOutlined } from "@ant-design/icons";
import { message, Modal, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import { apiUploadFile } from "../api/uploadApi";

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UploadMultiImg = ({
  defaultUrls,
  onChangeUrls,
}: {
  defaultUrls?: string[] | null;
  onChangeUrls: (values: string[]) => void;
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (defaultUrls && defaultUrls.length > 0) {
      const files = defaultUrls.map((url, index) => ({
        uid: `${index}`,
        name: `image_${index}.png`,
        status: "done",
        url: url,
      }));
      setFileList(files);
      onChangeUrls(defaultUrls);
    } else {
      setFileList([]);
      onChangeUrls([]);
    }
  }, [defaultUrls]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onChangeUrls(newFileList.map((file) => file.response));
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  return (
    <>
      <Upload
        multiple
        customRequest={async (options) => {
          const { onSuccess = () => {}, onError = () => {}, file } = options;
          try {
            const res = await apiUploadFile(file);
            onSuccess(res.data.data.file);
          } catch (error: any) {
            onError(error);
          }
        }}
        listType="picture-card"
        fileList={fileList}
        // maxCount={100}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={(file) => {
          const isJpgOrPng =
            file.type === "image/jpeg" || file.type === "image/png";
          if (!isJpgOrPng) {
            message.error("You can only upload JPG/PNG files!");
            return false;
          }
          const isLt2M = file.size / 1024 / 1024 < 2;
          if (!isLt2M) {
            message.error("Image must be smaller than 2MB!");
            return false;
          }
          return true;
        }}
        accept="image/*"
      >
        {/* {fileList.length >= 10 ? null : uploadButton} */}
        {uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="avatar" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default UploadMultiImg;

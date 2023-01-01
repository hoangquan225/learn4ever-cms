import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect } from "react";

const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const UploadImg = ({
    defaultUrl,
    onChangeUrl,
}: {
    defaultUrl?: string | null;
    onChangeUrl: (value: string) => void;
}) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (defaultUrl) {
            setFileList([
                {
                    uid: '-1',
                    name: 'default.png',
                    status: 'done',
                    url: defaultUrl,
                }
            ])
            onChangeUrl(defaultUrl)
        } else { 
            setFileList([])
            onChangeUrl('')
        }
        
    }, [defaultUrl])

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
        onChangeUrl(newFileList?.[0]?.response ?? '')
    }

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
    );

    return (
        <>
            <Upload
                action={`https://test-toeic.online:1443/api/upload-file?baseFolder=hust-cms`}
                listType="picture-card"
                fileList={fileList}
                maxCount={1}
                onPreview={handlePreview}
                onChange={handleChange}
            >
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
}

export default UploadImg;
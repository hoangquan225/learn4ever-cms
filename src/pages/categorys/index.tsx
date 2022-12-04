import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '../../redux/hook';

interface DataType {
    key: string;
    stt: number;
    name: string;
    status: string[];
}

const Category = () => {
    const count = useAppSelector((state) => state.counter.value)
    const dispatch = useAppDispatch()

    const columns: ColumnsType<DataType> = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (_, { status }) => (
                <>
                    {status.map((tag) => {
                        let color = ''
                        if (tag === 'active') {
                            color = 'green';
                        } else {
                            color = 'volcano'
                        }
                        return (
                            <Tag color={color} key={tag}>
                                {tag.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a>chỉnh sửa</a>
                    <a>xóa</a>
                </Space>
            ),
        },
    ];

    const data: DataType[] = [];

    for (let i = 1; i <= 12; i++) {
        data.push({
            key: `${i}`,
            stt: i,
            name: `Lớp ${i}`,
            status: ['active'],
        })
    }

    return (<div>
        <Button type='primary' style={{
            marginBottom: "10px"
        }}>thêm mới</Button>
        <Table columns={columns} dataSource={data} />
    </div>)

}

export default Category
import { unwrapResult } from "@reduxjs/toolkit";
import { Button, Checkbox, Form, Modal, notification } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useForm } from "antd/es/form/Form";
import { useEffect, useRef, useState } from "react";
import { topicState } from "../pages/courseDetail/topicSlice";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { questionState, requestLoadQuestionsByIdTopic, requestUpdateQuestion, setQuestionInfo } from "../redux/question";
import TTCSconfig from "../submodule/common/config";
import { Question } from "../submodule/models/question";
import './style.scss';
import TinymceEditor from "./TinymceEditor";

const ModalCreateAndUpdateQuestion = (props: {
    question: Question | null,
    isEdit: boolean,
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    handleUpdatePraticeForTopic?:(question: Question) => Promise<void>
}) => {
    const { isEdit, isOpen, question, setIsOpen, handleUpdatePraticeForTopic =() => {} } = props
    const [form] = useForm();
    const questionRef = useRef<any>();
    const hintRef = useRef<any>();
    const dispatch = useAppDispatch()
    const questionStates = useAppSelector(questionState)
    const topicStates = useAppSelector(topicState)
    const [answers, setAnswers] = useState<{
        index: number,
        text: string,
        isResult: boolean
    }[]>([])

    useEffect(() => {
        if (isOpen) {
            setAnswers(question ? question?.answer : [])
            questionRef?.current?.setContent(question?.question)
            hintRef?.current?.setContent(question?.hint)
        } else {
            // reset
            dispatch(setQuestionInfo(null))
            questionRef?.current?.setContent('')
            hintRef?.current?.setContent('')
        }
    }, [question, isOpen])

    const handleOk = async () => {

        // console.log(new Question({
        //     ...question,
        //     answer: answers,
        //     question: questionRef.current?.getContent(),
        //     hint: hintRef.current?.getContent(),
        //     index: topicStates.dataTopic?.topicType === TTCSconfig.TYPE_TOPIC_VIDEO 
        //             ? topicStates.dataTopic.timePracticeInVideo?.length ? topicStates.dataTopic.timePracticeInVideo[0].questionData.length + 1 : 1
        //             : (question?.index ? question?.index : questionStates.total + 1),
        //     idTopic: topicStates.dataTopic?.id,
        //     status: TTCSconfig.STATUS_PUBLIC,
        // }));

        try {
            const res = await dispatch(requestUpdateQuestion(new Question({
                ...question,
                answer: answers,
                question: questionRef.current?.getContent(),
                hint: hintRef.current?.getContent(),
                index: topicStates.dataTopic?.topicType === TTCSconfig.TYPE_TOPIC_VIDEO 
                    ? topicStates.dataTopic.timePracticeInVideo?.length ? topicStates.dataTopic.timePracticeInVideo[0].questionData.length + 1 : 1
                    : (question?.index ? question?.index : questionStates.total + 1),
                idTopic: topicStates.dataTopic?.id,
                status: TTCSconfig.STATUS_PUBLIC,
            })))
            
            const data = unwrapResult(res)
            if (topicStates.dataTopic?.topicType === TTCSconfig.TYPE_TOPIC_VIDEO) {
                await handleUpdatePraticeForTopic(new Question(data.data))
            } else {
                const loadQuestion = await dispatch(requestLoadQuestionsByIdTopic({
                    status: TTCSconfig.STATUS_PUBLIC,
                    idTopic: topicStates.dataTopic?.id || ''
                }))
                unwrapResult(loadQuestion)
            }
            setIsOpen(false)
            setAnswers([])
            notification.success({
                message: 'cập nhật thành công',
                duration: 1.5
            })
        } catch (error) {
            notification.error({
                message: 'cập nhật không thành công',
                duration: 1.5
            })
        }

    }

    const handleCancel = async () => {
        setIsOpen(false)
        setAnswers([])
    }

    const handleCheckbox = (e: CheckboxChangeEvent, index: number) => {
        const answer = answers?.findIndex(o => o.index === index)
        const newAnswers = [...answers]
        if (answer !== -1) {
            if (e.target.checked) {
                newAnswers.splice(index, 1, { ...answers[answer], isResult: true })
                setAnswers(newAnswers)
            } else {
                newAnswers.splice(index, 1, { ...answers[answer], isResult: false })
                setAnswers(newAnswers)
            }
        }
    }

    return (
        <Modal
            title={`${isEdit ? "Chỉnh sửa" : "Tạo"} câu hỏi`}
            open={isOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={`${isEdit ? "Cập nhật" : "Tạo"}`}
            cancelText="Hủy"
            width="90%"
            style={{ top: 20 }}
            maskClosable={false}
        >
            <Form
                layout="vertical"
                name="register"
                initialValues={{

                }}
                form={form}
            >
                <Form.Item className="" label="Câu hỏi">
                    <TinymceEditor
                        id="question"
                        key="question"
                        editorRef={questionRef}
                        value={question?.question ?? ""}
                        heightEditor="300px"
                    />
                </Form.Item>

                <Form.Item label="Giải thích">
                    <TinymceEditor
                        id="hint"
                        key="hint"
                        editorRef={hintRef}
                        value={question?.hint ?? ""}
                        heightEditor="250px"
                    />
                </Form.Item>


                <div>Câu trả lời</div>
                {
                    answers.map((answer, index) => (
                        <>
                            <div>Câu {answer.index}</div>
                            <Checkbox checked={answer.isResult} onChange={(e: CheckboxChangeEvent) => handleCheckbox(e, answer.index)}>Đáp án đúng</Checkbox>
                            <TinymceEditor
                                id={`${answer.index}`}
                                key={`${answer.index}`}
                                value={answer.text}
                                inline={true}
                                className='EditorAnswer'
                                onChange={(e, editor) => {
                                    const answerValue = answers?.findIndex(o => o.index === answer.index)

                                    if (answerValue !== -1) {
                                        const newAnswers = [...answers]
                                        newAnswers.splice(answerValue, 1, { ...answers[answerValue], text: editor.getContent() })
                                        setAnswers(newAnswers)
                                    }
                                }}
                            />
                        </>
                    ))
                }

                <Button onClick={() => {
                    setAnswers([...answers, {
                        index: answers.length,
                        isResult: false,
                        text: ''
                    }])
                }}>thêm câu trả lời</Button>
            </Form>
        </Modal>
    )
}

export default ModalCreateAndUpdateQuestion
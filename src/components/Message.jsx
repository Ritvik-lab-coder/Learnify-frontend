import React from 'react'
import { FaUserCircle } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import ReactMarkdown from 'react-markdown'


const Message = ({ question, answer }) => {
    return (
        <div className='flex flex-col w-full my-4 py-4 space-y-4 px-4'>
            <div className='flex justify-end'>
                <div className='bg-yellow-400 text-black font-bold p-3 rounded-lg max-w-[60%]'>
                    <div className='flex gap-2 justify-start items-center'><FaUserCircle className='text-xl' /> You:</div>
                    {question}
                </div>
            </div>
            <div className='flex justify-start flex-col'>
                <div className='bg-gray-300 text-black p-3 rounded-lg max-w-[60%] font-bold'>
                    <div className='flex gap-2 justify-start items-center'><BsRobot className='text-xl' /> Elisa:</div>
                    <ReactMarkdown>
                        {answer}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}

export default Message

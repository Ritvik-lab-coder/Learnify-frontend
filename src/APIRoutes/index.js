export const host = "http://localhost:4000/api/v1/user"

export const signupRoute = `${host}/signup`
export const loginRoute = `${host}/login`
export const getAllCoursesByBranchRoute = `${host}/student/course/`
export const getAllCoursesByInstructor = `${host}/teacher/course/`
export const quizRoute = `${host}/teacher/course/get-course`
export const studentCourseEnrollment = `${host}/student/course`
export const getAssignments = `${host}/assignments`
export const submitAssignment = `${host}/student/assignment`
export const submitQuiz = `${host}/student/quiz`
export const getMessagesEndpoint = `${host}/chat/message/get`
export const addMessageEndpoint = `${host}/chat/message/add`
export const deleteChatsEndpoint = `${host}/chat/message/delete`
export const geminiApi = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key"
export const gradeAssignment = `${host}/teacher/assignment`
export const generateRoadmap = `${host}/teacher/course/roadmap`

export const flaskApi = 'http://localhost:5000'

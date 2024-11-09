import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Container,
    Flex,
    Avatar,
    Text,
    Heading,
    Badge,
    Button,
    Progress,
    VStack,
    FormLabel,
    Input,
    useColorModeValue,
} from '@chakra-ui/react';
import { FaUser, FaGraduationCap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { getAssignments, host } from '../../APIRoutes';

export default function ProfilePage() {
    const user = JSON.parse(localStorage.getItem('user'));
    const courses = JSON.parse(localStorage.getItem('student-courses'));
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        image: null,
    });
    const navigate = useNavigate();
    const bgColor = useColorModeValue('white', 'gray.800');
    const innerBgColor = useColorModeValue('white','gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.200');

    const [courseAssignments, setCourseAssignments] = useState([]);
    const hasMounted = useRef(false);

    useEffect(() => {
        if (user && !hasMounted.current) {
            setFormData({
                name: user.name,
                email: user.email,
                username: user.username,
                image: user.image?.url || null,
            });
            hasMounted.current = true;
        }
    }, []);

    const handleFileChange = (e) => {
        const file=e.target.files[0]
        const reader=new FileReader()
        reader.onload = () => {
            setSelectedFile(file);
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleProfileUpdate = async () => {
        const data = new FormData();
        console.log(user);        
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('username', formData.username);
        if (selectedFile) {
            data.append('image', selectedFile);
        }
        for (let [key, value] of data.entries()) {
            console.log(key, value);
        }

        try {
            const response = await axios.patch(`${host}/update/${user._id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert("An error occurred while updating the profile.");
        }
    };

    const handleViewCourses = () => {
        navigate(`${user.role === 'Student' ? "/home/mycourses" : "/home/teacher"}`);
    };

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const promises = courses?.map(async (course) => {
                    const response = await axios.get(getAssignments, {
                        headers: {
                            course: course._id
                        }
                    });
                    const assignments = response.data.assignments || [];

                    const submittedCount = assignments?.filter(a => a.submissions.some(sub => sub.student === user._id)).length || 0;
                    
                    return {    
                        courseId: course._id,
                        courseName: course.name,
                        totalAssignments: assignments.length,
                        submittedAssignments: submittedCount,
                    };
                });

                const results = await Promise.all(promises);
                setCourseAssignments(results);
            } catch (error) {
                console.error('Error fetching assignments:', error);
            }
        };

        if (courses && courses.length > 0) {
            fetchAssignments();
        }
    }, [user._id]);

    return (
        <Container maxW="container.xl" py={8}>
            <Flex>
                <Box className="w-1/2 pr-4">
                    <Box bg={innerBgColor} p={6} rounded="lg" shadow="md" mb={6}>
                        <Flex alignItems="center" mb={4}>
                            <Avatar size="xl" name={formData.name} src={formData.image} mr={4} />
                            <Box>
                                <Heading size="lg">{formData.name}</Heading>
                                <Text color={textColor}>@{formData.username.length>11?formData.username.slice(0,11)+'...':formData.username}</Text>
                            </Box>
                        </Flex>

                        <Button mt={4} colorScheme="blue" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>

                        {isEditing && (
                            <Box mt={4}>
                                <FormLabel htmlFor="name">Name</FormLabel>
                                <Input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                />

                                <FormLabel htmlFor="email" mt={4}>Email</FormLabel>
                                <Input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                />

                                <FormLabel htmlFor="username" mt={4}>Username</FormLabel>
                                <Input 
                                    type="text" 
                                    id="username" 
                                    name="username" 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                />

                                <FormLabel htmlFor="profile-picture" mt={4}>Change Profile Picture</FormLabel>
                                <Input 
                                    type="file" 
                                    id="profile-picture" 
                                    onChange={handleFileChange} 
                                    accept="image/png, image/jpeg, image/jpg" 
                                />

                                <Button mt={4} colorScheme="blue" onClick={handleProfileUpdate}>
                                    Submit Changes
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box className="w-1/2 pl-4">
                    <Box bg={innerBgColor} p={6} rounded="lg" shadow="md">
                        <Heading size="md" mb={4}>Courses Joined</Heading>
                        <Text color={textColor} mb={4}>Your learning journey</Text>
                        <VStack spacing={4} align="stretch">
                            {courseAssignments.map((courseData) => (
                                <Box key={courseData.courseId}>
                                    <Flex justify="space-between" mb={2}>
                                        <Text fontWeight="semibold">{courseData.courseName}</Text>
                                        <Badge>{`${courseData.submittedAssignments}/${courseData.totalAssignments} assignments`}</Badge>
                                    </Flex>
                                    <Progress
                                        value={(courseData.submittedAssignments / courseData.totalAssignments) * 100}
                                        size="sm"
                                        colorScheme="blue"
                                    />
                                </Box>
                            ))}
                        </VStack>
                        <Button 
                            leftIcon={<FaGraduationCap />} 
                            colorScheme="blue" 
                            mt={4} 
                            width="full" 
                            onClick={handleViewCourses}
                        >
                            View All Courses
                        </Button>
                    </Box>
                </Box>
            </Flex>
        </Container>
    );
}

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Textarea,
  useToast,
  Text,
  Circle,
  HStack,
  Image,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  FormControl,
  FormLabel,
  Modal,
  AspectRatio,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Link,
  Icon,
  Badge,
  Spinner
} from "@chakra-ui/react";
import { TimeIcon, AttachmentIcon, CheckIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  generateRoadmap,
  getAssignments,
  gradeAssignment,
  submitAssignment,
} from "../../APIRoutes/index.js";
import { host } from "../../APIRoutes/index.js";
import BarGraph from "../../components/bargraph.jsx";


function Roadmap({ roadmap, user }) {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const { id } = useParams();
  const toast = useToast();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("heer");

    if (selectedFile) {
      setFile(selectedFile);
      console.log("Selected file:", selectedFile);
    } else {
      console.log("No file selected.");
    }
  };

  const handleUploadContent = () => {
    fileInputRef.current.click();
  };

  const handleFileSubmit = async (roadmapId) => {
    if (!file) {
      console.warn("No file selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("content", file);

    try {
      const response = await axios.post(
        `${host}/teacher/course/roadmap/${id}/content`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            roadmapid: roadmapId,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "File uploaded successfully",
          description: response.data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        console.log("File uploaded successfully:", response.data);
        setFile(null);
        fileInputRef.current.value = null;
      }
    } catch (error) {
      toast({
        title: "Error uploading file",
        description: "There was an error uploading the file.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Accordion allowToggle>
      {roadmap.map((item, index) => (
        <AccordionItem
          key={index}
          borderWidth="1px"
          borderRadius="md"
          overflow="hidden"
          mb={4}
        >
          <h2>
            <AccordionButton _expanded={{ bg: "teal.50" }} p={4}>
              <HStack spacing={4} w="full">
                <Circle
                  size="30px"
                  bg="teal.500"
                  color="white"
                  fontWeight="bold"
                >
                  {index + 1}
                </Circle>
                <Box flex="1" textAlign="left" fontWeight="medium">
                  {item.title}
                </Box>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} px={6} bg="gray.50">
            <Text mb={4} color="gray.700">
              {item.description}
            </Text>

            <Flex direction="column" gap={4} wrap="wrap">
              {/* Conditionally render video card or 'No content uploaded' message */}
              {item.links.length > 0 ? (
                <Box
                  width="100%"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  p={4}
                  bg="white"
                >
                  <Text fontWeight="bold" mb={2} color="gray.700">
                    Video Content
                  </Text>
                  <AspectRatio ratio={2 / 1} width="100%">
                    <iframe
                      title="Video Content"
                      src={item.links[0]}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      allowFullScreen
                    />
                  </AspectRatio>
                </Box>
              ) : (
                <Box
                  width="100%"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  p={4}
                  bg="white"
                >
                  <Text color="gray.600" fontSize="md">
                    No content uploaded
                  </Text>
                </Box>
              )}

              {/* Upload button for Teachers */}
              {user.role === "Teacher" && (
                <>
                  <Button colorScheme="teal" onClick={handleUploadContent}>
                    Upload Content
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => handleFileSubmit(item._id)}
                  >
                    Submit
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </>
              )}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const courses = JSON.parse(
    localStorage.getItem(
      user.role === "Student" ? "student-courses" : "teacher-courses"
    )
  );

  const toast = useToast();
  const navigate = useNavigate();
  const selectedCourse = courses.find((course) => course._id === id);
  const roadmap = selectedCourse?.roadmap ? selectedCourse.roadmap : [];
  const [roadmaps, setRoadmaps] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [file, setFile] = useState(null);
  const [grades, setGrades] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState({});
  const [studentMarks, setStudentMarks] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const [newAssignment, setNewAssignment] = useState({
    deadline: "",
    course: id,
    description: "",
    criteria: ["", "", ""],
  });
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(`${getAssignments}`, {
          headers: {
            course: `${id}`,
          },
          withCredentials: true,
        });
        if (response.data.success) {
          setAssignments(response.data.assignments);
        }
      } catch (error) {
        console.log("Error fetching assignments:", error);
      }
    };

    const handleLeaderBoard = async () => {
      try {
        const response = await axios.get(`${host}/course/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        // console.log(response.data);

        setStudentMarks(response.data.leaderboard);
        // setHisto(true);
      } catch (error) {
        console.log("Error fetching leaderboard:", error);
      }
    };
    fetchAssignments();
    handleLeaderBoard();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCriteriaChange = (index, value) => {
    const updatedCriteria = [...newAssignment.criteria];
    updatedCriteria[index] = value;
    setNewAssignment((prev) => ({
      ...prev,
      criteria: updatedCriteria,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (assignmentId) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const openVideo = (video) => {
      setSelectedVideo(video);
      onOpen();
    };

    const formData = new FormData();
    formData.append("submissionFile", file);
    formData.append("assignmentId", assignmentId);

    try {
      const response = await axios.post(
        `${submitAssignment}/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast({
          title: "File uploaded",
          description: "Your assignment was uploaded successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setFile(null);
        setHasSubmitted((prev) => ({ ...prev, [assignmentId]: true }));
      }
    } catch (error) {
      console.log("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your assignment.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTakeQuiz = (id) => {
    navigate(`/home/quiz/${id}`);
  };

  const handleGenerateQuiz = async () => {
    try {
      const response = await axios.get(`${host}/teacher/course/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        console.log("Quiz generated:", response.data);
        toast({
          title: `Success`,
          description: `Quiz generated successfully`,
          status: `success`,
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.log("Error generating quiz:", error);
      toast({
        title: "Error",
        description: "Failed to generate quiz.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateAssignment = async () => {
    // Validate the form inputs
    const { deadline, course, description, criteria } = newAssignment;
    if (!deadline || !course || !description || criteria.some((c) => !c)) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all fields.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const assignmentData = {
      deadline,
      course,
      description,
      criteria,
    };

    try {
      const response = await axios.post(
        `${host}/teacher/assignment`,
        assignmentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast({
          title: "Assignment Created",
          description: "Your assignment has been created successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setShowAssignmentForm(false);
        setNewAssignment({
          deadline: "",
          course: id,
          description: "",
          criteria: ["", "", ""],
        });
        const fetchAssignments = async () => {
          try {
            const response = await axios.get(`${getAssignments}`, {
              headers: {
                course: `${id}`,
              },
              withCredentials: true,
            });
            if (response.data.success) {
              setAssignments(response.data.assignments);
            }
          } catch (error) {
            console.log("Error fetching assignments:", error);
          }
        };
        fetchAssignments();
      } else {
        toast({
          title: "Failed to Create Assignment",
          description: response.data.message || "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.log("Error creating assignment:", error);
      toast({
        title: "Error",
        description: "There was an error creating the assignment.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const truncateText = (text, maxLength) => {
    return text?.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleGrade = async (aid) => {
    try {
      const response = await axios.get(`${gradeAssignment}`, {
        headers: {
          studentId: `${user._id}`,
          assignmentId: `${aid}`,
        },
      });
      if (response.data.success) {
        setGrades((prev) => ({
          ...prev,
          [aid]: response.data.evaluation,
        }));
      }
    } catch (error) {
      console.log("Error fetching grade:", error);
      toast({
        title: "Error",
        description: "Failed to fetch grade.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      const response = await axios.get(`${generateRoadmap}/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Roadmap generated",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setRoadmaps(response.data.roadmap);
      }
    } catch (error) {
      console.log(error);
    }
  };

 
function GradeButton({ item, grades, handleGrade,onOpen }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculateGrade = async (id) => {
    setIsLoading(true); // Show loading indicator
    await handleGrade(id); // Call the grade calculation function
    setIsLoading(false); // Hide loading indicator once done
  };

  return (
    <>
      {grades[item._id] === undefined ? (
        <Button
          colorScheme="blue"
          onClick={() => handleCalculateGrade(item._id)}
          width="48%"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner size="md" color="white" /> // Show spinner while loading
          ) : (
            "Calculate Grade"
          )}
        </Button>
      ) : (
        <Button colorScheme="blue" width="48%" size="lg" onClick={onOpen}>
          See Grade
        </Button>
      )}
    </>
  );
}

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Card>
          <CardHeader>
            <Heading size="lg">{selectedCourse.name}</Heading>
          </CardHeader>
          {selectedCourse.img?.url && (
            <Image
              src={selectedCourse.img.url}
              alt={`${selectedCourse.name} image`}
              objectFit="cover"
              borderRadius="md"
              maxH="200px"
              width="100%"
            />
          )}
          <CardBody>
            <Text>{truncateText(selectedCourse.description, 400)}</Text>
          </CardBody>

          <Box p={4}>
            <Flex gap={4} flexWrap="wrap" justifyContent="flex-start">
              <Button
                colorScheme="teal"
                variant="solid"
                onClick={() => handleTakeQuiz(id)}
              >
                {user.role === "Teacher" ? "View Quiz" : "Take Quiz"}
              </Button>

              {user.role === "Teacher" && (
                <Button
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => handleGenerateQuiz()}
                >
                  AI Generate Quiz
                </Button>
              )}

              {user.role === "Teacher" &&
                roadmaps.length === 0 &&
                roadmap.length === 0 && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => handleGenerateRoadmap()}
                  >
                    AI Generate Roadmap
                  </Button>
                )}
            </Flex>
          </Box>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Course Roadmap</Heading>
          </CardHeader>
          <CardBody>
            <Roadmap roadmap={roadmap} user={user} />
          </CardBody>
        </Card>

        {assignments.length !== 0 && (
          <Heading as="h2" size="xl" mt={12} mb={6}>
            Assignments
          </Heading>
        )}
        <VStack spacing={6} align="stretch">
          {assignments.map((item, index) => (
            <Card
              key={item._id}
              display="flex"
              flexDirection="column"
              width="100%"
            >
              <CardBody display="flex" flexDirection="column" flexGrow={1}>
                <VStack align="start" mb={4}>
                  <HStack mb={2}>
                    <Icon as={TimeIcon} color="red.500" />
                    <Heading size="md">{item.description}</Heading>
                  </HStack>
                  <HStack className="flex flex-wrap" spacing={2} mb={2}>
                    {item.criteria.map((c, idx) => (
                      <Badge colorScheme="gray" key={idx}>
                        {c}
                      </Badge>
                    ))}
                  </HStack>
                  <Text fontWeight="semibold" mb={4}>
                    Deadline: {new Date(item.deadline).toLocaleDateString()}
                  </Text>
                </VStack>

                {user.role === "Student" && (
                  <VStack spacing={4} align="stretch">
                    {/* Upload Button */}
                    <Button
                      as="label"
                      htmlFor={`file-input-${index}`}
                      colorScheme={hasSubmitted[item._id] ? "green" : "teal"} // Change color if uploaded
                      width="100%"
                      size="lg"
                      cursor="pointer"
                      leftIcon={
                        hasSubmitted[item._id] ? (
                          <CheckIcon />
                        ) : (
                          <AttachmentIcon />
                        )
                      } // Add an icon based on status
                      isDisabled={hasSubmitted[item._id]} // Disable if already submitted
                    >
                      {hasSubmitted[item._id]
                        ? "Uploaded"
                        : "Upload Assignment"}
                      <Input
                        id={`file-input-${index}`}
                        type="file"
                        display="none"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                    </Button>

                    {/* If the assignment is not submitted, show the Submit and See Grade buttons */}
                    <HStack spacing={4} width="100%" justify="space-between">
                      {/* Submit Button (only visible if not submitted) */}
                      {!hasSubmitted[item._id] && (
                        <Button
                          colorScheme="teal"
                          onClick={() => handleFileUpload(item._id)}
                          isDisabled={!file} // Disable if no file is selected
                          width="48%"
                          size="lg"
                        >
                          Submit
                        </Button>
                      )}
                      <GradeButton item={item} grades={grades} handleGrade={handleGrade} onOpen={onOpen}></GradeButton>
                
                    </HStack>
                  </VStack>
                )}

                {grades[item._id] && (
                  <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent maxWidth="80%">
                      <ModalHeader>Your Grade</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        {/* Grade Section */}
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="teal.500"
                          mb={4}
                        >
                          Score: {grades[item._id].grade}/10
                        </Text>

                        {/* Criteria and Feedback Section */}
                        {Object.entries(grades[item._id])
                          .filter(([key]) => key !== "grade") // Exclude 'grade' property
                          .map(([criteria, feedback]) => (
                            <Box key={criteria} mb={4}>
                              {/* Display the criterion */}
                              <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color="gray.700"
                              >
                                {criteria}
                              </Text>
                              {/* Display the feedback for the criterion */}
                              <Text color="gray.600" fontSize="md">
                                {feedback}
                              </Text>
                            </Box>
                          ))}
                      </ModalBody>
                      <ModalFooter>
                        <Button colorScheme="blue" onClick={onClose}>
                          Close
                        </Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                )}
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* Create Assignment Form (Teacher Only) */}
        {user.role === "Teacher" && (
          <>
            {showAssignmentForm ? (
              <Box p={6} borderWidth="1px" borderRadius="lg" mb={6} mt={8}>
                <Heading as="h3" size="lg" mb={6}>
                  Create New Assignment
                </Heading>

                <FormControl mb={4}>
                  <FormLabel>Deadline</FormLabel>
                  <Input
                    type="date"
                    name="deadline"
                    value={newAssignment.deadline}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={newAssignment.description}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Criteria 1</FormLabel>
                  <Input
                    value={newAssignment.criteria[0]}
                    onChange={(e) => handleCriteriaChange(0, e.target.value)}
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Criteria 2</FormLabel>
                  <Input
                    value={newAssignment.criteria[1]}
                    onChange={(e) => handleCriteriaChange(1, e.target.value)}
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Criteria 3</FormLabel>
                  <Input
                    value={newAssignment.criteria[2]}
                    onChange={(e) => handleCriteriaChange(2, e.target.value)}
                  />
                </FormControl>

                <Button colorScheme="teal" onClick={handleCreateAssignment}>
                  Submit Assignment
                </Button>
                <Button
                  mx={2}
                  colorScheme="teal"
                  onClick={() => {
                    setShowAssignmentForm(false);
                  }}
                >
                  Back
                </Button>
              </Box>
            ) : (
              <Button
                colorScheme="teal"
                onClick={() => setShowAssignmentForm(true)}
                m={2}
              >
                Create Assignment
              </Button>
            )}
          </>
        )}
        <Card>
          <CardHeader>
            <Heading size="md">Leaderboard</Heading>
            <Text>Top performers in this course</Text>
          </CardHeader>
          <CardBody>
            <BarGraph studentMarks={studentMarks} />
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

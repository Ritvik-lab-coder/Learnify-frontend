import React, { useState, useEffect } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Flex,
  Badge,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
} from "@chakra-ui/react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { host } from "../../APIRoutes";
import "./calendarStyles.css";
import { CustomKanban } from "../../components/CustomKanban";

// Extend the theme for custom styles
const theme = extendTheme({
  colors: {
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      500: "#2196f3",
      600: "#1e88e5",
    },
  },
  styles: {
    global: {
      ".react-calendar": {
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
        padding: "20px",
        height: "auto", // Ensure calendar grows based on its content
      },
      ".react-calendar__tile--active": {
        backgroundColor: "#2196f3 !important",
        color: "white",
        borderRadius: "8px",
      },
      ".react-calendar__navigation button": {
        color: "#2196f3",
      },
    },
  },
});

export default function AssignmentCalendar() {
  const [deadlines, setDeadlines] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const user = JSON.parse(localStorage.getItem("user"));

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const response = await axios.get(
          `${host}/student/assignment/${user._id}`
        );
        if (response.data.success) {
          setDeadlines(response.data.deadlines);
        } else {
          setError("Failed to fetch deadlines.");
        }
      } catch (err) {
        console.error("Error fetching deadlines:", err);
        setError("Error fetching deadlines. Please try again later.");
      }
    };

    fetchDeadlines();
  }, [user._id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toDateString();
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const deadline = deadlines.find(
        (d) => formatDate(d.deadline) === date.toDateString()
      );
      if (deadline) {
        return deadline.submitted ? "submitted" : "unsubmitted";
      }
    }
    return null;
  };

  return (
    <ChakraProvider theme={theme}>
      <Container maxW="100%" px={4} py={10}>
        <Heading as="h1" size="xl" textAlign="center" color="brand.600" mb={8}>
          Assignment Calendar
        </Heading>
        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth={1}
          borderColor={borderColor}
          p={8}
          boxShadow="lg"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={8}
            align={{ base: "center", md: "start" }}
            justify="space-between" // Ensures even spacing between Calendar and Deadlines
          >
            {/* Calendar Section */}
            <Box flex="1" w="100%" minHeight="500px"> {/* Adjusted minHeight */}
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileClassName={tileClassName}
              />
            </Box>

            {/* Deadlines Section */}
            <Box flex="1" w="100%">
              <Heading as="h3" size="md" mb={4} color="brand.600">
                Upcoming Deadlines
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                {deadlines.length > 0 ? (
                  deadlines.map((deadline) => (
                    <Box
                      key={deadline._id}
                      p={4}
                      borderRadius="md"
                      bg={deadline.submitted ? "green.50" : "red.50"}
                      border="1px solid"
                      borderColor={deadline.submitted ? "green.200" : "red.200"}
                    >
                      <Text color={textColor} fontWeight="bold" mb={2}>
                        {deadline.title}
                      </Text>
                      <Text color={textColor} mb={2}>
                        {deadline.description}
                      </Text>
                      <Badge
                        colorScheme={deadline.submitted ? "green" : "red"}
                        mb={1}
                      >
                        Due: {new Date(deadline.deadline).toLocaleDateString()}
                      </Badge>
                    </Box>
                  ))
                ) : (
                  <Text color="gray.500">No upcoming deadlines.</Text>
                )}
              </SimpleGrid>
            </Box>
          </Flex>

          {/* Kanban Section */}
          <Box mt={8} className="overflow-hidden">
            <Heading as="h3" size="md" color="brand.600" mb={4}>
              Manager
            </Heading>
            <CustomKanban deadlines={deadlines}/>
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert status="error" mt={6} borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Container>
    </ChakraProvider>
  );
}

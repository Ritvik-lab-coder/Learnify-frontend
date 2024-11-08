import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "../../components/index.js";
import { Example } from "../../components/Sidebar.jsx";
import { SquishyCard } from "../../components/index.js";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { getAllCoursesByBranchRoute } from "../../APIRoutes/index.js";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const branch = user?.branch;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${getAllCoursesByBranchRoute}/${branch}`,
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setCourses(response.data.courses);
          localStorage.setItem(
            user.role==='Student'?"student-courses":'teacher-courses',
            JSON.stringify(response.data.courses)
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCourses();
  }, []);

  // Reference for the scrollable container
  const carouselRef = useRef(null);

  // Scroll function
  const scroll = (direction) => {
    if (direction === "left") {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    } else {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white">
      <div className="relative w-full mt-4">
        <div
          ref={carouselRef}
          className="flex  justify-center items-center flex-wrap no-scrollbar p-2"
        >
          {courses.map((course, index) => {
            const imageUrl = course?.image?.url; // Safely access image URL
            return (
              <SquishyCard
                name={course.name}
                description={course.description}
                branch={course.branch}
                studentId={user._id}
                students={course.students}
                key={index}
                id={course._id}
                Key={course.enrollmentKey}
                background={imageUrl}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Courses;

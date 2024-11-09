import React, { useEffect, useRef, useState } from "react";
import { SquishyCard } from "../../components/index.js";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { getAllCoursesByInstructor } from "../../APIRoutes/index.js";

const ViewTeacherCourse = () => {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate=useNavigate()

  useEffect(() => {
    const fetchCourses = async () => {
      if(user.role.toLowerCase()==='student'){
        navigate('/')
      }
      try {
        const response = await axios.get(`${getAllCoursesByInstructor}`, {
          headers: {
            "instructorid": `${user._id}`
          }
        });
        if (response.data.success) {
          // console.log(response.data.courses);
          
          setCourses(response.data.courses);
          localStorage.setItem('teacher-courses', JSON.stringify(response.data.courses));
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchCourses();
  }, [])
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
    <div>
      <div className="relative w-full mt-4">
        <div
          ref={carouselRef}
          className="flex flex-wrap no-scrollbar space-x-2 p-2 custom-scrollbar"
        >
          {courses.map((course, index) => {
            return (
              <SquishyCard
                name={course.name}
                description={course.description}
                branch={course.branch}
                key={index}
                id={course._id}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewTeacherCourse;

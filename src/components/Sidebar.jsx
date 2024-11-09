import React, { useState } from "react";
import { FiChevronDown, FiChevronsRight, FiHome } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { MdAssignment, MdOutlineMenuBook } from "react-icons/md";
import { FaBlog, FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { useColorMode } from "@chakra-ui/react";

export const Example = () => (
  <div className="flex bg-indigo-50 min-h-screen">
    <Sidebar />
    <ExampleContent />
  </div>
);

const Sidebar = () => {
  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'dark' ? '#27272a' : '#ffffff';
  const innerBg = colorMode === 'dark' ? '#3f3f46' : '#f3f4f6';
  const textColor = colorMode === 'dark' ? '#f5f5f5' : '#374151';
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <motion.nav
      layout
      style={{
        backgroundColor: bgColor,
        color: textColor,
        width: open ? "225px" : "fit-content",
      }}
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 p-2"
    >
      <TitleSection open={open} />
      <div className="space-y-1">
        <SidebarLink to={`${user.role === "Student" ? "/home" : "/home/teacher"}`} title="Dashboard" Icon={FiHome} selected={selected} setSelected={setSelected} open={open} />
        <SidebarLink to={user.role === "Student" ? "/home" : "/home/teacher-add-course"} title={user.role === "Student" ? "Assignments" : "Add Courses"} Icon={MdAssignment} selected={selected} setSelected={setSelected} open={open} />
        {user.role === "Student" && (
          <SidebarLink to="/home/mycourses" title="My Courses" Icon={MdOutlineMenuBook} selected={selected} setSelected={setSelected} open={open} />
        )}
        <SidebarLink to="/home/calendar" title="Calendar" Icon={FaCalendarAlt} selected={selected} setSelected={setSelected} open={open} />
        <SidebarLink to="/home/blog" title="Blog" Icon={FaBlog} selected={selected} setSelected={setSelected} open={open} />
        <SidebarLink to="/home/chat" title="Chat" Icon={IoChatbubbleEllipses} selected={selected} setSelected={setSelected} open={open} />
        <SidebarLink to={`${user.role === "Student" ? "profile" : "teacherProfile"}`} title="Profile" Icon={CgProfile} selected={selected} setSelected={setSelected} open={open} />
      </div>
      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

const SidebarLink = ({ to, title, Icon, selected, setSelected, open, notifs }) => {
  return (
    <Link to={to}>
      <motion.button
        layout
        onClick={() => setSelected(title)}
        className={`relative flex h-12 items-center w-full rounded-md transition-colors hover:bg-indigo-200 ${
          selected === title ? "bg-indigo-300 text-indigo-900" : "text-slate-500"
        }`}
      >
        <motion.div layout className="grid h-full w-10 place-content-center text-lg">
          <Icon />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-medium"
          >
            {title}
          </motion.span>
        )}
        {notifs && open && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute right-4 top-2 h-5 w-5 rounded-full bg-indigo-500 text-xs text-white flex items-center justify-center"
          >
            {notifs}
          </motion.span>
        )}
      </motion.button>
    </Link>
  );
};

const TitleSection = ({ open }) => (
  <div className="mb-3 border-b border-slate-300 pb-3">
    <div className="flex items-center justify-between rounded-md hover:bg-indigo-100 transition-colors">
      <div className="flex items-center gap-2 p-2">
        <Logo />
        {open && (
          <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.125 }}>
            <span className="block text-sm font-semibold text-indigo-800">LearniFy</span>
          </motion.div>
        )}
      </div>
      {open && <FiChevronDown className="mr-2" />}
    </div>
  </div>
);

const Logo = () => (
  <motion.div layout className="grid size-10 place-content-center rounded-md bg-indigo-600">
    <svg width="24" height="24" viewBox="0 0 50 39" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white">
      <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" />
      <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" />
    </svg>
  </motion.div>
);

const ToggleClose = ({ open, setOpen }) => (
  <motion.button
    layout
    onClick={() => setOpen((pv) => !pv)}
    className="absolute bottom-0 left-0 right-0 border-t border-slate-300 hover:bg-indigo-100"
  >
    <div className="flex items-center p-2">
      <motion.div layout className="grid size-10 place-content-center text-lg">
        <FiChevronsRight className={`transition-transform ${open && "rotate-180"} text-indigo-800`} />
      </motion.div>
      {open && (
        <motion.span layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.125 }} className="text-xs font-medium text-indigo-800">
          Hide
        </motion.span>
      )}
    </div>
  </motion.button>
);

const ExampleContent = () => <div className="h-[100vh] w-full bg-gray-50"></div>;

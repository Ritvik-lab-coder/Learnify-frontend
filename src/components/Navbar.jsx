import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  useColorMode,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student-courses');
    navigate('/login');
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'white');

  return (
    <Box bg={bgColor} px={4} boxShadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          
        </Flex>

        <Flex alignItems="center">
          {token ? (
            <>
              <Link as={RouterLink} to="/home" mr={4}>
                <Button variant="ghost" color={textColor}>
                  Home
                </Button>
              </Link>
              <Link as={RouterLink} to="/home/mycourses" mr={4}>
                <Button variant="ghost" color={textColor}>
                  Courses
                </Button>
              </Link>
              <Link as={RouterLink} to="/home/chat" mr={4}>
                <Button variant="ghost" color={textColor}>
                  AI Assistant
                </Button>
              </Link>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <Avatar size="sm" name={user.name} src={user.avatar} />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/settings">
                    Settings
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button as={RouterLink} to="/login" colorScheme="blue" mr={4}>
                Login
              </Button>
              <Button as={RouterLink} to="/register" colorScheme="green">
                Signup
              </Button>
            </>
          )}
          <IconButton
            ml={4}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            aria-label={`Toggle ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
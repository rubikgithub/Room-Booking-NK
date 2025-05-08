import React, { useEffect, useState } from "react";
import { useRoutes, Navigate, useNavigate } from "react-router-dom";
import Dashboard from "./UserPages/Dashboard/index.jsx";
import Layout from "./Layout.jsx";
import Settings from "./AdminPages/index.jsx";
import RoomsAndBuildings from "./UserPages/Rooms&Buildings/index.jsx";
import Bookings from "./UserPages/MyBookings/index.jsx";
import BookingCalender from "./UserPages/BookingCalendar/index.jsx";

const AppRoute = () => {
  const unylogo = "";
  const navigate = useNavigate();
  const [openNavbar, setOpenNavbar] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState([
    // { label: <h3>HR Admin Portal</h3> },
    { label: "Dashboard" },
  ]);
  const [userData, setUserData] = useState({});

  useEffect(() => {}, []);
  const handleMenuClick = (menuName, path) => {
    setBreadcrumbItems([
      // { label: <h3>HR Admin Portal</h3> },
      { label: menuName },
    ]);
    navigate(path);
  };
  const menuItems = [
    {
      key: "1",
      label: "Register",
      onClick: () => handleMenuClick("Dashboard", "/register"),
    },

    // {
    //   key: "2",
    //   label: "Booking Calendar",
    //   onClick: () => handleMenuClick("Booking Calendar", "/booking-calender"),
    // },
    // {
    //   key: "3",
    //   label: "My Bookings",
    //   onClick: () => handleMenuClick("My Bookings", "/my-bookings"),
    // },
    // {
    //   key: "5",
    //   label: "Rooms & Buildings",
    //   onClick: () => handleMenuClick("Rooms & Buildings", "/rooms-buildings"),
    // },
    // ...(userData?.role === "admin"
    //   ? [
    //     {
    //       key: "4",
    //       label: "Settings",
    //       onClick: () => handleMenuClick("Settings", "/settings"),
    //     },
    //   ]
    //   : []),
  ];

  const profileItems = [
    // { label: <Flex justify="start" align="center" gap="5"> <span className="icon-user" /> <span>Employee Feedback</span> </Flex>, },
    // { label: <Flex justify="start" align="center" gap="5"> <span className="icon-setting" /> <span>Settings</span> </Flex>, },
    // {
    //     label: <Flex justify="start" align="center" gap="5"> <span className="icon-signout" /> <span>Logout</span> </Flex>,
    //     style: { color: "red" },
    //     onClick: () => (UnyProtect.logout()),
    // },
  ];

  const AllRoutes = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/booking-calender",
      element: <BookingCalender />,
    },
    {
      path: "/rooms-buildings",
      element: <RoomsAndBuildings />,
    },
    {
      path: "/my-bookings",
      element: <Bookings />,
    },
    {
      path: "/settings",
      element: <Settings />,
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ]);

  return (
    <>
      <Layout>{AllRoutes}</Layout>
    </>
  );
};

export default AppRoute;

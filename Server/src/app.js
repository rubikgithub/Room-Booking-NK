const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const createCustomerRoutes = require("./APIS/Customer/CustomerRegister");
const customerDetailsRoutes = require("./APIS/Customer/CustomerDetails");
const customerUpdateRoutes = require("./APIS/Customer/UpdateCustomer");
const buildingRoomsRoutes = require("./APIS/BuildingsRooms/BuildingRoomsList");
const allBookingsRoutes = require("./APIS/Bookings/BookingsList");
const updateCustomerRoutes = require("./APIS/Customer/UpdateCustomer");
const statusColorsListRoutes = require("./APIS/TimeStatus/statusColorsList");
const bookingServicesRoutes = require("./APIS/Bookings/BookingsServices");
const timeConfigRoutes = require("./APIS/TimeStatus/timeConfigList");
const uploadFile = require("./APIS/BuildingsRooms/RoomBuildingImages");
const app = express();
const PORT = 5056;

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", createCustomerRoutes);
app.use("/api", customerDetailsRoutes);
app.use("/api", buildingRoomsRoutes);
app.use("/api", allBookingsRoutes);
app.use("/api", updateCustomerRoutes);
app.use("/api", customerUpdateRoutes);
app.use("/api", statusColorsListRoutes);
app.use("/api", bookingServicesRoutes);
app.use("/api", timeConfigRoutes);
app.use("/api", uploadFile);

// // Enable CORS
// app.use(
//   cors({
//     origin: "https://project-booking-calendar-nk-r1.vercel.app",
//     methods: "GET, POST, PUT, DELETE, OPTIONS",
//     allowedHeaders: "Content-Type, Authorization",
//     credentials: true,
//   })
// );

// // Handle preflight requests
// app.options("*", cors());

// // Optional logger

app.use(cors("*"));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Import and use centralized route manager

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const createCustomerRoutes = require("./APIS/Customer/CustomerRegister");
const customerDetailsRoutes = require("./APIS/Customer/CustomerDetails");
const buildingRoomsRoutes = require("./APIS/BuildingsRooms/BuildingRoomsList");

const app = express();
const PORT = 5000;

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", createCustomerRoutes);
app.use("/api", customerDetailsRoutes);
app.use("/api", buildingRoomsRoutes);

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

app.use(cors('*'));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Import and use centralized route manager


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

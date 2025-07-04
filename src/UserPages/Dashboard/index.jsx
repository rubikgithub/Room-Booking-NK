import React, { useEffect, useMemo, useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { $ajax_post } from "../../Library";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChartComponent } from "./PieChart";
import { RadialChartComponent } from "./RadialChartComponent";
import { LineChartComponent } from "./LineChartComponent";

const ajaxPost = (url, data) => {
  return new Promise((resolve, reject) => {
    $ajax_post(url, data,
      (response) => resolve(response),
      (error) => reject(error)
    );
  });
};

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

const Dashboard = () => {
  const { user } = useClerk();
  const [userDetails, setUserDetails] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({})
  useEffect(() => {
    setUserDetails(user);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      new Promise((resolve) => $ajax_post("rooms", {}, resolve)),
      new Promise((resolve) => $ajax_post("buildings", {}, resolve)),
      new Promise((resolve) => $ajax_post("users", {}, resolve)),
      new Promise((resolve) => $ajax_post("allBookings", {}, resolve)),
    ]).then(([roomsRes, buildingsRes, usersRes, bookingsRes]) => {
      setRooms(roomsRes || []);
      setBuildings(buildingsRes || []);
      setUsers(usersRes || []);
      setBookings(bookingsRes || []);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const scheduledRoomsToday = bookings.filter((b) => b.date === today);
  const scheduledRoomIdsToday = new Set(
    scheduledRoomsToday.map((b) => b.room_id)
  );
  const vacantRoomsToday = rooms.filter(
    (r) => !scheduledRoomIdsToday.has(r.id)
  );
  const studentCount = users.filter(
    (u) =>
      (u.role || "").toLowerCase() === "user" ||
      (u.role || "").toLowerCase() === "student"
  ).length;

  const summaryChartData = [
    {
      label: "Rooms",
      count: loading ? 0 : rooms.length,
    },
    {
      label: "Buildings",
      count: loading ? 0 : buildings.length,
    },
    {
      label: "Students",
      count: loading ? 0 : studentCount,
    },
    {
      label: "Vacant Rooms Today",
      count: loading ? 0 : vacantRoomsToday.length,
    },
    {
      label: "Scheduled Rooms Today",
      count: loading ? 0 : scheduledRoomsToday.length,
    },
  ];
  const [cardData, setCardData] = useState([])
  const apiCall = async () => {
    const [data, data1] = await Promise.all([
      ajaxPost("/dashboard", {}),
      // ajaxPost("/dashboard/metrics", {}),
      // ajaxPost("/dashboard/department-stats", {}),
      // ajaxPost("/dashboard/top-rooms", {}),
      ajaxPost("/dashboard/monthly-volume?year=2024", {}),
      // ajaxPost("/dashboard/year-comparison", {}),
      // ajaxPost("/dashboard/active-bookings", {}),
      // ajaxPost("/dashboard/pending-requests", {}),
      // ajaxPost("/dashboard/available-rooms", {}),
    ])
    console.log(data, "data", data1)
    setDashboardData(data)
    setCardData(
      [
        {
          title: "Total Bookings Today",
          // description: "Total rooms in the system",
          value: data?.metrics?.total_bookings_today || 0,
          bg: "bg-[hsl(var(--chart-1))]",
        },
        {
          title: "Active Bookings (Now)",
          // description: "Total buildings",
          value: data?.metrics?.active_bookings_now || 0,
          bg: "bg-[hsl(var(--chart-2))]",
        },
        {
          title: "Rooms Available Now ",
          // description: "Registered students",
          value: data?.metrics?.available_rooms_count || 0,
          bg: "bg-[hsl(var(--chart-3))] text-[hsl(var(--chart-4))]",
        },
        {
          title: "Pending Requests",
          // description: "Rooms not booked today",
          value: data?.metrics?.pending_requests || 0,
          bg: "bg-[hsl(var(--chart-4))]",
        },
        {
          title: "Cancelled/Rejected Bookings (Today/Week)",
          // description: "Rooms booked today",
          value: `${data?.metrics?.cancelled_rejected_today || 0}/${data?.metrics?.cancelled_rejected_week || 0}`,
          bg: "bg-[hsl(var(--chart-5))]",
        },
        {
          title: "No. of Rooms in Maintenance",
          // description: "Rooms booked today",
          value: data?.metrics?.maintenance_rooms || 0,
          bg: "bg-[hsl(var(--chart-5))]",
        },
      ]
    )

  }
  useEffect(() => {
    apiCall()
  }, [])



  return (
    <>
      <h1>Dashboard</h1>
      <h3>
        Hi, Welcome{" "}
        <span className="font-bold text-[hsl(var(--chart-3))]">
          {userDetails?.firstName || "User"}
        </span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-6">
        {cardData?.map((card, index) => (
          <Card key={index} className={card.bg}>
            <CardHeader>
              <CardTitle style={{fontSize:"larger"}}>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: "22px" }} className="text-3xl font-bold">
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <PieChartComponent data={dashboardData?.charts?.departmentStats} />
        <BarChartComponent data={dashboardData?.charts?.topRooms} />
        <RadialChartComponent data={summaryChartData} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-6">
        <LineChartComponent chartData={dashboardData?.charts?.monthlyBookings} />
      </div>
    </>
  );
};

export default Dashboard;

function BarChartComponent({ data = [] }) {
  const chartConfigs = {
    booking_count: {
      label: "Bookings",
      color: "hsl(var(--chart-1))",
    },
    capacity: {
      label: "Capacity",
      color: "hsl(var(--chart-2))",
    },
  };

  const [activeChart, setActiveChart] = useState("booking_count");

  const total = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        booking_count: 0,
        capacity: 0,
        rooms: 0
      };
    }

    return {
      booking_count: data.reduce((acc, curr) => acc + (curr?.booking_count || 0), 0),
      capacity: data.reduce((acc, curr) => acc + (curr?.capacity || 0), 0),
      rooms: data.length
    };
  }, [data]);

  // Format capacity for display
  const formatCapacity = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <Card className="min-h-[200px] w-full">
      {/* <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row"> */}
      <CardHeader className="items-center pb-0">

        <CardTitle style={{ fontSize: '1rem' }}>Top 5 most booked rooms</CardTitle>

      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfigs}
          className="aspect-auto h-[250px] w-full"
        >
          {data && data.length > 0 ? (
            <BarChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="room_name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  // Truncate long room names
                  return value.length > 10 ? `${value.substring(0, 10)}...` : value;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  if (activeChart === "capacity") {
                    return formatCapacity(value);
                  }
                  return value.toString();
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[200px]"
                    nameKey={activeChart}
                    labelFormatter={(label) => `Room: ${label}`}
                    formatter={(value, name, props) => [
                      // activeChart === "capacity" ? `${value.toLocaleString()} capacity` : `${value} bookings`,
                      // chartConfigs[activeChart].label,
                      props.payload.building_name ? `Building: ${props.payload.building_name}` : null
                    ].filter(Boolean)}
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill={`var(--color-${activeChart})`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No room data available
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

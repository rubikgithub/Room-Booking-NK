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
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChartComponent } from "./PieChart";
import { RadialChartComponent } from "./RadialChartComponent";
import { LineChartComponent } from "./LineChartComponent";

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

  const cardData = [
    {
      title: "No. of Rooms",
      description: "Total rooms in the system",
      value: loading ? "..." : rooms.length,
      bg: "bg-[hsl(var(--chart-1))]",
    },
    {
      title: "No. of Buildings",
      description: "Total buildings",
      value: loading ? "..." : buildings.length,
      bg: "bg-[hsl(var(--chart-2))]",
    },
    {
      title: "No. of Students",
      description: "Registered students",
      value: loading ? "..." : studentCount,
      bg: "bg-[hsl(var(--chart-3))] text-[hsl(var(--chart-4))]",
    },
    {
      title: "Vacant Rooms Today",
      description: "Rooms not booked today",
      value: loading ? "..." : vacantRoomsToday.length,
      bg: "bg-[hsl(var(--chart-4))]",
    },
    {
      title: "Scheduled Rooms",
      description: "Rooms booked today",
      value: loading ? "..." : scheduledRoomsToday.length,
      bg: "bg-[hsl(var(--chart-5))]",
    },
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <h3>Hi, Welcome <span className="font-bold text-[hsl(var(--chart-3))]">{userDetails?.firstName || "User"}</span></h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {cardData?.map((card, index) => (
          <Card key={index} className={card.bg}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
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
        <PieChartComponent data={summaryChartData} />
        <BarChartComponent data={summaryChartData} />
        <RadialChartComponent data={summaryChartData} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-6">
        <LineChartComponent data={summaryChartData} />
      </div>
    </>
  );
};

export default Dashboard;

function BarChartComponent() {
  const [activeChart, setActiveChart] = useState("mobile");

  const total = useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  );

  return (
    <Card className="min-h-[200px] w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {total[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

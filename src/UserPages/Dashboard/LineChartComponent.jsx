import React, { useState, useMemo, useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Col, Flex, FormControl, FormRow, Select } from "unygc";
import { $ajax_post } from "../../Library";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate(); // Get day (1-31)
  const month = date.toLocaleDateString('en-US', { month: 'short' }); // Get short month name (e.g., Feb)
  return `${day} ${month}`;
}

const chartConfig = {
  booking_count: {
    label: "Bookings",
    color: "hsl(var(--chart-1))",
  },
};
function getPreviousYears(startYear) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push({ value: year, label: year.toString() });
  }
  return years;
}
const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];
export function LineChartComponent() {
  const [activeChart, setActiveChart] = useState("mobile");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear); // Set current year as default
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  // const [selectedYear, setSelectedYear] = useState(null); // Track selected year
  // const [selectedMonth, setSelectedMonth] = useState(null); // Track selected month
  const [chartData, setChartData] = useState([]);

  // Function to call API based on selected year and/or month
  const filterChartData = (year = null, month = null) => {
    let url = "/dashboard/monthly-volume";
    const params = [];

    if (year) {
      params.push(`year=${year}`);
    }
    if (month) {
      params.push(`month=${month}`);
    }
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    $ajax_post(url, {}, (response) => {

      setChartData(response || []);
    });
  };

  // Fetch data on component mount or when year/month changes
  useEffect(() => {
    // Call with current selectedYear and selectedMonth
    filterChartData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const total = useMemo(() => {
    return {
      desktop: chartData?.length && chartData?.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData?.length && chartData?.reduce((acc, curr) => acc + curr.mobile, 0),
    };
  }, []);

  const yearOptions = getPreviousYears(2000);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">

        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <Flex justify="space-between  ">
            <Col>
              {/* <CardTitle>Line Chart - Interactive</CardTitle> */}
              {/* <CardDescription> */}
              <CardTitle style={{ fontSize: '1rem' }}>Showing total visitors for the last month</CardTitle>
              {/* </CardDescription> */}
            </Col>
            <Flex justify="end">
              <FormRow cols={1} fieldAlign="side">
                <Flex justify="space-between">
                  <Col>
                    <FormControl label="" required>
                      <Select
                        name="filterChartYears"
                        multiple={false}
                        selectOptions={yearOptions}
                        onChange={(value) => {
                          setSelectedYear(value); // Update selected year
                        }}
                        placeholder="Years"
                        value={selectedYear}
                        defaultValue={selectedYear}
                      />
                    </FormControl>
                  </Col>
                  <Flex justify="end">
                    <FormControl label="" required>
                      <Select
                        name="filterChartMonth"
                        multiple={false}
                        selectOptions={months}
                        onChange={(value) => {
                          setSelectedMonth(value); // Update selected month
                        }}
                        placeholder="Months"
                        value={selectedMonth}
                        defaultValue={selectedMonth}
                      />
                    </FormControl>
                  </Flex>
                </Flex>
              </FormRow>
            </Flex>
          </Flex>
        </div>

      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={selectedMonth ? "date" : "month_name"}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => selectedMonth ? formatDate(value) : value.substring(0, 10)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="booking_count"
                  labelFormatter={(label) => `${label} 2025`}
                />
              }
            />
            <Line
              dataKey="booking_count"
              type="monotone"
              stroke="var(--color-booking_count)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-booking_count)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
import React, { useState, useMemo } from "react";
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


const chartConfig = {
  booking_count: {
    label: "Bookings",
    color: "hsl(var(--chart-1))",
  },
};

export function LineChartComponent({ chartData = [] }) {
  const [activeChart, setActiveChart] = useState("mobile");
  const total = useMemo(() => {
    return {
      desktop: chartData?.length && chartData?.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData?.length && chartData?.reduce((acc, curr) => acc + curr.mobile, 0),
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">

        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <Flex justify="space-between  ">
            <Col>
              <CardTitle>Line Chart - Interactive</CardTitle>
              <CardDescription>
                Showing total visitors for the last month
              </CardDescription>
            </Col>
            <Flex justify="end">
              <FormRow cols={1} fieldAlign="side">
                <FormControl label="" required>
                  <Select
                    name="filterChart"
                    defaultValue={"month"} // Use an array for multi-select
                    multiple={false}
                    value={"month"} // Use an array for multi-select
                    selectOptions={[
                      { value: "month", label: "Month" },
                      { value: "year", label: "Year" }
                    ]}
                    onChange={(value) => {
                      console.log(value); // Handle the selected values (array)
                    }}
                  />
                </FormControl>
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
              dataKey="month_name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value.substring(0, 3)}
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
import * as React from "react";
import { TrendingUp } from "lucide-react";
import { PieChart, Pie, Label } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export function PieChartComponent({
  data = [],
  title = "Summary of Rooms Booked",
  description = "",
  valueKey = "percentage",
  nameKey = "department",
}) {
  const total = React.useMemo(
    () => data?.reduce((acc, item) => acc + (item[valueKey] || 0), 0),
    [data, valueKey]
  );

  const colorPalette = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ];

  const processedData = data?.map((item, index) => ({
    ...item,
    fill: colorPalette[index % colorPalette.length],
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle style={{ fontSize: '1rem' }}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px]"
          config={{}}
        >
          <PieChart>
            {/* <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey={nameKey}
                  valueKey={valueKey}
                  hideLabel
                />
              }
            /> */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey={nameKey}
                  hideValue // Add this prop to hide the value
                  hideLabel={true} // Ensure the label (name) is shown
                  formatter={(value, name, payload) => {

                    // Return only the name for the tooltip
                    return name;
                  }}
                />
              }
            />
            <Pie
              data={processedData || []}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius={55}
              strokeWidth={5}
              labelLine={false}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) / 2;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[10px] font-semibold"
                  >
                    {value}%
                  </text>
                );
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox)) return null;
                  const { cx, cy } = viewBox;
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={cx}
                        y={cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {total.toLocaleString()}
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 24}
                        className="fill-muted-foreground text-xs"
                      >
                        Total
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm" style={{ fontSize: '1rem' }}>
        <div className="flex items-center gap-2 leading-none" style={{ fontSize: '1rem' }}>
          Summary of Today's Booking.
          {/* <TrendingUp className="h-4 w-4" /> */}
        </div>
        {/* <div className="leading-none text-muted-foreground"></div> */}
      </CardFooter>
    </Card>
  );
}

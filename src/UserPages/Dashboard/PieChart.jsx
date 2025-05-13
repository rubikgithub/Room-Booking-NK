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
  title = "Pie Chart",
  description = "Statistics Overview",
  valueKey = "count",
  nameKey = "label",
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

  console.log(processedData, 'processedData')
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer className="mx-auto aspect-square max-h-[250px]" config={{}}>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey={nameKey}
                  valueKey={valueKey}
                  hideLabel
                />
              }
            />
            <Pie
              data={processedData || []}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius={60}
              strokeWidth={5}
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
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Summary of key metrics
        </div>
      </CardFooter>
    </Card>
  );
}

import { TrendingUp } from "lucide-react";
import { LabelList, RadialBar, RadialBarChart } from "recharts";

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

export function RadialChartComponent({ data = [] }) {
  const colorPalette = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ];

  const processedData = data.map((item, index) => ({
    ...item,
    fill: colorPalette[index % colorPalette.length],
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle style={{ fontSize: '1rem' }}>Overview Summary</CardTitle>
        {/* <CardDescription>Summary of overall Booking's</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px]"
          config={{}} // optional if you don’t use legends/colors in this container
        >
          <RadialBarChart
            data={processedData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="label"
                  valueKey="count"
                />
              }
            />
            <RadialBar dataKey="count" background>
              <LabelList
                position="insideStart"
                dataKey="label"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm" style={{ fontSize: '1rem' }}>
        <div className="flex items-center gap-2 leading-none" style={{ fontSize: '1rem' }}>
          Summary of overall Booking's
        </div>
        {/* <div className="leading-none text-muted-foreground">
          Summary for today’s usage snapshot
        </div> */}
      </CardFooter>
    </Card>
  );
}

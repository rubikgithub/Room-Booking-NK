import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllBookings from "./AllBookings";
import MyBookings from "./MyBookings";
import RecentBookings from "./RecentBookings";

const Bookings = () => {
  const isAdmin = localStorage.getItem("role") === "admin";

  return (
    <div className="">
      <Tabs defaultValue="mybookings">
        <TabsList className="bg-muted/30 backdrop-blur-sm p-1 shadow-sm">
          {isAdmin && (
            <TabsTrigger
              value="allbookings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-accent/50 transition-all duration-200 rounded-lg font-medium px-6 py-3"
            >
              📊 All Bookings
            </TabsTrigger>
          )}
          <TabsTrigger
            value="mybookings"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-accent/50 transition-all duration-200 rounded-lg font-medium px-6 py-3"
          >
            👤 My Bookings
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="recentBooking"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-accent/50 transition-all duration-200 rounded-lg font-medium px-6 py-3"
            >
              🕒 Recent Bookings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Enhanced Tab Contents */}
        <TabsContent
          className="w-full  mt-2  bg-card/50 backdrop-blur-sm rounded-xl shadow-lg"
          value="mybookings"
        >
          <MyBookings />
        </TabsContent>

        {isAdmin && (
          <TabsContent
            className="w-full mt-2  bg-card/50 backdrop-blur-sm  shadow-lg"
            value="allbookings"
          >
            <AllBookings />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent
            className="w-full mt-2 bg-card/50 backdrop-blur-sm  shadow-lg"
            value="recentBooking"
          >
            <RecentBookings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Bookings;

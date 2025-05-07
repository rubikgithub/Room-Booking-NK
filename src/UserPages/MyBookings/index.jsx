import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllBookings from "./AllBookings";
import MyBookings from "./MyBookings";

const Bookings = () => {
    return (
        <Tabs className="w-full" defaultValue="mybookings">
            <TabsList>
                <TabsTrigger value="mybookings">My Bookings</TabsTrigger>
                <TabsTrigger value="allbookings">All Bookings</TabsTrigger>
            </TabsList>
            <TabsContent className="w-full px-2" value="mybookings">
              <MyBookings />
            </TabsContent>
            <TabsContent value="allbookings">
              <AllBookings />
            </TabsContent>
        </Tabs>
    )
}

export default Bookings
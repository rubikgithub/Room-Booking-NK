import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import User from "./User";
import Rooms from "./Rooms";
import Buildings from "./Building";
import Status from "./Status";

const Settings = () => {
  return (
    <div>
      <Tabs className="w-full" defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="building">Building</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
        </TabsList>
        <TabsContent className="w-full px-2" value="users">
          <User />
        </TabsContent>
        <TabsContent value="rooms">
          <Rooms />
        </TabsContent>
        <TabsContent value="building">
          <Buildings />
        </TabsContent>
        <TabsContent value="status">
          <Status />
        </TabsContent>
        <TabsContent value="authentication">
          Change your password here.
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

import React, { useState } from "react";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarFooter } from "./components/ui/sidebar";
import Profile from "./components/Profile";
import { ModeToggle } from "./components/mode-toggle";
import ThemeTest from "../ThemeTest";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);

  const items = [
    { title: "Dashboard", url: "/#/", icon: Home },
    { title: "Booking Calendar", url: "/#/booking-calender", icon: Inbox },
    { title: "My Bookings", url: "/#/my-bookings", icon: Calendar },
    { title: "Rooms & Buildings", url: "/#/rooms-buildings", icon: Search },
  ];

  const profileItems = [];

  return (
    <div>
      <SidebarProvider open={open}>
        <Sidebar
          variant="sidebar"
          className="bg-card border-r border-border shadow-lg"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarHeader className="text-md fw-bold border-b border-gray-200 mb-4">
                <div className="flex items-center justify-between text-foreground">
                  Booking Portal
                  <SidebarTrigger
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md p-2"
                    onClick={() => setOpen(!open)}
                  />
                </div>
              </SidebarHeader>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem
                      className="hover:bg-accent hover:text-accent-foreground rounded-md"
                      key={item.title}
                    >
                      <SidebarMenuButton asChild>
                        <a
                          href={item.url}
                          className="flex items-center gap-2 cursor-pointer text-foreground hover:text-accent-foreground"
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200">
            <ul className="sidebar-footer-menu">
              {localStorage.getItem("role") === "admin" && (
                <SidebarMenuItem className="hover:bg-accent hover:text-accent-foreground rounded-md">
                  <SidebarMenuButton>
                    <a
                      href={"/#/settings"}
                      className="flex items-center gap-2 cursor-pointer text-foreground hover:text-accent-foreground"
                    >
                      <Settings />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </ul>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col w-full">
          <header className="w-full h-[54px] bg-card border-b border-gray-200 flex items-center px-4 justify-between sticky top-0 z-50">
            {!open && (
              <SidebarTrigger
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md p-2"
                onClick={() => setOpen(!open)}
              />
            )}

            <div className="ml-auto flex items-center gap-3">
              <ModeToggle />
              <Profile
                profileItems={profileItems}
                accountText={"Room Booking Portal"}
                roleText={" "}
              />
            </div>
          </header>

          <main className="flex-1 p-4  bg-background text-foreground">
            {children}
            {/* <ThemeTest /> */}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;

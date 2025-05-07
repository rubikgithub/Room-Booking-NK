import React, { useState } from "react";
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Keyboard,
  LogOut,
  User,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { clerk } from "./LoginRegister/clerk";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);

  const items = [
    { title: "Dashboard", url: "/#/", icon: Home },
    { title: "Booking Calendar", url: "", icon: Inbox },
    { title: "My Bookings", url: "/#/my-bookings", icon: Calendar },
    { title: "Rooms & Buildings", url: "/#/rooms-buildings", icon: Search },
  ];

  const userLogOut = () => {
    try {
      clerk.load().then(() => {
        clerk.session.end();
      });
      window.location.reload();
    } catch (error) {
      console.error('Error loading Clerk:', error);
    }
  };

  return (
    <div>
      <SidebarProvider open={open}>
        <Sidebar variant="sidebar" className="bg-white shadow-lg border-none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarHeader className="text-md fw-bold border-b border-gray-200 mb-4">
                <div className="flex items-center justify-between">
                  Booking Portal
                  <SidebarTrigger
                    className="cursor-pointer"
                    onClick={() => setOpen(!open)}
                  />
                </div>
              </SidebarHeader>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem
                      className="hover:bg-gray-50 rounded-md"
                      key={item.title}
                    >
                      <SidebarMenuButton asChild>
                        <a
                          href={item.url}
                          className="flex items-center gap-2 cursor-pointer"
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
          <SidebarFooter className="border-t border-gray-200 ">
            <SidebarMenuItem
              className="hover:bg-gray-50 rounded-md"

            >
              <SidebarMenuButton>
                <a
                  href={"/#/settings"}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col w-full">
          <header className="w-full h-[54px] bg-white border-b border-gray-200 flex items-center px-4 justify-between">
            {!open && (
              <SidebarTrigger
                className="cursor-pointer"
                onClick={() => setOpen(!open)}
              />
            )}

            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Test User</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings />
                      <span>Settings</span>
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Keyboard />
                      <span>Keyboard shortcuts</span>
                      <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuItem onClick={userLogOut}>
                    <LogOut />
                    <span>Log out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;

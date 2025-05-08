import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { $ajax_post } from "../Library/Library";

const UserDrawer = ({
  open,
  mode = "view",
  onClose,
  data = {},
  onRefresh,
  setDrawerMode,
}) => {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

  const [date, setDate] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    dob: "",
    address: "",
    role: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState(data?.status || "active");
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);

  const [accessForm, setAccessForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleStatusUpdate = () => {
    $ajax_post("update-user-status", { id: data.id, status }, () => {
      setDialogOpen(false);
      onRefresh();
    });
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAccessInput = (key, value) => {
    setAccessForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAccessSubmit = () => {
    if (accessForm.password !== accessForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      id: data.id,
      email: accessForm.email,
      password: accessForm.password,
    };

    $ajax_post(`grant-access/${data?.id}`, payload, () => {
      setAccessDialogOpen(false);
      onRefresh();
    });
  };
  const handleSubmit = () => {
    const formattedDOB = date ? format(date, "yyyy-MM-dd") : "";
    const endpoint = isCreateMode ? "createUser" : `updateUser/${data?.id}`;
    const payload = isEditMode
      ? { id: data.id, ...formData, dob: formattedDOB }
      : { ...formData, dob: formattedDOB };

    $ajax_post(endpoint, payload, () => {
      onClose();
      onRefresh();
    });
  };

  const drawerTitle = isCreateMode
    ? "Create User"
    : isEditMode
    ? "Edit User"
    : "View User";

  useEffect(() => {
    if (data && (isEditMode || isViewMode)) {
      const newDate = data.dob ? new Date(data.dob) : null;
      setFormData({ ...formData, ...data });
      setDate(newDate);
    } else if (isCreateMode) {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        dob: "",
        address: "",
        role: "",
      });
      setDate(null);
    }
  }, [data, mode]);
  return (
    <>
      <Drawer open={open} onClose={onClose}>
        <DrawerContent className="w-full max-w-md ml-auto h-full shadow-xl border-l border-gray-200 bg-white z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <DrawerTitle className="text-lg font-semibold">
              {drawerTitle}
            </DrawerTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {[
              { key: "first_name", label: "First Name", required: true },
              { key: "last_name", label: "Last Name" },
              { key: "email", label: "Email", required: true, type: "email" },
              { key: "phone_number", label: "Phone Number" },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block font-medium text-sm mb-1">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <Input
                  type={field.type || "text"}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  disabled={isViewMode}
                  placeholder={`Enter ${field.label}`}
                />
              </div>
            ))}

            {/* Role */}
            <div>
              <label className="block font-medium text-sm mb-1">Role</label>
              <Select
                disabled={isViewMode}
                value={formData.role || ""}
                onValueChange={(value) => handleChange("role", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="User Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DOB */}
            <div>
              <label className="block font-medium text-sm mb-1">DOB</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !date && "text-muted-foreground"
                    }`}
                    disabled={isViewMode}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      handleChange("dob", format(selectedDate, "yyyy-MM-dd"));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Address */}
            <div>
              <label className="block font-medium text-sm mb-1">Address</label>
              <Textarea
                rows={3}
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                disabled={isViewMode}
                placeholder="Enter Address"
              />
            </div>
          </div>

          {/* Footer */}
          <DrawerFooter>
            <div className="p-2 border-t flex flex-wrap justify-between gap-2">
              {isViewMode ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setDrawerMode("edit")}
                      className="border border-gray-200 hover:bg-gray-100"
                    >
                      Edit
                    </Button>
                    <Button
                      className="border border-red-500 text-red-500 hover:bg-red-100"
                      onClick={() => {
                        $ajax_post(`deleteUser/${data?.id}`, {}, () => {
                          onClose();
                          onRefresh();
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="border border-gray-200 hover:bg-gray-100">
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-32 bg-white border border-gray-200 shadow-lg rounded-md">
                        <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                          <span>Update Status</span>
                        </DropdownMenuItem>
                        {!data?.authenticate && (
                          <DropdownMenuItem
                            onSelect={() => setAccessDialogOpen(true)}
                          >
                            <span>Give Access</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    className="hover:bg-gray-100 border border-gray-200"
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                  <DrawerClose>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </DrawerClose>
                </>
              )}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[360px] bg-white">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <RadioGroup
              value={status}
              onValueChange={setStatus}
              className="space-y-2 flex flex-col"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="cursor-pointer"
                  value="active"
                  id="r1"
                />
                <label className="cursor-pointer" htmlFor="r1">
                  Active
                </label>
              </div>
              <div className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem
                  className="cursor-pointer"
                  value="inactive"
                  id="r2"
                />
                <label className="cursor-pointer" htmlFor="r2">
                  Inactive
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              className="border border-gray-200 hover:bg-gray-100 cursor-pointer"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="border bg-black text-white border-gray-200 hover:bg-gray-900 cursor-pointer"
              onClick={handleStatusUpdate}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
        <DialogContent className="w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle>Give User Access</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="Enter Email"
                value={accessForm.email}
                onChange={(e) => handleAccessInput("email", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <Input
                type="password"
                placeholder="Enter Password"
                value={accessForm.password}
                onChange={(e) => handleAccessInput("password", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={accessForm.confirmPassword}
                onChange={(e) =>
                  handleAccessInput("confirmPassword", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setAccessDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="border bg-black text-white border-gray-200 hover:bg-gray-900 cursor-pointer"
              onClick={handleAccessSubmit}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDrawer;

import { useEffect, useState } from "react";
import {
  Drawer,
  FormControl,
  Select,
  Input,
  FormRow,
  DatePicker,
  TextArea,
  Button,
} from "unygc";
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
import { $ajax_post } from "../Library";

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
    password: "",
    confirmPassword: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState(data?.status || "active");

  const handleStatusUpdate = () => {
    $ajax_post("update-user-status", { id: data.id, status }, () => {
      setDialogOpen(false);
      onRefresh();
    });
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (isCreateMode && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const formattedDOB = date ? format(date, "yyyy-MM-dd") : "";
    const endpoint = isCreateMode ? "createUser" : `updateUser/${data?.id}`;
    const payload = isEditMode
      ? { id: data.id, ...formData, dob: formattedDOB }
      : { ...formData, dob: formattedDOB };
    if (!isCreateMode) {
      delete payload.confirmPassword;
      delete payload.password;
    }
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
        password: "",
        confirmPassword: "",
      });
      setDate(null);
    }
  }, [data, mode]);
  return (
    <>
      <Drawer
        title={drawerTitle}
        isOpen={open}
        onClose={onClose}
        footer={
          <div className=" flex flex-wrap justify-between gap-2">
            {isViewMode ? (
              <>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setDrawerMode("edit")}
                    type="primary"
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
                      <Button type="secondary" className="border border-gray-200 hover:bg-gray-100">
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32 bg-white border border-gray-200 shadow-lg rounded-md">
                      <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                        <span>Update Status</span>
                      </DropdownMenuItem>
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
                  // className="hover:bg-gray-100 border border-gray-200"
                  type="primary"
                  onClick={handleSubmit}
                >
                  Save
                </Button>

                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        }
        defaultWidth="25%"
        maxWidthSize="99.99%"
        minWidthSize="30%"
        resizable={true}
        placement="right"
        closeIcon={true}
        id="1"
      >
        <div className="flex-1 overflow-y-auto p-2 space-y-5">
          <FormRow cols={1} fieldAlign={"side"}>
            {[
              { key: "first_name", label: "First Name", required: true },
              { key: "last_name", label: "Last Name" },
              { key: "email", label: "Email", required: true, type: "email" },
              { key: "phone_number", label: "Phone Number", type: "number" },
            ].map((field, idx) => (
              <div key={idx}>
                <FormControl
                  label={field.label}
                  required={field.required}
                  viewMode={isViewMode}
                >
                  <Input
                    type={field.type || "text"}
                    value={formData[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e)}
                    disabled={isViewMode}
                    placeholder={`Enter ${field.label}`}
                  />
                </FormControl>
              </div>
            ))}

            <FormControl label="User Role" viewMode={isViewMode}>
              <Select
                defaultValue={formData?.role}
                name="User Role"
                selectOptions={[
                  { label: "Admin", value: "admin" },
                  { label: "User", value: "user" },
                ]}
                onChange={(val) => handleChange("role", val)}
              />
            </FormControl>

            <FormControl label="Date of Birth" viewMode={isViewMode}>
              <DatePicker
                value={date || ""}
                onChange={(selectedDate) => {
                  setDate(selectedDate);
                  handleChange("dob", format(selectedDate, "yyyy-MM-dd"));
                }}
              />
            </FormControl>
            <FormControl label="Address" viewMode={isViewMode}>
              <TextArea
                type="text"
                value={formData.address || ""}
                placeholder="Enter Address"
                onChange={(e) => handleChange("address", e)}
              />
            </FormControl>
            {mode === "create" && (
              <>
                <FormControl label="Password">
                  <Input
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) => handleChange("password", e)}
                    placeholder="Enter Password"
                  />
                </FormControl>
                <FormControl label="Confirm Password">
                  <Input
                    type="password"
                    value={formData.confirmPassword || ""}
                    onChange={(e) => handleChange("confirmPassword", e)}
                    placeholder="Confirm Password"
                  />
                </FormControl>
              </>
            )}
          </FormRow>
        </div>
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
    </>
  );
};

export default UserDrawer;

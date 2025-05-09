import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { $ajax_post } from "../Library/Library";

// ======================= Main Component =======================

const Buildings = () => {
  const [data, setData] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState("view");
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const getBuildings = async () => {
    $ajax_post("buildings", {}, (response) => {
      setData(response || []);
    });
  };

  const handleOpenDrawer = (building = null, mode = "view") => {
    setSelectedBuilding(building);
    setDrawerMode(mode);
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setSelectedBuilding(null);
  };

  useEffect(() => {
    getBuildings();
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        render: (value, row) => (
          <a
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => handleOpenDrawer(row, "view")}
          >
            {value}
          </a>
        ),
      },
      { field: "location", headerName: "Location" },
      { field: "area", headerName: "Area (sq ft)" },
      { field: "status", headerName: "Status" },
    ],
    []
  );

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Button className="ml-auto hover:bg-gray-100 border-1 border-gray-200" onClick={() => handleOpenDrawer(null, "create")}>
          Add Building
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <Table className="min-w-full divide-y divide-gray-200 bg-white">
          <TableHeader className="bg-gray-100">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.field}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {col.headerName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {data.length ? (
              data.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50 transition">
                  {columns.map(({ field, render }) => (
                    <TableCell key={field} className="px-4 py-2 text-sm">
                      {render ? render(row[field], row) : row[field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6 text-sm text-gray-500"
                >
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BuildingDrawer
        open={openDrawer}
        mode={drawerMode}
        data={selectedBuilding}
        onClose={handleCloseDrawer}
        onRefresh={getBuildings}
        setDrawerMode={setDrawerMode}
      />
    </div>
  );
};

export default Buildings;

// ======================= Drawer Component =======================

const BuildingDrawer = ({
  open,
  mode,
  onClose,
  data,
  onRefresh,
  setDrawerMode,
}) => {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    area: "",
    status: "",
  });

  const handleChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    const endpoint = isCreate ? "createBuilding" : `updateBuilding/${data?.id}`;
    const payload = isEdit ? { id: data.id, ...formData } : formData;

    $ajax_post(endpoint, payload, () => {
      onClose();
      onRefresh();
    });
  };

  const handleDelete = () => {
    $ajax_post(`deleteBuilding/${data?.id}`, {}, () => {
      onClose();
      onRefresh();
    });
  };

  useEffect(() => {
    if (data && (isEdit || isView)) {
      setFormData({
        name: data.name || "",
        location: data.location || "",
        area: data.area || "",
        status: data.status || "",
        // description: data.description || "",
      });
    } else if (isCreate) {
      setFormData({
        name: "",
        location: "",
        area: "",
        status: "",
        // description: "",
      });
    }
  }, [data, mode]);

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="w-full max-w-md ml-auto h-full flex flex-col border-l bg-white z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <DrawerTitle className="text-lg font-semibold">
            {isCreate
              ? "Create Building"
              : isEdit
              ? "Edit Building"
              : "View Building"}
          </DrawerTitle>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <FormField label="Building Name" required>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isView}
              placeholder="Enter Building Name"
            />
          </FormField>

          <FormField label="Location">
            <Input
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              disabled={isView}
              placeholder="Enter Location"
            />
          </FormField>

          <FormField label="Area (sq ft)">
            <Input
              type="number"
              value={formData.area}
              onChange={(e) => handleChange("area", e.target.value)}
              disabled={isView}
              placeholder="Enter Area"
            />
          </FormField>

          <FormField label="Status">
            <Select
              disabled={isView}
              value={formData.status}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="w-full bg-white">
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Footer */}
        <DrawerFooter className="p-4 border-t">
          {isView ? (
            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                <Button onClick={() => setDrawerMode("edit")}>Edit</Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 justify-between">
              <Button onClick={handleSubmit}>Save</Button>
              <DrawerClose>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block font-medium text-sm mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

import React, { useEffect, useMemo, useState } from "react";
import { Drawer, FormControl, Select, Input, FormRow, Button } from "unygc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { $ajax_post } from "../Library";

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
        <Button
          className="ml-auto hover:bg-gray-100 border-1 border-gray-200"
          onClick={() => handleOpenDrawer(null, "create")}
        >
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
    <>
      <Drawer
        title={
          isCreate
            ? "Create Building"
            : isEdit
            ? "Edit Building"
            : "View Building"
        }
        isOpen={open}
        onClose={onClose}
        footer={
          isView ? (
            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                <Button type="primary" onClick={() => setDrawerMode("edit")}>Edit</Button>
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
              <Button type="primary" onClick={handleSubmit}>Save</Button>

              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          )
        }
        defaultWidth="25%"
        maxWidthSize="99.99%"
        minWidthSize="30%"
        resizable={true}
        placement="right"
        closeIcon={true}
        id="2"
      >
        <div className="flex-1 overflow-y-auto p-2 space-y-5">
          <FormRow cols={1} fieldAlign={"side"}>
            <FormControl viewMode={isView} label="Building Name" required>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e)}
                placeholder="Enter Building Name"
              />
            </FormControl>
            <FormControl viewMode={isView} label="Location">
              <Input
                value={formData.location}
                onChange={(e) => handleChange("location", e)}
                placeholder="Enter Location"
              />
            </FormControl>
            <FormControl viewMode={isView} label="Area (sq ft)">
              <Input
                type="number"
                value={formData.area}
                onChange={(e) => handleChange("area", e)}
                placeholder="Enter Area"
              />
            </FormControl>
            <FormControl viewMode={isView} label="Status">
              <Select
                defaultValue={formData.status}
                name="Status"
                selectOptions={["Active", "Inactive"].map((item) => ({
                  value: item,
                  label: item,
                }))}
                onChange={(val) => handleChange("status", val)}
              />
            </FormControl>
          </FormRow>
        </div>
      </Drawer>
    </>
  );
};
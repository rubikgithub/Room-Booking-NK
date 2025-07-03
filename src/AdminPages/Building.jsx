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
import { useTheme } from "@/components/theme-provider";

// ======================= Main Component =======================

const Buildings = () => {
  const [data, setData] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState("view");
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const { theme } = useTheme();

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
        renderCell: (params) => (
          <a
            style={{
              cursor: "pointer",
              color: theme === "dark" ? "#f7b00f" : "blue",
            }}
            onClick={() => handleOpenDrawer(params?.row, "view")}
          >
            {params?.value}
          </a>
        ),
      },
      { field: "location", headerName: "Location" },
      { field: "area", headerName: "Area (sq ft)" },
      {
        field: "status",
        headerName: "Status",
        renderCell: (params) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
              params?.value?.toLowerCase() === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {params?.value?.charAt(0).toUpperCase() + params?.value?.slice(1)}
          </span>
        ),
      },
    ],
    [theme]
  );

  return (
    <div>
      <div className="flex justify-end">
        <Button
          onClick={() => handleOpenDrawer(null, "create")}
          className="mb-4 border border-border cursor-pointer hover:bg-accent hover:text-accent-foreground"
        >
          Add Building
        </Button>
      </div>

      <div className="overflow-x-auto max-h-[80vh] rounded-2xl shadow-md border border-border">
        <Table className="min-w-full divide-y divide-border bg-card text-sm">
          <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.field}
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  {col.headerName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-secondary/30 transition-colors duration-150 group"
                >
                  {columns.map((col) => {
                    const value = row[col.field];
                    const params = { value, row };
                    return (
                      <TableCell
                        key={col.field}
                        className="px-4 py-2 whitespace-nowrap text-foreground group-hover:text-primary transition-colors duration-200"
                      >
                        {col.renderCell ? col.renderCell(params) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-muted-foreground"
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
      });
    } else if (isCreate) {
      setFormData({
        name: "",
        location: "",
        area: "",
        status: "",
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
                <Button type="primary" onClick={() => setDrawerMode("edit")}>
                  Edit
                </Button>
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
              <Button type="primary" onClick={handleSubmit}>
                Save
              </Button>

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

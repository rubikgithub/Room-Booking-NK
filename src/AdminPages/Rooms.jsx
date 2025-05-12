import { useEffect, useState } from "react";
import { Drawer, FormControl, Select, Input, FormRow, Button } from "unygc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { $ajax_post } from "../Library/Library";

const Rooms = () => {
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState("view");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleOpenDrawer = (row, mode = "view") => {
    setSelectedRow(row);
    setOpenDrawer(true);
    setDrawerMode(mode);
  };

  const openModalWithImages = (images) => {
    console.log("Open modal with images:", images);
  };

  const [columns] = useState([
    {
      field: "building_name",
      headerName: "Building Name",
      type: "text",
    },
    {
      field: "name",
      headerName: "Name",
      type: "text",
      renderCell: (params) => (
        <a
          style={{ cursor: "pointer", color: "blue" }}
          onClick={() => handleOpenDrawer(params?.row, "view")}
        >
          {params?.value}
        </a>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      type: "text",
    },
    {
      field: "capacity",
      headerName: "Capacity",
      type: "number",
    },
    {
      field: "description",
      headerName: "Description",
      type: "text",
    },
    {
      field: "area",
      headerName: "Area (sq ft)",
      type: "number",
    },
    {
      field: "features",
      headerName: "Additional Features",
      type: "text",
    },
    {
      field: "status",
      headerName: "Status",
      type: "text",
    },
    {
      field: "image",
      headerName: "Image",
      type: "image",
      renderCell: (params) => {
        const images = Array.isArray(params?.value)
          ? params.value
          : JSON.parse(params?.value || "[]");

        return (
          <div style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img.path}
                alt={img.originalName || "room image"}
                style={{ width: "30px", height: "30px", borderRadius: "4px" }}
                onClick={() => {
                  setCurrentImageIndex(index);
                  openModalWithImages(images);
                }}
              />
            ))}
          </div>
        );
      },
    },
  ]);

  const getRooms = async () => {
    $ajax_post("rooms", {}, function (response) {
      setData(response || []);
    });
  };

  useEffect(() => {
    getRooms();
  }, []);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          className="ml-auto hover:bg-gray-100 border-1 border-gray-200"
          onClick={() => handleOpenDrawer(null, "create")}
        >
          Add Room
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
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((col) => {
                    const value = row[col.field];
                    const params = { value, row };
                    return (
                      <TableCell
                        key={col.field}
                        className="px-4 py-2 text-sm text-gray-800"
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
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <RoomsDrawer
          data={selectedRow}
          open={openDrawer}
          mode={drawerMode}
          onClose={() => setOpenDrawer(false)}
          onRefresh={getRooms}
          setDrawerMode={setDrawerMode}
        />
      </div>
    </div>
  );
};

export default Rooms;

const roomTypes = [
  { value: "Conference Room", label: "Conference Room" },
  { value: "Meeting Room", label: "Meeting Room" },
  { value: "Training Room", label: "Training Room" },
  { value: "Cabin", label: "Cabin" },
];

const RoomsDrawer = ({
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
    building_id: "",
    type: "",
    capacity: "",
    description: "",
    area: "",
    features: "",
  });

  const [buildings, setBuildings] = useState([]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const endpoint = isCreate ? "createRoom" : `updateRoom/${data?.id}`;
    const payload = isEdit ? { id: data.id, ...formData } : formData;

    $ajax_post(endpoint, payload, () => {
      onClose();
      onRefresh();
    });
  };

  const handleDelete = () => {
    $ajax_post(`deleteRoom/${data?.id}`, {}, () => {
      onClose();
      onRefresh();
    });
  };

  useEffect(() => {
    $ajax_post("buildings", {}, (res) => {
      if (res) {
        setBuildings(res);
      }
    });
  }, []);

  useEffect(() => {
    if (data && (isEdit || isView)) {
      setFormData({
        name: data.name || "",
        building_id: data.building_id || "",
        type: data.type || "",
        capacity: data.capacity || "",
        description: data.description || "",
        area: data.area || "",
        features: data.features || "",
      });
    } else if (isCreate) {
      setFormData({
        name: "",
        building_id: "",
        type: "",
        capacity: "",
        description: "",
        area: "",
        features: "",
      });
    }
  }, [data, mode]);

  return (
    <Drawer
      title={isCreate ? "Create Room" : isEdit ? "Edit Room" : "View Room"}
      isOpen={open}
      onClose={onClose}
      footer={
        isView ? (
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <Button
                className="hover:bg-gray-100 border-1 border-gray-200"
                onClick={() => setDrawerMode("edit")}
              >
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
            <Button
              className="hover:bg-gray-100 border-1 border-gray-200"
              onClick={handleSubmit}
            >
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
          <FormControl viewMode={isView} label="Name" required>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e)}
              placeholder="Enter Name"
            />
          </FormControl>

          <FormControl viewMode={isView} label="Building Name" required>
            {isView ? (
              <Input
                disabled
                value={
                  buildings?.find((b) => b?.id === formData?.building_id)
                    ?.name || ""
                }
              />
            ) : (
              <Select
                selectOptions={buildings?.map((b) => ({
                  label: b.name,
                  value: b.id,
                }))}
                value={formData.building_id}
                onChange={(val) => handleChange("building_id", val)}
                placeholder="Select Building"
              />
            )}
          </FormControl>

          <FormControl viewMode={isView} label="Type" required>
            {isView ? (
              <Input
                disabled
                value={
                  roomTypes.find((type) => type.value === formData.type)
                    ?.label || ""
                }
              />
            ) : (
              <Select
                selectOptions={roomTypes}
                value={formData.type}
                onChange={(val) => handleChange("type", val)}
                placeholder="Select Room Type"
              />
            )}
          </FormControl>

          <FormControl viewMode={isView} label="Capacity">
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange("capacity", e)}
              placeholder="Enter Capacity"
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

          <FormControl viewMode={isView} label="Description">
            <Input
              value={formData.description}
              onChange={(e) => handleChange("description", e)}
              placeholder="Enter Description"
            />
          </FormControl>

          <FormControl viewMode={isView} label="Additional Features">
            <Input
              value={formData.features}
              onChange={(e) => handleChange("features", e)}
              placeholder="Enter Additional Features"
            />
          </FormControl>
        </FormRow>
      </div>
    </Drawer>
  );
};
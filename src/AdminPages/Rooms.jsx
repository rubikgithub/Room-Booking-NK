import { useEffect, useState } from "react";
import axios from "axios";
import {
  Drawer,
  FormControl,
  Select,
  Input,
  FormRow,
  Button,
  ImageUploader,
  Notification,
  ModalBox,
} from "unygc";
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

function ToggleButton({
  isChecked = false,
  setIsChecked = () => {},
  onChange = () => {},
  viewMode = false,
}) {
  const handleToggle = () => {
    setIsChecked(!isChecked);
    onChange(!isChecked);
  };

  return (
    <div className="btn-status">
      <input
        type="checkbox"
        id="checkbox"
        className="hidden"
        checked={isChecked}
        onChange={handleToggle}
        disabled={viewMode}
      />
      <label
        htmlFor="checkbox"
        className={`flex items-center p-1 rounded-lg w-12 h-6 cursor-pointer transition-all duration-300 ${
          isChecked ? "bg-red-200" : "bg-green-200"
        }`}
      >
        <span
          className={`block w-[17px] h-[17px] rounded-full transition-transform duration-300 ${
            isChecked
              ? "bg-red-600 translate-x-[23px]"
              : "bg-green-600 translate-x-0"
          }`}
        ></span>
      </label>
    </div>
  );
}

const Rooms = () => {
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState("view");
  const { theme } = useTheme();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleOpenDrawer = (row, mode = "view") => {
    setSelectedRow(row);
    setOpenDrawer(true);
    setDrawerMode(mode);
  };

  const openModalWithImages = (images, index) => {
    setSelectedImages(images);
    setCurrentImageIndex(index);
    setImageModalOpen(true);
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
      field: "status",
      headerName: "Status",
      type: "text",
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
            params?.value?.toLowerCase() === "active"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : params?.value?.toLowerCase() === "inactive"
              ? "bg-red-100 text-red-800 hover:bg-red-200"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          {params?.value?.charAt(0).toUpperCase() + params?.value?.slice(1)}
        </span>
      ),
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
            {images?.map((img, index) => (
              <img
                key={index}
                src={img?.path}
                alt={img?.originalName || "room image"}
                style={{ width: "30px", height: "30px", borderRadius: "4px" }}
                onClick={() => openModalWithImages(images, index)}
              />
            ))}
          </div>
        );
      },
    },
    {
      field: "room_features",
      headerName: "Room Features",
      type: "text",
      renderCell: (params) => {
        const features = params?.value;
        if (!features || typeof features !== "object") {
          return <span>-</span>;
        }

        // Convert room_features object to a readable format
        const featureList = Object.entries(features)
          .filter(([key, value]) => value?.enabled)
          .map(([key, value]) => {
            if (key === "dusterss" && value.count) {
              return `${key} (${value.count})`;
            }
            return key;
          })
          .join(", ");

        return <span>{featureList || "None"}</span>;
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
      <div className="flex justify-end">
        <Button
          onClick={() => handleOpenDrawer(null, "create")}
          className="mb-4 border border-border cursor-pointer hover:bg-accent hover:text-accent-foreground"
        >
          Add Room
        </Button>
      </div>

      <div className="overflow-x-auto max-h-[80vh] rounded-2xl shadow-md border border-border">
        <Table className="min-w-full divide-y divide-border bg-card text-sm">
          <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.field}
                  className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase"
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
                        className="px-3 py-3 whitespace-nowrap text-foreground group-hover:text-primary transition-colors duration-200"
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
                  className="px-3 py-10 text-center text-muted-foreground"
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

        <ModalBox
          title={selectedImages[currentImageIndex]?.originalName}
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          width={800}
        >
          <div className="flex flex-col items-center">
            <img
              src={selectedImages[currentImageIndex]?.path}
              alt="Selected Room"
              className="max-w-[700px] max-h-[70vh] rounded"
            />
            <div className="mt-4 flex gap-2">
              {selectedImages?.map((img, index) => (
                <img
                  key={index}
                  src={img?.path}
                  alt="thumb"
                  className={`max-w-12 max-h-12  rounded cursor-pointer border ${
                    index === currentImageIndex
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </ModalBox>
      </div>
    </div>
  );
};

export default Rooms;

const roomTypes = [
  { value: "Conference Room", label: "Conference Room" },
  { value: "Meeting Room", label: "Meeting Room" },
  { value: "ClassRoom", label: "ClassRoom" },
  { value: "Cabinet", label: "Cabinet" },
  { value: "Multi-use", label: "Multi - use" },
];

const room_features = [
  { value: "chairs", label: "Chairs" },
  { value: "tables", label: "Tables" },
  { value: "markers", label: "Markers" },
  { value: "dusters", label: "Dusters" },
  { value: "projector", label: "Projector" },
  { value: "board", label: "Board" },
];

const chairOptions = [
  { value: "10-15", label: "10-15" },
  { value: "25-30", label: "25-30" },
  { value: "30-35", label: "30-35" },
];

const boardOptions = [
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "Large", label: "Large" },
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
    image: [],
    room_features: [],
  });

  const [buildings, setBuildings] = useState([]);
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (files) => {
    try {
      const formDataToSend = new FormData();
      files.forEach((file) => formDataToSend.append("files", file));

      const response = await axios.post(
        "/api/upload-multiple",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadedImages = response?.data?.files || [];

      const existingImages = JSON.parse(formData?.image) || [];
      const filteredNewImages = uploadedImages.filter(
        (newImage) =>
          !existingImages.some(
            (existing) => existing.fileName === newImage.fileName
          )
      );

      const combinedImages = [...existingImages, ...filteredNewImages];

      setFormData((prev) => ({
        ...prev,
        image: JSON.stringify(combinedImages),
      }));

      if (response.status === 200) {
        Notification.open(
          "success",
          "Success",
          "Images uploaded successfully",
          3000,
          "bottom-right"
        );
      } else {
        throw new Error("Upload response not OK");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      Notification.open(
        "error",
        "Upload Failed",
        "Image upload failed. Please try again.",
        3000,
        "top-right"
      );
    }
  };

  const handleImageDelete = (fileName) => {
    setFormData((prev) => ({
      ...prev,
      image: JSON.stringify(
        JSON.parse(formData?.image).filter((img) => img.fileName !== fileName)
      ),
    }));
  };

  const handleSubmit = () => {
    const endpoint = isCreate ? "createRoom" : `updateRoom/${data?.id}`;
    const payload = isEdit ? { id: data.id, ...formData } : formData;
    $ajax_post(endpoint, payload, () => {
      Notification.open(
        "success",
        "Success",
        `Room ${isCreate ? "created" : "updated"} successfully`,
        3000
      );
      onClose();
      onRefresh();
    });
  };

  const handleDelete = () => {
    $ajax_post(`deleteRoom/${data?.id}`, {}, () => {
      Notification.open(
        "success",
        "Deleted",
        "Room deleted successfully",
        3000
      );
      onClose();
      onRefresh();
    });
  };

  useEffect(() => {
    $ajax_post("buildings", {}, (res) => {
      if (res) setBuildings(res);
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
        image: data.image || [],
        room_features: data?.room_features || [],
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
        image: [],
        room_features: [],
      });
    }
  }, [data, mode]);

  const handleChanges = (field, value) => {
    setFormData((prevData) => {
      let updatedRoomFeatures = { ...prevData.room_features };

      if (field === "room_features") {
        const selectedValues = value.map((item) => item.value || item);
        const featureKeys = [
          "chairs",
          "tables",
          "markers",
          "dusters",
          "projector",
          "board",
        ];

        featureKeys.forEach((key) => {
          const isEnabled = selectedValues.includes(key);
          updatedRoomFeatures[key] = {
            ...updatedRoomFeatures[key],
            enabled: isEnabled,
          };

          if (!isEnabled) {
            if (key === "chairs") delete updatedRoomFeatures[key].quantity;
            if (key === "tables") delete updatedRoomFeatures[key].count;
            if (key === "markers") delete updatedRoomFeatures[key].count;
            if (key === "board") delete updatedRoomFeatures[key].size;
          }
        });
      } else if (field === "chairsQuantity") {
        updatedRoomFeatures.chairs = {
          ...updatedRoomFeatures.chairs,
          enabled: true,
          quantity: value.value || value,
        };
      } else if (field === "tablesCount") {
        updatedRoomFeatures.tables = {
          ...updatedRoomFeatures.tables,
          enabled: true,
          count: value.value || value,
        };
      } else if (field === "markersCount") {
        updatedRoomFeatures.markers = {
          ...updatedRoomFeatures.markers,
          enabled: true,
          count: value.value || value,
        };
      } else if (field === "dustersCount") {
        updatedRoomFeatures.dusters = {
          ...updatedRoomFeatures.dusters,
          enabled: true,
        };
      } else if (field === "boardSize") {
        updatedRoomFeatures.board = {
          ...updatedRoomFeatures.board,
          enabled: true,
          size: value.value || value,
        };
      }

      return {
        ...prevData,
        room_features: updatedRoomFeatures,
      };
    });
  };

  return (
    <Drawer
      title={isCreate ? "Create Room" : isEdit ? "Edit Room" : "View Room"}
      isOpen={open}
      onClose={onClose}
      footer={
        isView ? (
          <div className="flex justify-between gap-2">
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
          <div className="flex justify-between gap-2">
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
      resizable
      placement="right"
      closeIcon
      id="2"
    >
      <div className="p-4 space-y-4 overflow-y-auto">
        <FormRow cols={1} fieldAlign="side">
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
                  buildings.find((b) => b.id === formData.building_id)?.name ||
                  ""
                }
              />
            ) : (
              <Select
                selectOptions={buildings.map((b) => ({
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
            <Select
              disabled={isView}
              selectOptions={roomTypes}
              value={formData.type}
              onChange={(val) => handleChange("type", val)}
              placeholder="Select Room Type"
            />
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

          <FormControl viewMode={isView} label="Room Features" required>
            <Select
              disabled={isView}
              selectOptions={room_features}
              value={Object.keys(formData?.room_features || {}).filter(
                (key) => formData.room_features[key]?.enabled
              )}
              defaultValue={Object.keys(formData?.room_features || {}).filter(
                (key) => formData.room_features[key]?.enabled
              )}
              multiple={true}
              onChange={(val) => handleChanges("room_features", val)}
              customClass="custom-select"
              dataActions={true}
            />
          </FormControl>

          <FormControl viewMode={isView} label="AC" required>
            <ToggleButton
              viewMode={isView}
              isChecked={isChecked}
              setIsChecked={setIsChecked}
              onChange={(val) => handleChange("AC", val)}
            />
          </FormControl>

          {formData?.room_features?.chairs?.enabled && (
            <FormControl viewMode={isView} label="Chairs Quantity" required>
              <Select
                disabled={isView}
                selectOptions={chairOptions}
                value={formData.room_features.chairs.quantity || ""}
                defaultValue={formData.room_features.chairs.quantity || ""}
                onChange={(val) => handleChanges("chairsQuantity", val)}
                customClass="custom-select"
              />
            </FormControl>
          )}

          {formData?.room_features?.tables?.enabled && (
            <FormControl viewMode={isView} label="Tables Count" required>
              <Select
                disabled={isView}
                selectOptions={[
                  { value: "5-10", label: "5-10" },
                  { value: "10-15", label: "10-15" },
                  { value: "15-20", label: "15-20" },
                ]}
                value={formData.room_features.tables.count || ""}
                defaultValue={formData.room_features.tables.count || ""}
                onChange={(e) => handleChanges("tablesCount", e)}
                customClass="custom-select"
              />
            </FormControl>
          )}

          {formData?.room_features?.markers?.enabled && (
            <FormControl viewMode={isView} label="Markers Count" required>
              <Select
                disabled={isView}
                selectOptions={[
                  { value: "2-5", label: "2-5" },
                  { value: "5-10", label: "5-10" },
                  { value: "10-15", label: "10-15" },
                ]}
                value={formData.room_features.markers.count || ""}
                defaultValue={formData.room_features.markers.count || ""}
                onChange={(e) => handleChanges("markersCount", e)}
                customClass="custom-select"
              />
            </FormControl>
          )}

          {formData?.room_features?.board?.enabled && (
            <FormControl viewMode={isView} label="Board Size" required>
              <Select
                disabled={isView}
                selectOptions={boardOptions}
                value={formData.room_features.board.size || ""}
                defaultValue={formData.room_features.board.size || ""}
                onChange={(val) => handleChanges("boardSize", val)}
                customClass="custom-select"
              />
            </FormControl>
          )}

          <span className="text-[#2b2065] font-semibold">Images</span>
          <div className="space-y-2 mt-2">
            {formData.image.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {JSON.parse(formData?.image)?.map((img) => (
                  <div key={img.fileName} className="relative ">
                    <img
                      src={img.path}
                      alt={img.originalName}
                      className="rounded w-full h-full object-cover"
                    />
                    {!isView && (
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-b-full p-1 text-xs"
                        onClick={() => handleImageDelete(img.fileName)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No images uploaded</p>
            )}
            {!isView && (
              <ImageUploader
                multiple
                maxFileSizeMB={5}
                handleFileUpload={handleFileUpload}
                theme="theme2"
              />
            )}
          </div>
        </FormRow>
      </div>
    </Drawer>
  );
};

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 max-w-3xl w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

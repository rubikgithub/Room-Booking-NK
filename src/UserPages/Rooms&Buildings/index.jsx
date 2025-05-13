import React, { useEffect, useState } from "react";
import { Kanban, Drawer, FormControl, FormRow, Input } from "unygc";
import { $ajax_post } from "../../Library";

const RoomsAndBuildings = () => {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [selectedRoomDrawer, setSelectedRoomDrawer] = useState(false);
  const [selectedRoomData, setSelectedRoomData] = useState(null);
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getRoomList = async () => {
    try {
      $ajax_post("/rooms", {}, (response) => {
        const normalizedRooms = (response || []).map((room) => ({
          ...room,
          features: Array.isArray(room.features) ? room.features : [],
        }));
        setRooms(normalizedRooms);
        setData(normalizedRooms);
      });
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const getBuildingList = async () => {
    try {
      $ajax_post("/buildings", {}, (response) => {
        setBuildings(response || []);
        setColumns(
          (response || []).map((item) => ({
            id: item.id,
            title: item.name,
          }))
        );
      });
    } catch (error) {
      console.error("Failed to fetch buildings:", error);
    }
  };

  useEffect(() => {
    getRoomList();
    getBuildingList();
  }, []);

  const userSettings = {
    groupByKey: "building_id",
    enableFilters: true,
    enableGlobalSearch: true,
    defaultSettingOptions: {
      cardSettings: true,
      groupSettings: true,
      settings: true,
    },
    defaultGroupByKey: "building_id",
    dataFields: [
      //   { id: "id", nameText: "Room ID", type: "text" },
      { id: "name", nameText: "Room Name", type: "text" },
      {
        id: "type",
        nameText: "Room Type",
        type: "singleSelect",
        valueOptions: [
          { value: "Deluxe", label: "Deluxe" },
          { value: "Suite", label: "Suite" },
          { value: "Economy", label: "Economy" },
          { value: "Cabin", label: "Cabin" },
          { value: "Conference Room", label: "Conference Room" },
        ],
      },
      { id: "capacity", nameText: "Capacity", type: "number" },
      //   { id: "building_id", nameText: "Building ID", type: "text" },
      { id: "building_name", nameText: "Building Name", type: "text" },
      //   { id: "created_at", nameText: "Created At", type: "date" },
      { id: "description", nameText: "Description", type: "text" },
      //   { id: "area", nameText: "Area", type: "text" },
      {
        id: "status",
        nameText: "Status",
        type: "singleSelect",
        valueOptions: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
        fieldStyle: {
          Active: { background: "green", color: "#fff" },
          Inactive: { background: "red", color: "#fff" },
        },
      },
      // { id: "image", nameText: "Image", type: "text" },
      //   {
      //     id: "features",
      //     nameText: "Features",
      //     type: "multiSelect",
      //     valueOptions: [{ value: "Speaker", label: "Speaker" }],
      //   },
    ],
    groupByOptions: [
      {
        value: "building_id",
        label: "Building ID",
        key: "building_id",
      },
    ],
    allowUserSettings: true,
  };

  return (
    <div style={{ width: "1625px" }}>
      <Kanban
        columns={columns}
        data={data}
        handleDragEnd={() => {}}
        userSettings={userSettings}
        onClick={(cardData) => {
          setSelectedRoomData(cardData);
          setFormData(cardData);
          setSelectedRoomDrawer(true);
        }}
      />

      <Drawer
        title="Room Details"
        isOpen={selectedRoomDrawer}
        onClose={() => setSelectedRoomDrawer(false)}
        defaultWidth="40%"
        maxWidthSize="99.99%"
        minWidthSize="40%"
        resizable
        placement="right"
        closeIcon
        id="recordsummary"
      >
        <FormRow fieldAlign={"side"} cols={1}>
          <FormControl label="Room Name">
            <Input
              id="name"
              name="name"
              type="text"
              value={formData?.name || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl label="Room Type">
            <Input
              id="type"
              name="type"
              type="text"
              value={formData?.type || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl label="Capacity">
            <Input
              id="capacity"
              name="capacity"
              type="text"
              value={formData?.capacity || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl label="Building Name">
            <Input
              id="building_name"
              name="building_name"
              type="text"
              value={formData?.building_name || formData?.building?.name || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl label="Area">
            <Input
              id="area"
              name="area"
              type="text"
              value={formData?.area || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl label="Description">
            <Input
              id="description"
              name="description"
              type="text"
              value={formData?.description || ""}
              onChange={handleChange}
            />
          </FormControl>
        </FormRow>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
          <span className="text-lg font-semibold text-[#2b2065] min-w-[150px]">
            Images
          </span>

          <div className="flex-1">
            {JSON.parse(formData?.image || "[]")?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {JSON.parse(formData?.image)?.map((img) => (
                  <div
                    key={img.fileName}
                    className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={img.path}
                      alt={img.originalName}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mt-1">No images uploaded</p>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default RoomsAndBuildings;

import React, { useEffect, useState } from "react";
import { Kanban, Drawer } from "unygc";
import { $ajax_post } from "../../Library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"

const RoomsAndBuildings = () => {
    const [rooms, setRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [selectedRoomDrawer, setSelectedRoomDrawer] = useState(false);
    const [selectedRoomData, setSelectedRoomData] = useState({});
    const [formData, setFormData] = useState({

    });

    const handleChange = (e) => {

    };

    const filtersListArr = [
        {
            value: "customrecord_rioo_property_setup",
            label: "Property Setup",
            key: "property",
        },
        {
            value: "customrecord_rioo_amenity_booking_status",
            label: "Amenity Booking Status",
            key: "booking_status",
        },
    ];

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
            {
                id: "id",
                nameText: "Room ID",
                type: "text",
            },
            {
                id: "name",
                nameText: "Room Name",
                type: "text",
            },
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
            {
                id: "capacity",
                nameText: "Capacity",
                type: "number",
            },
            {
                id: "building_id",
                nameText: "Building ID",
                type: "text",
            },
            {
                id: "building_name",
                nameText: "Building Name",
                type: "text",
            },
            {
                id: "created_at",
                nameText: "Created At",
                type: "date",
            },
            {
                id: "description",
                nameText: "Description",
                type: "text",
            },
            {
                id: "area",
                nameText: "Area",
                type: "text",
            },
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
            {
                id: "image",
                nameText: "Image",
                type: "text", // Can be changed to "file" if used for file uploads.
            },
            {
                id: "features",
                nameText: "Features",
                type: "multiSelect",
                valueOptions: [
                    { value: "Speaker", label: "Speaker" },
                ],
            },
        ],
        defaultViewConfig: {},
        groupByOptions: [
            {
                value: "building_id",
                label: "Building ID",
                key: "building_id",
            },
        ],
        allowUserSettings: true,
        onClick: (cardData) => {
            alert(cardData)

        },
    };

    const handleDragEnd = () => { };
    const getRoomList = async () => {
        try {
            $ajax_post("/rooms", {}, function (response) {
                console.log(response, 'rooms');
                setRooms(response || []);
                setRooms(response);
                console.log(response?.map((item) => ({ ...item, features: item.features && Array.isArray(item.features) ? item.features : [] })), 'datassssss');
                setData(response?.map((item) => ({ ...item, features: item.features && Array.isArray(item.features) ? item.features : [] })));
            })
        } catch (error) {
            console.log(error)
        }
    };

    const getBuildingList = async () => {
        try {
            $ajax_post("/buildings", {}, function (response) {
                console.log(response, 'buildings');
                setBuildings(response || []);
                setColumns(response?.map((item) => ({ id: item.id, title: item.name })));

            })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getRoomList();
        getBuildingList()
    }, []);

    return (
        <div style={{ width: "1625px" }}>
            <Kanban
                columns={columns}
                data={data}
                handleDragEnd={handleDragEnd}
                userSettings={userSettings}
                onClick={(cardData) => {
                    setSelectedRoomData(cardData);
                    setFormData(cardData);
                    setSelectedRoomDrawer(true);
                    console.log(cardData, 'ssssssss');
                }}
            />
            <Drawer
                title="Room Details"
                isOpen={selectedRoomDrawer}
                onClose={() => setSelectedRoomDrawer(false)}
                defaultWidth="50%"
                maxWidthSize="99.99%"
                minWidthSize="30%"
                resizable={true}
                placement="right"
                closeIcon={true}
                id="recordsummary"
            >
                <form className="">
                    <div className="mb-4">
                        <Label className="mb-2" htmlFor="email">
                            Room Name
                        </Label>
                        <Input
                            className="h-[40px]"
                            id="firstName"
                            name="name"
                            type="text"
                            value={formData?.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <Label className="mb-2" htmlFor="email">
                            Room Type
                        </Label>
                        <Input
                            className="h-[40px]"
                            id="type"
                            name="type"
                            type="text"

                            value={formData?.type}
                            onChange={handleChange}
                        />

                    </div>
                    <div className="mb-4">
                        <Label className="mb-2" htmlFor="email">
                            Capacity
                        </Label>
                        <Input
                            className="h-[40px]"
                            id="capacity"
                            name="capacity"
                            type="text"

                            value={formData?.capacity}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="mb-4">
                        <Label className="mb-2" htmlFor="password">
                            Building Name
                        </Label>
                        <Input
                            className="h-[40px]"
                            id="building"
                            name="building"
                            type="text"
                            value={formData?.building?.name}
                            onChange={handleChange}
                        />

                    </div>
                    <div className="mb-4">
                        <Label className="mb-2" htmlFor="password">
                            Area
                        </Label>
                        <Input
                            className="h-[40px]"
                            id="area"
                            name="area"
                            type="text"
                            value={formData?.area}
                            onChange={handleChange}
                        />

                    </div>
                    <div className="mb-4">
                        <Label className="mb-2" htmlFor="password">
                            Discription
                        </Label>
                        <Input
                            className="h-[40px]"
                            id="description"
                            name="description"
                            type="text"
                            value={formData?.description}
                            onChange={handleChange}
                        />

                    </div>
                </form>
            </Drawer >
        </div>
    );
};
export default RoomsAndBuildings;


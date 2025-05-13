import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Button,
  Col,
  DatePicker,
  EventCalendar,
  Input,
  ModalBox,
  Notification,
  Row,
  Select,
  Spin,
} from "unygc";
import { $ajax_post } from "../../Library";
import { clerk } from "../../LoginRegister/clerk";

dayjs.extend(utc);
dayjs.extend(timezone);

const timeOptions = [
  "1:00 am",
  "1:30 am",
  "2:00 am",
  "2:30 am",
  "3:00 am",
  "3:30 am",
  "4:00 am",
  "4:30 am",
  "5:00 am",
  "5:30 am",
  "6:00 am",
  "6:30 am",
  "7:00 am",
  "7:30 am",
  "8:00 am",
  "8:30 am",
  "9:00 am",
  "9:30 am",
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "11:30 am",
  "12:00 pm",
  "12:30 pm",
  "1:00 pm",
  "1:30 pm",
  "2:00 pm",
  "2:30 pm",
  "3:00 pm",
  "3:30 pm",
  "4:00 pm",
  "4:30 pm",
  "5:00 pm",
  "5:30 pm",
  "6:00 pm",
  "6:30 pm",
  "7:00 pm",
  "7:30 pm",
  "8:00 pm",
  "8:30 pm",
  "9:00 pm",
  "9:30 pm",
  "10:00 pm",
  "10:30 pm",
  "11:00 pm",
  "11:30 pm",
  "12:00 am",
  "12:30 am",
];
const statusOptions = [
  { value: "Pending", label: "Pending Confirmation" },
  { value: "Booked", label: "Booking Confirmed" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];
const xAxisHeaderLabelStyle = {
  color: "#000000",
  fontSize: "14px",
  fontWeight: "bold",
  backgroundColor: "#FF851B",
};
const xAxisTitleStyle = {
  color: "white",
  fontSize: "16px",
  fontWeight: "bold",
  backgroundColor: "crimson",
};
const xAxisTimelineStyle = {
  color: "white",
  fontSize: "15px",
  fontWeight: "bold",
  backgroundColor: "teal",
};
const yAxisValueStyle = {
  backgroundColor: "#990011",
  fontSize: "13px",
  fontWeight: "bold",
  color: "#FCF6F5",
};

function BookingCalender() {
  const user = clerk?.user;

  // Constants
  const initialFormValue = {
    id: null,
    eventTitle: "",
    roomId: null,
    description: "",
    bookingDate: "",
    bookingDateText: "",
    startTime: "",
    endTime: "",
    status: "Pending",
    createdBy: "",
    updatedBy: "",
    updatedDate: "",
    updatedDateText: "",
  };

  // State hooks - grouped by related functionality
  // Room and building data
  const [roomData, setRoomData] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [ownerData, setOwnerData] = useState([]);

  // Booking and event data
  const [bookingList, setBookingList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [eventFormValues, setEventFormValues] = useState(initialFormValue);

  // Time tracking
  const [originalStartTime, setOriginalStartTime] = useState("");
  const [originalEndTime, setOriginalEndTime] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [breakTimeData, setBreakTimeData] = useState({});
  // const [lunchStartTime, setLunchStartTime] = useState("");
  // const [lunchEndTime, setLunchEndTime] = useState("");

  // UI state
  const [statusColors, setStatusColors] = useState({});
  const [addEditEventDrawerVisible, setAddEditEventDrawerVisible] =
    useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Utility functions
  const handleTimeFormat = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const combineDateAndTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const timeParts = timeString.split(":");
    if (timeParts.length < 2) {
      throw new Error("Invalid time format");
    }
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  const convertTimeToMinutes = (timeString) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "pm" && hours !== "12") {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === "am" && hours === "12") {
      hours = 0;
    }
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  };

  const subtractOneMinute = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") {
      console.error("Invalid time string in subtractOneMinute:", timeStr);
      return timeStr; // Return original to prevent further issues
    }

    const parts = timeStr.split(" ");
    if (parts.length !== 2) {
      console.error("Invalid time format in subtractOneMinute:", timeStr);
      return timeStr;
    }

    const [time, meridian] = parts;
    const timeParts = time.split(":");
    if (timeParts.length !== 2) {
      console.error("Invalid time parts in subtractOneMinute:", time);
      return timeStr;
    }

    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error(
        "Invalid time numbers in subtractOneMinute:",
        hours,
        minutes
      );
      return timeStr;
    }

    minutes -= 1;

    if (minutes < 0) {
      minutes = 59;
      hours -= 1;
      if (hours < 1) {
        hours = 12;
        return `${hours}:${minutes.toString().padStart(2, "0")} ${
          meridian === "am" ? "pm" : "am"
        }`;
      }
    }

    return `${hours}:${minutes.toString().padStart(2, "0")} ${meridian}`;
  };

  const addOneMinute = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") {
      console.error("Invalid time string in addOneMinute:", timeStr);
      return timeStr; // Return original to prevent further issues
    }

    const parts = timeStr.split(" ");
    if (parts.length !== 2) {
      console.error("Invalid time format in addOneMinute:", timeStr);
      return timeStr;
    }

    const [time, meridian] = parts;
    const timeParts = time.split(":");
    if (timeParts.length !== 2) {
      console.error("Invalid time parts in addOneMinute:", time);
      return timeStr;
    }

    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid time numbers in addOneMinute:", hours, minutes);
      return timeStr;
    }

    minutes += 1;

    if (minutes === 60) {
      minutes = 0;
      hours += 1;
      if (hours === 12) {
        return `${hours}:${minutes.toString().padStart(2, "0")} ${
          meridian === "am" ? "pm" : "am"
        }`;
      } else if (hours > 12) {
        hours = 1;
      }
    }

    return `${hours}:${minutes.toString().padStart(2, "0")} ${meridian}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const meridian = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12; // If 0, set it to 12 (12-hour clock)
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${formattedMinutes} ${meridian}`;
  };

  // API functions - consolidated with error handling
  const fetchData = async (endpoint, payload = {}, callback) => {
    try {
      $ajax_post(endpoint, payload, callback);
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      // Could add proper error handling/notification here
    }
  };

  // API fetching functions
  const getRoomList = () => {
    fetchData("rooms", {}, (response) => {
      setRoomData(response);
    });
  };

  const getBuildingList = () => {
    fetchData("buildings", {}, (response) => {
      setBuildingData(response);
      const transformedData = response.map((building) => ({
        label: building.name,
        value: building.id,
      }));
      setBuildingOptions(transformedData);
    });
  };

  const getRoomsByBuildingIds = (buildingIds) => {
    fetchData("rooms-by-building", { buildingIds }, (response) => {
      setRoomData(response);
    });
  };

  const getBuildingsByIds = (buildingIds) => {
    fetchData("buildings-by-id", { buildingIds }, (response) => {
      setBuildingData(response);
    });
  };

  const getAllBookings = () => {
    fetchData("allBookings", {}, (response) => {
      setBookingList(response);

      // Generate events list from bookings
      const uniqueRooms = ownerData?.map((room) => ({
        roomId: room?.id,
      }));

      const transformedData = response.map((booking) => ({
        Id: booking?.id || null,
        Subject: booking?.title || "No Subject",
        Description: booking?.description || "No Description",
        StartTime: combineDateAndTime(
          booking?.date,
          booking?.start_time
        ).toISOString(),
        EndTime: combineDateAndTime(
          booking?.date,
          booking?.end_time
        ).toISOString(),
        RoomId: booking?.room_id || null,
        BackgroundColor: statusColors[booking?.status] || "#5F9EA0",
        rawData: booking,
      }));

      // Add break times if available
      const breakDataList = breakTimeData?.title
        ? uniqueRooms
            ?.map(({ roomId }) => {
              const bookingForRoom = response?.find(
                (booking) => booking?.room_id === roomId
              );

              if (!bookingForRoom?.date) return null;

              return {
                Id: bookingForRoom?.id,
                Subject: breakTimeData?.title || "No Subject",
                StartTime: combineDateAndTime(
                  bookingForRoom?.date,
                  breakTimeData?.start_time
                ).toISOString(),
                EndTime: combineDateAndTime(
                  bookingForRoom?.date,
                  breakTimeData?.end_time
                ).toISOString(),
                RecurrenceRule: "FREQ=DAILY;INTERVAL=1;",
                IsBlock: true,
                RoomId: roomId,
              };
            })
            .filter(Boolean)
        : [];

      const finalData = [...transformedData, ...breakDataList];
      setEventList(finalData);
    });
  };

  const getStatusList = () => {
    fetchData("statusColors", {}, (response) => {
      const colorsMap = response?.reduce((acc, item) => {
        acc[item.status] = item.color;
        return acc;
      }, {});
      setStatusColors(colorsMap);
    });
  };

  const getTimeList = () => {
    fetchData("timeConfig", {}, (response) => {
      // Handle operational time
      const operationalTime = response?.find(
        (event) => event.title === "Operational Time"
      );

      if (operationalTime) {
        const formattedStartTime = handleTimeFormat(
          operationalTime?.start_time
        );
        const formattedEndTime = handleTimeFormat(operationalTime?.end_time);
        setStartTime(formattedStartTime);
        setEndTime(formattedEndTime);
      }

      // Handle lunch break
      const lunchBreak = response?.find(
        (event) => event.title === "Lunch Break"
      );

      if (lunchBreak) {
        setBreakTimeData(lunchBreak);
        // setLunchStartTime(lunchBreak?.start_time);
        // setLunchEndTime(lunchBreak?.end_time);
      }
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!eventFormValues?.eventTitle?.trim()) {
      newErrors.eventTitle = "Event Title is required";
    }

    if (!eventFormValues?.endTime?.trim()) {
      newErrors.endTime = "End Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Event CRUD operations
  const createEvent = async () => {
    const formattedDate = new Date(eventFormValues.bookingDate)
      .toISOString()
      .split("T")[0];

    const adjustedEndTime = subtractOneMinute(eventFormValues.endTime);

    const data = {
      user_id: user.externalId,
      title: eventFormValues.eventTitle,
      room_id: eventFormValues.roomId,
      description: eventFormValues.description,
      date: formattedDate,
      start_time: eventFormValues.startTime,
      end_time: eventFormValues.endTime,
      status: eventFormValues.status,
    };

    const availabilityData = {
      roomId: eventFormValues.roomId,
      date: formattedDate,
      startTime: data.start_time,
      endTime: adjustedEndTime,
    };

    fetchData("check-room-availability", availabilityData, (response) => {
      const { isAvailable } = response;

      if (isAvailable) {
        fetchData("createBooking", data, () => {
          Notification.open(
            "success",
            "Booking Successful",
            "Event created successfully",
            3000,
            "bottom-right"
          );
          getAllBookings();
        });
      } else {
        Notification.open(
          "warning",
          "Room Unavailable",
          "The selected room is unavailable for the specified time.",
          3000,
          "top-left"
        );
      }
    });

    // Optimistic update
    setEventList((prevEventList) => [...prevEventList, { ...data }]);
  };

  const updateEvent = async () => {
    const formattedDate = new Date(eventFormValues.bookingDate)
      .toISOString()
      .split("T")[0];

    // Ensure we have valid time strings before comparing
    const validOriginalStart =
      originalStartTime && typeof originalStartTime === "string";
    const validOriginalEnd =
      originalEndTime && typeof originalEndTime === "string";

    // Only detect changes if we have valid original values
    const isStartTimeChanged =
      validOriginalStart && eventFormValues.startTime !== originalStartTime;
    const isEndTimeChanged =
      validOriginalEnd && eventFormValues.endTime !== originalEndTime;

    console.log("Time comparison:", {
      isStartTimeChanged,
      isEndTimeChanged,
      originalStart: originalStartTime,
      currentStart: eventFormValues.startTime,
      originalEnd: originalEndTime,
      currentEnd: eventFormValues.endTime,
    });

    const updates = {
      title: eventFormValues.eventTitle,
      room_id: eventFormValues.roomId,
      description: eventFormValues.description,
      date: formattedDate,
      start_time: eventFormValues.startTime,
      end_time: eventFormValues.endTime,
      status: eventFormValues.status,
    };

    const userId = user.externalId;
    const bookingId = eventFormValues.id;

    const requestData = {
      bookingId,
      updates,
      userId,
    };

    // Check if we need to verify room availability
    if (isStartTimeChanged || isEndTimeChanged) {
      // Only proceed if we have valid original times
      if (!validOriginalStart || !validOriginalEnd) {
        console.error(
          "Missing original time values. Proceeding with update without availability check."
        );
        performUpdate();
        return;
      }

      let newStartTime;
      let newEndTime;

      try {
        newStartTime = addOneMinute(originalEndTime);
        newEndTime = subtractOneMinute(eventFormValues.endTime);

        // Validate that we have proper time strings
        if (!newStartTime.includes(":") || !newEndTime.includes(":")) {
          throw new Error("Invalid time format generated");
        }
      } catch (error) {
        console.error("Error processing times:", error);
        console.log(
          "Proceeding with update without availability check due to time processing error"
        );
        performUpdate();
        return;
      }

      const availabilityData = {
        roomId: eventFormValues.roomId,
        date: formattedDate,
        startTime: newStartTime,
        endTime: newEndTime,
      };

      console.log("Checking availability with:", availabilityData);

      fetchData("check-room-availability", availabilityData, (response) => {
        const { isAvailable } = response;

        if (!isAvailable) {
          Notification.open(
            "warning",
            "Room Unavailable",
            "The selected room is unavailable for the specified time.",
            3000,
            "top-left"
          );
          return;
        }

        // If available, proceed with update
        performUpdate();
      });
    } else {
      // No time change, proceed with update
      performUpdate();
    }

    function performUpdate() {
      fetchData("update-booking", requestData, () => {
        Notification.open(
          "success",
          "Update Successful",
          "Event updated successfully",
          3000,
          "bottom-right"
        );
        getAllBookings();
      });
    }
  };

  const deleteBooking = async () => {
    setDeleteLoading(true);

    const requestData = {
      bookingId: currentEvent?.Id,
      userId: user?.externalId,
    };

    fetchData("deleteBooking", requestData, () => {
      Notification.open(
        "success",
        "Deletion Successful",
        "Event deleted successfully",
        3000,
        "bottom-right"
      );
      getAllBookings();
      setDeleteModalOpen(false);
      setAddEditEventDrawerVisible(false);
      setDeleteLoading(false);
    });
  };

  // Event handlers
  const handleSubmit = async () => {
    if (!validateForm()) {
      Notification.open(
        "error",
        "Validation Error",
        "Please fill in all required fields",
        3000,
        "top-right"
      );
      return;
    }

    if (eventFormValues.id) {
      await updateEvent();
    } else {
      await createEvent();
    }

    setAddEditEventDrawerVisible(false);
    setCurrentEvent(null);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  // Filter end time options based on start time selection
  const filteredEndTimeOptions = useMemo(() => {
    return timeOptions.filter((time) => {
      const startTime = eventFormValues.startTime;
      if (!startTime) {
        return true; // If no start time selected, show all options
      }
      const startTimeInMinutes = convertTimeToMinutes(startTime);
      const timeInMinutes = convertTimeToMinutes(time);
      return timeInMinutes > startTimeInMinutes; // Show only times after start time
    });
  }, [eventFormValues.startTime]);

  // Memoized dropdown template to prevent unnecessary re-renders
  const headerDropdownTemplate = useMemo(() => {
    return (
      <Select
        name="buildingOption"
        defaultValue={buildingOptions?.map((option) => option?.value)}
        multiple={true}
        selectOptions={buildingOptions}
        onChange={(value) => {
          getRoomsByBuildingIds(value);
          getBuildingsByIds(value);
        }}
      />
    );
  }, [buildingOptions]);

  useEffect(() => {
    getRoomList();
    getBuildingList();
    getStatusList();
    getTimeList();
  }, []);

  // Refresh bookings when status colors change
  useEffect(() => {
    if (Object.keys(statusColors).length > 0) {
      getAllBookings();
    }
  }, [statusColors]);

  // Store original time values for comparison
  // Track original time values for comparison during updates
  useEffect(() => {
    if (
      currentEvent?.Id &&
      eventFormValues.startTime &&
      eventFormValues.endTime
    ) {
      // Only when editing an existing event and times are available
      setOriginalStartTime(eventFormValues.startTime);
      setOriginalEndTime(eventFormValues.endTime);
    }
  }, [currentEvent?.Id, eventFormValues.id]);

  // Log for debugging time issues
  useEffect(() => {
    if (eventFormValues.id) {
      console.log("Time tracking values:", {
        originalStart: originalStartTime,
        originalEnd: originalEndTime,
        currentStart: eventFormValues.startTime,
        currentEnd: eventFormValues.endTime,
      });
    }
  }, [
    eventFormValues.startTime,
    eventFormValues.endTime,
    originalStartTime,
    originalEndTime,
    eventFormValues.id,
  ]);

  // Generate owner data when room or building data changes
  useEffect(() => {
    if (roomData?.length > 0 && buildingData?.length > 0) {
      const dynamicOwnerData = roomData.map((room) => {
        const building = buildingData.find(
          (building) => building?.id === room?.building_id
        );

        return {
          text: room?.name,
          id: room?.id,
          color: statusColors[eventFormValues.status],
          capacity: room?.capacity,
          type: room?.type,
          building: building?.name,
        };
      });

      setOwnerData(dynamicOwnerData);
    }
  }, [roomData, buildingData, eventFormValues.status, statusColors]);

  // Handle current event changes and update form
  useEffect(() => {
    if (currentEvent) {
      const inputDate = new Date(currentEvent.StartTime);
      const formattedDate = inputDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const localDate = dayjs(currentEvent.StartTime)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DDTHH:mm:ss");

      const isoDate = dayjs.utc(localDate).toISOString();
      const startTime = formatTime(currentEvent.StartTime);

      if (currentEvent.Id) {
        // Editing existing event
        const endTime = formatTime(currentEvent.EndTime);
        const data = bookingList?.find((data) => data.id === currentEvent.Id);

        const userData = data?.user;
        const updatedUserData = data?.updatedBy;

        const createdBy = [
          userData?.first_name || "",
          userData?.last_name || "",
        ]
          .filter(Boolean)
          .join(" ");

        const updatedBy = [
          updatedUserData?.first_name || "",
          updatedUserData?.last_name || "",
        ]
          .filter(Boolean)
          .join(" ");

        const updatedDate = new Date(data?.updated_at);
        const updatedDateText = updatedDate.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });

        const localUpdateDate = dayjs(data?.updated_at)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DDTHH:mm:ss");

        const isoUpdateDate = dayjs.utc(localUpdateDate).toISOString();

        setCurrentBooking(data);
        setEventFormValues({
          id: currentEvent.Id,
          eventTitle: currentEvent.Subject,
          description: currentEvent.Description,
          roomId: currentEvent.RoomId,
          bookingDate: isoDate,
          bookingDateText: formattedDate,
          startTime: startTime,
          endTime: endTime,
          status: currentEvent.rawData.status,
          createdBy: createdBy,
          updatedBy: updatedBy,
          updatedDate: isoUpdateDate,
          updatedDateText: updatedDateText,
        });
      } else {
        // Creating new event
        setEventFormValues(() => ({
          ...initialFormValue,
          bookingDate: isoDate,
          bookingDateText: formattedDate,
          startTime: startTime,
          status: "Pending",
          roomId: currentEvent.RoomId,
        }));
      }
    } else {
      setEventFormValues(initialFormValue);
    }
  }, [currentEvent, bookingList]);

  // Templates
  const resourceHeaderTemplate = (props) => (
    <div className="template-wrap">
      <div className="room-building">{props?.resourceData.building}</div>
      <div className="room-name">
        {props?.resourceData?.[props?.resource.textField]}
      </div>
      <div className="room-type">{props?.resourceData.type}</div>
      <div className="room-capacity">{props?.resourceData.capacity}</div>
    </div>
  );

  // Form template components
  const addEditEventTemplate = (
    <>
      <Row style={{ marginBottom: "10px" }}>
        <Col sm={4}>
          <label className="control-label">
            Event Title <span style={{ color: "red" }}>*</span>
          </label>
        </Col>
        <Col sm={8}>
          <Input
            name="eventTitle"
            className="form-control"
            placeholder="Enter event title"
            onChange={(value) => {
              setEventFormValues((prevValue) => ({
                ...prevValue,
                eventTitle: value,
              }));
              setErrors((prev) => ({ ...prev, eventTitle: "" }));
            }}
            value={eventFormValues.eventTitle || ""}
          />
          {errors?.eventTitle && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors?.eventTitle}
            </span>
          )}
        </Col>
      </Row>

      <Row style={{ marginBottom: "10px" }}>
        <Col sm={4}>
          <label className="control-label">Room</label>
        </Col>
        <Col sm={8}>
          <Select
            defaultValue={eventFormValues.roomId || null}
            name="room"
            selectOptions={ownerData.map((item) => ({
              value: item.id,
              label: item.text,
            }))}
            onChange={(_, obj) => {
              setEventFormValues((prevForm) => ({
                ...prevForm,
                roomId: obj.value,
              }));
            }}
          />
        </Col>
      </Row>

      <Row style={{ marginBottom: "10px" }}>
        <Col sm={4}>
          <label className="control-label">Description</label>
        </Col>
        <Col sm={8}>
          <Input
            name="description"
            className="form-control"
            placeholder="Enter event description"
            onChange={(value) => {
              setEventFormValues((prevValue) => ({
                ...prevValue,
                description: value,
              }));
            }}
            value={eventFormValues.description || ""}
          />
        </Col>
      </Row>

      <Row style={{ marginBottom: "10px" }}>
        <Col sm={4}>
          <label className="control-label">Booking Date</label>
        </Col>
        <Col sm={8}>
          <DatePicker
            open
            style={{ width: 100 }}
            dropdownClassName="calendar-only"
            suffixIcon=""
            defaultValue={
              currentEvent?.StartTime
                ? new Date(currentEvent.StartTime).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : ""
            }
            allowClear={false}
            onChange={(value) => {
              const inputDate = new Date(value);
              const formattedDate = inputDate.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              const localDate = dayjs(value)
                .tz("Asia/Kolkata")
                .format("YYYY-MM-DDTHH:mm:ss");
              const isoDate = dayjs.utc(localDate).toISOString();

              setEventFormValues((prevForm) => ({
                ...prevForm,
                bookingDateText: formattedDate,
                bookingDate: isoDate,
              }));
            }}
          />
        </Col>
      </Row>

      <Row style={{ marginBottom: "10px" }}>
        <Col sm={4}>
          <label className="control-label">Start Time</label>
        </Col>
        <Col sm={8}>
          <Select
            defaultValue={eventFormValues.startTime || null}
            name="startTime"
            selectOptions={timeOptions.map((item) => ({
              value: item,
              label: item,
            }))}
            onChange={(_, obj) => {
              setEventFormValues((prevForm) => ({
                ...prevForm,
                startTime: obj?.value,
              }));
            }}
          />
        </Col>
      </Row>

      <Row style={{ marginBottom: "10px" }}>
        <Col sm={4}>
          <label className="control-label">
            End Time <span style={{ color: "red" }}>*</span>
          </label>
        </Col>
        <Col sm={8}>
          <Select
            defaultValue={eventFormValues.endTime || null}
            name="endTime"
            selectOptions={filteredEndTimeOptions.map((item) => ({
              value: item,
              label: item,
            }))}
            onChange={(_, obj) => {
              setEventFormValues((prevForm) => ({
                ...prevForm,
                endTime: obj?.value,
              }));
              setErrors((prev) => ({ ...prev, endTime: "" }));
            }}
          />
          {errors?.endTime && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors?.endTime}
            </span>
          )}
        </Col>
      </Row>

      <Row style={{ marginBottom: "10px" }}>
        <Col sm={4}>
          <label className="control-label">Status</label>
        </Col>
        <Col sm={8}>
          <Select
            defaultValue={eventFormValues.status || null}
            name="status"
            selectOptions={statusOptions}
            onChange={(_, obj) => {
              setEventFormValues((prevForm) => ({
                ...prevForm,
                status: obj?.value,
              }));
            }}
          />
        </Col>
      </Row>

      {currentEvent?.Id && (
        <>
          <Row style={{ marginBottom: "10px" }}>
            <Col sm={4}>
              <label className="control-label">Booking By</label>
            </Col>
            <Col sm={8}>
              <Input
                disabled
                name="bookedBy"
                className="form-control"
                placeholder="Enter Booking By"
                value={eventFormValues.createdBy || ""}
              />
            </Col>
          </Row>

          <Row style={{ marginBottom: "10px" }}>
            <Col sm={4}>
              <label className="control-label">Booking On</label>
            </Col>
            <Col sm={8}>
              <Input
                disabled
                name="bookedOn"
                className="form-control"
                placeholder="Enter Booking On"
                value={eventFormValues.bookingDateText || ""}
              />
            </Col>
          </Row>

          <Row style={{ marginBottom: "10px" }}>
            <Col sm={4}>
              <label className="control-label">Updated By</label>
            </Col>
            <Col sm={8}>
              <Input
                disabled
                name="updatedBy"
                className="form-control"
                placeholder="Enter Updated By"
                value={eventFormValues.updatedBy || ""}
              />
            </Col>
          </Row>

          <Row style={{ marginBottom: "10px" }}>
            <Col sm={4}>
              <label className="control-label">Updated On</label>
            </Col>
            <Col sm={8}>
              <Input
                disabled
                name="updatedOn"
                className="form-control"
                placeholder="Enter Updated On"
                value={eventFormValues.updatedDateText || ""}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );

  const addEditEventDrawerFooterTemplate = (
    <div className="ec_add_edit_event_footer">
      <div>
        {currentEvent?.Id && (
          <Button
            type="danger"
            htmlType="submit"
            form="createScreenForm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          form="createScreenForm"
          onClick={handleSubmit}
        >
          Save
        </Button>
        <Button
          onClick={() => {
            setAddEditEventDrawerVisible(false);
            setCurrentEvent(null);
          }}
          style={{ marginRight: 8 }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="event_calendar_container">
        {startTime && endTime && (
          <EventCalendar
            width="100%"
            height="calc(100vh - 100px)"
            eventList={eventList}
            ownerData={ownerData}
            resourceHeaderTemplate={resourceHeaderTemplate}
            headerTitle={["Building", "Room", "Type", "Capacity"]}
            currentEvent={currentEvent}
            setCurrentEvent={setCurrentEvent}
            addEditEventTemplate={addEditEventTemplate}
            headerDropdownTemplate={headerDropdownTemplate}
            ownerColumnWidth={400}
            addEditEventDrawerVisible={addEditEventDrawerVisible}
            setAddEditEventDrawerVisible={setAddEditEventDrawerVisible}
            addEditEventDrawerFooterTemplate={addEditEventDrawerFooterTemplate}
            startHour={startTime}
            endHour={endTime}
            xAxisHeaderLabelStyle={xAxisHeaderLabelStyle}
            xAxisTitleStyle={xAxisTitleStyle}
            xAxisTimelineStyle={xAxisTimelineStyle}
            yAxisValueStyle={yAxisValueStyle}
            xAxisTitleHeight={75}
            xAxisTimelineHeight={75}
            yAxisValueHeight={96}
            allowDragDrop={false}
          />
        )}
      </div>
      <ModalBox
        title="Delete Booking"
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        width={500}
        footer={
          <>
            <Button type="primary" onClick={deleteBooking}>
              Ok {deleteLoading && <Spin size="small" />}
            </Button>
          </>
        }
      >
        <div>
          {`Are you sure you want to delete`}{" "}
          <strong>{currentBooking?.title}</strong>
        </div>
      </ModalBox>
    </>
  );
}

export default BookingCalender;

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
  UnyProtect,
} from "unygc";
import { $ajax_post } from "../../Library";
import { clerk } from "../../LoginRegister/clerk";
// import {
//   BookingServices,
//   BuildingServices,
//   RoomServices,
//   StatusServices,
//   TimeServices,
// } from "../../services";

dayjs.extend(utc);
dayjs.extend(timezone);

function BookingCalender() {
  const user = clerk.user;
  console.log({ user });
  const initialFormValue = {
    id: null,
    eventTitle: "",
    roomId: null,
    description: "",
    bookingDate: "",
    bookingDateText: "",
    startTime: "",
    endTime: "",
    status: "",
    createdBy: "",
    updatedBy: "",
    updatedDate: "",
    updatedDateText: "",
  };
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
  const [roomData, setRoomData] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventFormValues, setEventFormValues] = useState(initialFormValue);
  const [ownerData, setOwnerData] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [originalStartTime, setOriginalStartTime] = useState("");
  const [originalEndTime, setOriginalEndTime] = useState("");
  const [statusColors, setStatusColors] = useState({});
  const [addEditEventDrawerVisible, setAddEditEventDrawerVisible] =
    useState(false);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [breakTimeData, setBreakTimeData] = useState({});
  const [lunchStartTime, setLunchStartTime] = useState("");
  const [lunchEndTime, setLunchEndTime] = useState("");
  const handleTimeFormat = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const getRoomList = async () => {
    try {
      $ajax_post("rooms", {}, function (response) {
        setRoomData(response);
      });
    } catch (error) {
      console.error("Error fetching rooms", error);
    }
  };
  const getBuildingList = async () => {
    try {
      $ajax_post("buildings", {}, (response) => {
        setBuildingData(response);
        const transformedData = response.map((building) => ({
          label: building.name,
          value: building.id,
        }));
        setBuildingOptions(transformedData);
      });
    } catch (error) {
      console.error("Error fetching buildings", error);
    }
  };
  const getRoomsByBuildingIds = async (values) => {
    try {
      //   const bodyData = { buildingIds: values };
      //   const result = await RoomServices.fetchRoomsByBuildingId(bodyData);
      //   const { success, data } = result;
      //   if (!success) {
      //     console.error("Failed to fetch rooms by building ids");
      //     return;
      //   }
      setRoomData([]);
    } catch (error) {
      console.error("Error fetching rooms by building ids", error);
    }
  };
  const getBuildingsByIds = async (values) => {
    try {
      //   const bodyData = { buildingIds: values };
      //   const result = await BuildingServices.fetchBuildingById(bodyData);
      //   const { success, data } = result;
      //   if (!success) {
      //     console.error("Failed to fetch buildings by ids");
      //     return;
      //   }
      setBuildingData([]);
    } catch (error) {
      console.error("Error fetching buildings by ids", error);
    }
  };
  function combineDateAndTime(dateString, timeString) {
    const date = new Date(dateString);
    const timeParts = timeString.split(":");
    if (timeParts.length < 2) {
      throw new Error("Invalid time format");
    }
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
  const getAllBookings = async () => {
    try {
      $ajax_post(`allBookings`, {}, function (response) {
        setBookingList(response);
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
        const breakDataList = uniqueRooms?.map(({ roomId }) => {
          const bookingForRoom = response?.find(
            (booking) => booking?.room_id === roomId
          );
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
        });
        const finalData = [...transformedData, ...breakDataList];
        setEventList(finalData);
      });
      //   const result = await BookingServices.fetchAllBookings();
      //   const { success, data } = result;
      //   if (!success) {
      //     console.error("Failed to fetch all bookings");
      //     return;
      //   }
    } catch (error) {
      console.error("Error fetching all bookings", error);
    }
  };
  const getStatusList = async () => {
    try {
      $ajax_post(`statusColors`, {}, function (response) {
        const colorsMap = response?.reduce((acc, item) => {
          acc[item.status] = item.color;
          return acc;
        }, {});
        setStatusColors(colorsMap);
      });
    } catch (error) {
      console.error("Error fetching status", error);
    }
  };

  const getTimeList = async () => {
    try {
      $ajax_post(`timeConfig`, {}, function (response) {
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
        const lunchBreak = response?.find(
          (event) => event.title === "Lunch Break"
        );
        setBreakTimeData(lunchBreak);
        if (lunchBreak) {
          setLunchStartTime(lunchBreak?.start_time);
          setLunchEndTime(lunchBreak?.end_time);
        }
      });
    } catch (error) {
      console.error("Error fetching time configs", error);
    }
  };
  useEffect(() => {
    getRoomList();
    getBuildingList();
    getStatusList();
    getAllBookings();
    getTimeList();
  }, []);
  useEffect(() => {
    if (Object.keys(statusColors).length > 0) {
      getAllBookings();
    }
  }, [statusColors]);
  useEffect(() => {
    const generateOwnerData = () => {
      const dynamicOwnerData = roomData?.map((room) => {
        const building = buildingData?.find(
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
    };
    if (roomData?.length > 0 && buildingData?.length > 0) {
      generateOwnerData();
    }
  }, [roomData, buildingData, eventFormValues.status, statusColors]);
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
  const filteredEndTimeOptions = timeOptions.filter((time) => {
    const startTime = eventFormValues.startTime;
    if (!startTime) {
      return true; // If no start time is selected, show all options
    }
    const startTimeInMinutes = convertTimeToMinutes(startTime);
    const timeInMinutes = convertTimeToMinutes(time);
    return timeInMinutes > startTimeInMinutes; // Show only times after the start time
  });
  const getRoomName = (value) => {
    return value.resourceData[value.resource.textField];
  };
  const getRoomType = (value) => {
    return value.resourceData.type;
  };
  const getRoomCapacity = (value) => {
    return value.resourceData.capacity;
  };
  const getRoomBuilding = (value) => {
    return value.resourceData.building;
  };
  useEffect(() => {
    if (eventFormValues && !originalStartTime && !originalEndTime) {
      setOriginalStartTime(eventFormValues.startTime);
      setOriginalEndTime(eventFormValues.endTime);
    }
  }, [eventFormValues, originalStartTime, originalEndTime]);
  const subtractOneMinute = (timeStr) => {
    let [time, meridian] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    minutes -= 1;
    if (minutes < 0) {
      minutes = 59;
      hours -= 1;
      if (hours === 0) {
        hours = 12;
        // meridian = meridian === "am" ? "pm" : "am";
        meridian = 'meridian === "am" ? "pm" : "am";';
      }
    }
    const newTime = `${hours}:${minutes
      .toString()
      .padStart(2, "0")} ${meridian}`;
    return newTime;
  };
  const addOneMinute = (timeStr) => {
    let [time, meridian] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    minutes += 1;
    if (minutes === 60) {
      minutes = 0;
      hours += 1;
      if (hours === 12) {
        meridian = meridian === "am" ? "pm" : "am";
      } else if (hours > 12) {
        hours = 1;
      }
    }
    const newTime = `${hours}:${minutes
      .toString()
      .padStart(2, "0")} ${meridian}`;
    return newTime;
  };
  const updateEvent = async () => {
    const formattedDate = new Date(eventFormValues.bookingDate)
      .toISOString()
      .split("T")[0];
    const isStartTimeChanged = eventFormValues.startTime !== originalStartTime;
    const isEndTimeChanged = eventFormValues.endTime !== originalEndTime;
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
      bookingId: bookingId,
      updates,
      userId: userId,
    };
    try {
      if (isStartTimeChanged || isEndTimeChanged) {
        const newStartTime = addOneMinute(originalEndTime);
        const newEndTime = subtractOneMinute(eventFormValues.endTime);
        const availabilityData = {
          roomId: eventFormValues.roomId,
          date: formattedDate,
          startTime: newStartTime,
          endTime: newEndTime,
        };
        $ajax_post(
          "check-room-availability",
          { ...availabilityData },
          function (response) {
            console.log(response, "response");
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
          }
        );
      }
      $ajax_post("update-booking", { ...requestData }, function (response) {
        // if (response?.status === "success") {
        Notification.open(
          "success",
          "Notification Title",
          "Event updated successfully",
          3000,
          "bottom-right"
        );
        getAllBookings();
        // } else {
        //   Notification.open(
        //     "error",
        //     "Notification Title",
        //     "Failed to update event, Please try again",
        //     3000,
        //     "top-right"
        //   );
        // }
      });
    } catch (error) {
      console.error("Error updating event", error);
    }
    setEventList((prevEventList) => [...prevEventList, requestData]);
  };
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    let errors = {};
    if (!eventFormValues?.eventTitle?.trim()) {
      errors.eventTitle = "Event Title is required";
    }
    if (!eventFormValues?.endTime?.trim()) {
      errors.endTime = "End Time is required";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
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
    try {
      const availabilityData = {
        roomId: eventFormValues.roomId,
        date: formattedDate,
        startTime: data.start_time,
        endTime: adjustedEndTime,
      };
      $ajax_post(
        "check-room-availability",
        { ...availabilityData },
        function (response) {
          const { isAvailable } = response;
          if (isAvailable) {
            const bodyData = {
              ...data,
            };
            $ajax_post("createBooking", { ...bodyData }, function (response) {
              // if (response) {
              Notification.open(
                "success",
                "Notification Title",
                "Event created successfully",
                3000,
                "bottom-right"
              );
              getAllBookings();
              // } else {
              //   Notification.open(
              //     "error",
              //     "Notification Title",
              //     "Failed to create event, Please try again",
              //     3000,
              //     "top-right"
              //   );
              // }
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
        }
      );
    } catch (error) {
      console.error("Error creating event", error);
    }
    console.log(" createEvent ~ response:", response);
    setEventList((prevEventList) => [...prevEventList, data]);
  };

  const handleSubmit = async () => {
    if (eventFormValues.id) {
      await updateEvent();
    } else {
      await createEvent();
    }
  };
  const resourceHeaderTemplate = (props) => {
    return (
      <div className="template-wrap">
        <div className="room-building">{getRoomBuilding(props)}</div>
        <div className="room-name">{getRoomName(props)}</div>
        <div className="room-type">{getRoomType(props)}</div>
        <div className="room-capacity">{getRoomCapacity(props)}</div>
      </div>
    );
  };
  const statusOptions = [
    { value: "Pending", label: "Pending Confirmation" },
    { value: "Booked", label: "Booking Confirmed" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];
  const addEditEventTemplate = (
    <>
      <Row
        style={{
          marginBottom: "10px",
        }}
      >
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
      <Row
        style={{
          marginBottom: "10px",
        }}
      >
        <Col sm={4}>
          <label className="control-label">Room</label>
        </Col>
        <Col sm={8}>
          <Select
            defaultValue={
              eventFormValues.roomId ? eventFormValues.roomId : null
            }
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
      <Row
        style={{
          marginBottom: "10px",
        }}
      >
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

      <Row
        style={{
          marginBottom: "10px",
        }}
      >
        <Col sm={4}>
          <label className="control-label">Booking Date</label>
        </Col>
        <Col sm={8}>
          <DatePicker
            open // Ensures the calendar is open
            style={{ width: 100 }} // Hides the input field width
            dropdownClassName="calendar-only" // Adds a custom class for the dropdown
            suffixIcon=""
            defaultValue={
              currentEvent?.StartTime?.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }) || ""
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
      <Row
        style={{
          marginBottom: "10px",
        }}
      >
        <Col sm={4}>
          <label className="control-label">Start Time</label>
        </Col>
        <Col sm={8}>
          <Select
            defaultValue={
              eventFormValues.startTime ? eventFormValues.startTime : null
            }
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
      <Row
        style={{
          marginBottom: "10px",
        }}
      >
        <Col sm={4}>
          <label className="control-label">
            End Time <span style={{ color: "red" }}>*</span>
          </label>
        </Col>
        <Col sm={8}>
          <Select
            defaultValue={
              eventFormValues.endTime ? eventFormValues.endTime : null
            }
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
      <Row
        style={{
          marginBottom: "10px",
        }}
      >
        <Col sm={4}>
          <label className="control-label">Status</label>
        </Col>
        <Col sm={8}>
          <Select
            defaultValue={
              eventFormValues.status ? eventFormValues.status : null
            }
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
      {currentEvent?.Id ? (
        <>
          <Row
            style={{
              marginBottom: "10px",
            }}
          >
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
          <Row
            style={{
              marginBottom: "10px",
            }}
          >
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
          <Row
            style={{
              marginBottom: "10px",
            }}
          >
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
          <Row
            style={{
              marginBottom: "10px",
            }}
          >
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
      ) : null}
    </>
  );
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
  function formatTime(dateString) {
    // Parse the input date string into a Date object
    const date = new Date(dateString);

    // Get the hours and minutes
    let hours = date.getHours();
    const minutes = date.getMinutes();

    // Determine AM or PM
    const meridian = hours >= 12 ? "pm" : "am";

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // If 0, set it to 12 (12-hour clock)

    // Format minutes as two digits
    const formattedMinutes = minutes.toString().padStart(2, "0");

    // Combine the time string
    return `${hours}:${formattedMinutes} ${meridian}`;
  }
  const [currentBooking, setCurrentBooking] = useState(null);
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
        const endTime = formatTime(currentEvent.EndTime);
        const userData = bookingList?.find(
          (data) => data.id === currentEvent.Id
        )?.user;
        const updatedUserData = bookingList?.find(
          (data) => data.id === currentEvent.Id
        )?.updatedBy;
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
        const data = bookingList?.find((data) => data.id === currentEvent.Id);
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
        setEventFormValues((prevForm) => ({
          ...prevForm,
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
  }, [currentEvent]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const deleteBooking = async () => {
    setDeleteLoading(true);
    try {
      const userId = user?.externalId;
      const bookingId = currentEvent?.Id;
      const requestData = {
        bookingId: bookingId,
        userId: userId,
      };
      $ajax_post("deleteBooking", { ...requestData }, function (response) {
        // if (response) {
        Notification.open(
          "success",
          "Notification Title",
          "Event deleted successfully",
          3000,
          "bottom-right"
        );
        getAllBookings();
        setDeleteModalOpen(false);
        setAddEditEventDrawerVisible(false);
        // } else {
        //   Notification.open(
        //     "error",
        //     "Notification Title",
        //     "Failed to delete event, Please try again",
        //     3000,
        //     "top-right"
        //   );
        //   getAllBookings();
        //   setDeleteModalOpen(false);
        // }
      });
    } catch (error) {
      console.error("Error deleting booking", error);
    }
    setDeleteLoading(false);
  };
  const handleDelete = () => {
    setDeleteModalOpen(true);
  };
  const addEditEventDrawerFooterTemplate = (
    <div className="ec_add_edit_event_footer">
      <div>
        {currentEvent?.Id && (
          <Button
            type="danger"
            htmlType="submit"
            form="createScreenForm"
            onClick={() => {
              handleDelete();
              // setCurrentEvent(null);
            }}
          >
            Delete
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          form="createScreenForm"
          onClick={() => {
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
            handleSubmit();
            setAddEditEventDrawerVisible(false);
            setCurrentEvent(null);
          }}
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
  const xAxisHeaderLabelStyle = {
    color: "blue",
    fontSize: "14px",
    fontWeight: "bold",
    backgroundColor: "pink",
  };
  const xAxisTitleStyle = {
    color: "green",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "yellow",
  };
  const xAxisTimelineStyle = {
    color: "red",
    fontSize: "15px",
    fontWeight: "bold",
    backgroundColor: "teal",
  };
  const yAxisValueStyle = {
    color: "purple",
    fontSize: "13px",
    fontWeight: "bold",
    backgroundColor: "thistle",
  };
  {
    console.log(eventList, "eventList");
  }
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

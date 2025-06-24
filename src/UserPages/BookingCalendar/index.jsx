import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

dayjs.extend(utc);
dayjs.extend(timezone);

// Constants
const TIME_OPTIONS = [
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

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending Confirmation" },
  { value: "Booked", label: "Booking Confirmed" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const CALENDAR_STYLES = {
  xAxisHeaderLabel: {
    color: "#000000",
    fontSize: "14px",
    fontWeight: "bold",
    backgroundColor: "#FF851B",
  },
  xAxisTitle: {
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "crimson",
  },
  xAxisTimeline: {
    color: "white",
    fontSize: "15px",
    fontWeight: "bold",
    backgroundColor: "teal",
  },
  yAxisValue: {
    backgroundColor: "#990011",
    fontSize: "13px",
    fontWeight: "bold",
    color: "#FCF6F5",
  },
};

const INITIAL_FORM_VALUE = {
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

// Custom hooks
const useApi = () => {
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (endpoint, payload = {}) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      $ajax_post(
        endpoint,
        payload,
        (response) => {
          setLoading(false);
          resolve(response);
        },
        (error) => {
          setLoading(false);
          console.error(`Error fetching data from ${endpoint}:`, error);
          reject(error);
        }
      );
    });
  }, []);

  return { fetchData, loading };
};

// Utility functions
const timeUtils = {
  handleTimeFormat: (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  },

  combineDateAndTime: (dateString, timeString) => {
    const date = new Date(dateString);
    const timeParts = timeString.split(":");
    if (timeParts.length < 2) {
      throw new Error("Invalid time format");
    }
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    date.setHours(hours, minutes, 0, 0);
    return date;
  },

  convertTimeToMinutes: (timeString) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "pm" && hours !== "12") {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === "am" && hours === "12") {
      hours = 0;
    }
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  },

  adjustTime: (timeStr, minutesToAdd) => {
    if (!timeStr || typeof timeStr !== "string") {
      console.error("Invalid time string:", timeStr);
      return timeStr;
    }

    const parts = timeStr.split(" ");
    if (parts.length !== 2) {
      console.error("Invalid time format:", timeStr);
      return timeStr;
    }

    const [time, meridian] = parts;
    const timeParts = time.split(":");
    if (timeParts.length !== 2) {
      console.error("Invalid time parts:", time);
      return timeStr;
    }

    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid time numbers:", hours, minutes);
      return timeStr;
    }

    minutes += minutesToAdd;

    if (minutes < 0) {
      minutes = 59;
      hours -= 1;
      if (hours < 1) {
        hours = 12;
        return `${hours}:${minutes.toString().padStart(2, "0")} ${meridian === "am" ? "pm" : "am"
          }`;
      }
    } else if (minutes >= 60) {
      minutes = 0;
      hours += 1;
      if (hours === 12) {
        return `${hours}:${minutes.toString().padStart(2, "0")} ${meridian === "am" ? "pm" : "am"
          }`;
      } else if (hours > 12) {
        hours = 1;
      }
    }

    return `${hours}:${minutes.toString().padStart(2, "0")} ${meridian}`;
  },

  formatTime: (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const meridian = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${formattedMinutes} ${meridian}`;
  },

  generateDateRange: (startDate, days) => {
    const dates = [];
    const current = new Date(startDate);

    for (let i = 0; i < days; i++) {
      dates.push(new Date(current).toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  },

  isTimeInBreakPeriod: (startTime, endTime, breakTimeData) => {
    if (!breakTimeData?.start_time || !breakTimeData?.end_time) {
      return false;
    }

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

    const eventStartMinutes = convertTimeToMinutes(startTime);
    const eventEndMinutes = convertTimeToMinutes(endTime);
    const breakStartMinutes = convertTimeToMinutes(breakTimeData.start_time);
    const breakEndMinutes = convertTimeToMinutes(breakTimeData.end_time);

    // Check if event time overlaps with break time
    return (
      eventStartMinutes < breakEndMinutes && eventEndMinutes > breakStartMinutes
    );
  },

  // Helper to format break time for display
  formatBreakTime: (breakTimeData) => {
    if (!breakTimeData?.start_time || !breakTimeData?.end_time) {
      return "break time";
    }
    return `${breakTimeData.start_time} - ${breakTimeData.end_time}`;
  },
};

const dateUtils = {
  formatDateForDisplay: (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },

  convertToISO: (date) => {
    const localDate = dayjs(date)
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DDTHH:mm:ss");
    return dayjs.utc(localDate).toISOString();
  },
};

// State reducer
const initialState = {
  roomData: [],
  buildingData: [],
  buildingOptions: [],
  ownerData: [],
  bookingList: [],
  rawBookings: [], // Add this to store raw booking data
  eventList: [],
  currentEvent: null,
  currentBooking: null,
  eventFormValues: INITIAL_FORM_VALUE,
  originalStartTime: "",
  originalEndTime: "",
  startTime: "00:00",
  endTime: "23:59",
  breakTimeData: {},
  statusColors: {},
  addEditEventDrawerVisible: false,
  deleteModalOpen: false,
  deleteLoading: false,
  errors: {},
};

const bookingReducer = (state, action) => {
  switch (action.type) {
    case "SET_ROOM_DATA":
      return { ...state, roomData: action.payload };
    case "SET_BUILDING_DATA":
      return {
        ...state,
        buildingData: action.payload,
        buildingOptions: action.payload.map((building) => ({
          label: building.name,
          value: building.id,
        })),
      };
    case "SET_BOOKING_LIST":
      return { ...state, bookingList: action.payload };
    case "SET_RAW_BOOKINGS":
      return { ...state, rawBookings: action.payload };
    case "SET_EVENT_LIST":
      return { ...state, eventList: action.payload };
    case "SET_CURRENT_EVENT":
      return { ...state, currentEvent: action.payload };
    case "SET_CURRENT_BOOKING":
      return { ...state, currentBooking: action.payload };
    case "SET_EVENT_FORM_VALUES":
      return { ...state, eventFormValues: action.payload };
    case "UPDATE_EVENT_FORM_VALUES":
      return {
        ...state,
        eventFormValues: { ...state.eventFormValues, ...action.payload },
      };
    case "SET_ORIGINAL_TIMES":
      return {
        ...state,
        originalStartTime: action.payload.startTime,
        originalEndTime: action.payload.endTime,
      };
    case "SET_OPERATIONAL_TIME":
      return {
        ...state,
        startTime: action.payload.startTime,
        endTime: action.payload.endTime,
      };
    case "SET_BREAK_TIME_DATA":
      return { ...state, breakTimeData: action.payload };
    case "SET_STATUS_COLORS":
      return { ...state, statusColors: action.payload };
    case "SET_OWNER_DATA":
      return { ...state, ownerData: action.payload };
    case "SET_DRAWER_VISIBLE":
      return { ...state, addEditEventDrawerVisible: action.payload };
    case "SET_DELETE_MODAL":
      return { ...state, deleteModalOpen: action.payload };
    case "SET_DELETE_LOADING":
      return { ...state, deleteLoading: action.payload };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "UPDATE_ERRORS":
      return { ...state, errors: { ...state.errors, ...action.payload } };
    case "RESET_FORM":
      return {
        ...state,
        eventFormValues: INITIAL_FORM_VALUE,
        currentEvent: null,
        errors: {},
      };
    default:
      return state;
  }
};

function BookingCalendar() {
  const user = clerk?.user;
  const { fetchData } = useApi();
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Memoized values
  const filteredEndTimeOptions = useMemo(() => {
    if (!state.eventFormValues.startTime) return TIME_OPTIONS;

    const startTimeInMinutes = timeUtils.convertTimeToMinutes(
      state.eventFormValues.startTime
    );
    return TIME_OPTIONS.filter((time) => {
      const timeInMinutes = timeUtils.convertTimeToMinutes(time);
      return timeInMinutes > startTimeInMinutes;
    });
  }, [state.eventFormValues.startTime]);

  const headerDropdownTemplate = useMemo(
    () => (
      <Select
        name="buildingOption"
        defaultValue={state.buildingOptions?.map((option) => option?.value)}
        multiple={true}
        selectOptions={state.buildingOptions}
        onChange={(value) => {
          getRoomsByBuildingIds(value);
          getBuildingsByIds(value);
        }}
      />
    ),
    [state.buildingOptions]
  );

  const roomSelectOptions = useMemo(
    () =>
      state.ownerData.map((item) => ({
        value: item.id,
        label: item.text,
      })),
    [state.ownerData]
  );

  // API functions
  const getRoomList = useCallback(async () => {
    try {
      const response = await fetchData("rooms", {});
      dispatch({ type: "SET_ROOM_DATA", payload: response });
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, [fetchData]);

  const getBuildingList = useCallback(async () => {
    try {
      const response = await fetchData("buildings", {});
      dispatch({ type: "SET_BUILDING_DATA", payload: response });
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  }, [fetchData]);

  const getRoomsByBuildingIds = useCallback(
    async (buildingIds) => {
      try {
        const response = await fetchData("rooms-by-building", { buildingIds });
        dispatch({ type: "SET_ROOM_DATA", payload: response });
      } catch (error) {
        console.error("Error fetching rooms by building:", error);
      }
    },
    [fetchData]
  );

  const getBuildingsByIds = useCallback(
    async (buildingIds) => {
      try {
        const response = await fetchData("buildings-by-id", { buildingIds });
        dispatch({ type: "SET_BUILDING_DATA", payload: response });
      } catch (error) {
        console.error("Error fetching buildings by ID:", error);
      }
    },
    [fetchData]
  );

  const getStatusList = useCallback(async () => {
    try {
      const response = await fetchData("statusColors", {});
      const colorsMap = response?.reduce((acc, item) => {
        acc[item.status] = item.color;
        return acc;
      }, {});
      dispatch({ type: "SET_STATUS_COLORS", payload: colorsMap });
    } catch (error) {
      console.error("Error fetching status colors:", error);
    }
  }, [fetchData]);

  const getTimeList = useCallback(async () => {
    try {
      const response = await fetchData("timeConfig", {});

      const operationalTime = response?.find(
        (event) => event.title === "Operational Time"
      );
      if (operationalTime) {
        dispatch({
          type: "SET_OPERATIONAL_TIME",
          payload: {
            startTime: timeUtils.handleTimeFormat(operationalTime.start_time),
            endTime: timeUtils.handleTimeFormat(operationalTime.end_time),
          },
        });
      }

      const lunchBreak = response?.find(
        (event) => event.title === "Lunch Break"
      );
      if (lunchBreak) {
        dispatch({ type: "SET_BREAK_TIME_DATA", payload: lunchBreak });
      }
    } catch (error) {
      console.error("Error fetching time config:", error);
    }
  }, [fetchData]);

  const getAllBookings = useCallback(async () => {
    try {
      const response = await fetchData("allBookings", {});
      dispatch({ type: "SET_BOOKING_LIST", payload: response });

      // Store the response to be processed when dependencies are ready
      dispatch({ type: "SET_RAW_BOOKINGS", payload: response });
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, [fetchData]);

  // Separate function to process bookings into events
  const processBookingsToEvents = useCallback(
    (bookings, statusColors, breakTimeData, ownerData) => {
      if (!bookings?.length || !statusColors || !ownerData?.length) return;

      // Transform bookings to events
      const transformedData = bookings.map((booking) => ({
        Id: booking?.id || null,
        Subject: booking?.title || "No Subject",
        Description: booking?.description || "No Description",
        StartTime: timeUtils
          .combineDateAndTime(booking?.date, booking?.start_time)
          .toISOString(),
        EndTime: timeUtils
          .combineDateAndTime(booking?.date, booking?.end_time)
          .toISOString(),
        RoomId: booking?.room_id || null,
        BackgroundColor: statusColors[booking?.status] || "#5F9EA0",
        rawData: booking,
      }));

      // Generate break times for all rooms across multiple days
      const breakDataList = [];

      if (breakTimeData?.title) {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const datesRange = timeUtils.generateDateRange(startOfWeek, 7);
        const bookingDates = [
          ...new Set(bookings.map((booking) => booking?.date)),
        ];
        const allDates = [...new Set([...datesRange, ...bookingDates])];

        ownerData.forEach(({ id: roomId }) => {
          allDates.forEach((date) => {
            if (date) {
              try {
                breakDataList.push({
                  Id: `break-${roomId}-${date}`,
                  Subject: breakTimeData?.title || "Break Time",
                  StartTime: timeUtils
                    .combineDateAndTime(date, breakTimeData?.start_time)
                    .toISOString(),
                  EndTime: timeUtils
                    .combineDateAndTime(date, breakTimeData?.end_time)
                    .toISOString(),
                  RecurrenceRule: "FREQ=DAILY;INTERVAL=1;",
                  IsBlock: true,
                  RoomId: roomId,
                  BackgroundColor: "#808080",
                });
              } catch (error) {
                console.error(
                  `Error creating break time for room ${roomId} on ${date}:`,
                  error
                );
              }
            }
          });
        });
      }

      dispatch({
        type: "SET_EVENT_LIST",
        payload: [...transformedData, ...breakDataList],
      });
    },
    []
  );

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!state.eventFormValues?.eventTitle?.trim()) {
      newErrors.eventTitle = "Event Title is required";
    }

    if (!state.eventFormValues?.startTime?.trim()) {
      newErrors.startTime = "Start Time is required";
    }

    if (!state.eventFormValues?.endTime?.trim()) {
      newErrors.endTime = "End Time is required";
    }

    // NEW: Break time validation
    if (
      state.eventFormValues?.startTime &&
      state.eventFormValues?.endTime &&
      state.breakTimeData?.title
    ) {
      const isBreakTimeConflict = timeUtils.isTimeInBreakPeriod(
        state.eventFormValues.startTime,
        state.eventFormValues.endTime,
        state.breakTimeData
      );

      if (isBreakTimeConflict) {
        const breakTimeDisplay = timeUtils.formatBreakTime(state.breakTimeData);
        newErrors.timeConflict = `Event cannot be scheduled during ${state.breakTimeData.title} (${breakTimeDisplay})`;
      }
    }

    dispatch({ type: "SET_ERRORS", payload: newErrors });
    return Object.keys(newErrors).length === 0;
  }, [state.eventFormValues, state.breakTimeData]);

  // Event handlers
  const handleFormChange = useCallback(
    (field, value) => {
      dispatch({
        type: "UPDATE_EVENT_FORM_VALUES",
        payload: { [field]: value },
      });

      if (state.errors[field]) {
        dispatch({
          type: "UPDATE_ERRORS",
          payload: { [field]: "" },
        });
      }
    },
    [state.errors]
  );

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      // Check specifically for break time conflict to show appropriate message
      if (state.errors.timeConflict) {
        Notification.open(
          "error",
          "Break Time Conflict",
          state.errors.timeConflict,
          4000,
          "top-right"
        );
      } else {
        Notification.open(
          "error",
          "Validation Error",
          "Please fill in all required fields",
          3000,
          "top-right"
        );
      }
      return;
    }

    const formattedDate = new Date(state.eventFormValues.bookingDate)
      .toISOString()
      .split("T")[0];

    const data = {
      user_id: user.externalId,
      title: state.eventFormValues.eventTitle,
      room_id: state.eventFormValues.roomId,
      description: state.eventFormValues.description,
      date: formattedDate,
      start_time: state.eventFormValues.startTime,
      end_time: state.eventFormValues.endTime,
      status: state.eventFormValues.status,
    };

    try {
      if (state.eventFormValues.id) {
        // Update existing booking - also check break time for updates
        const isBreakTimeConflict = timeUtils.isTimeInBreakPeriod(
          state.eventFormValues.startTime,
          state.eventFormValues.endTime,
          state.breakTimeData
        );

        if (isBreakTimeConflict) {
          const breakTimeDisplay = timeUtils.formatBreakTime(
            state.breakTimeData
          );
          Notification.open(
            "error",
            "Break Time Conflict",
            `Cannot update event to ${state.breakTimeData.title} period (${breakTimeDisplay})`,
            4000,
            "top-right"
          );
          return;
        }

        const updates = { ...data };
        delete updates.user_id;

        const requestData = {
          bookingId: state.eventFormValues.id,
          updates,
          userId: user.externalId,
        };

        await fetchData("update-booking", requestData);
        Notification.open(
          "success",
          "Update Successful",
          "Event updated successfully",
          3000,
          "bottom-right"
        );
      } else {
        // Create new booking - double-check break time before availability check
        const isBreakTimeConflict = timeUtils.isTimeInBreakPeriod(
          state.eventFormValues.startTime,
          state.eventFormValues.endTime,
          state.breakTimeData
        );

        if (isBreakTimeConflict) {
          const breakTimeDisplay = timeUtils.formatBreakTime(
            state.breakTimeData
          );
          Notification.open(
            "error",
            "Break Time Conflict",
            `Cannot create event during ${state.breakTimeData.title} (${breakTimeDisplay})`,
            4000,
            "top-right"
          );
          return;
        }

        const adjustedEndTime = timeUtils.adjustTime(
          state.eventFormValues.endTime,
          -1
        );

        const availabilityData = {
          roomId: state.eventFormValues.roomId,
          date: formattedDate,
          startTime: data.start_time,
          endTime: adjustedEndTime,
        };

        const response = await fetchData(
          "check-room-availability",
          availabilityData
        );

        if (response.isAvailable) {
          $ajax_post(
            "createBooking",
            data,
            (res) => {
              if (!res?.totalConflicts) {
                Notification.open(
                  "success",
                  "Booking Successful",
                  "Event created successfully",
                  3000,
                  "bottom-right"
                );
              } else {
                Notification.open(
                  "danger",
                  "Can't create booking.",
                  "Same time you have another booking.",
                  5000,
                  "bottom-right"
                );
              }
            },
            (error) => {
              Notification.open(
                "warning",
                "Room Unavailable",
                "The selected room is unavailable for the specified time.",
                3000,
                "top-left"
              );
            }
          );
        }
      }

      // Refresh bookings data
      getAllBookings();
      dispatch({ type: "SET_DRAWER_VISIBLE", payload: false });
      dispatch({ type: "RESET_FORM" });
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  }, [
    state.eventFormValues,
    state.errors,
    state.breakTimeData,
    user,
    fetchData,
    validateForm,
    getAllBookings,
  ]);

  const handleDelete = useCallback(async () => {
    dispatch({ type: "SET_DELETE_LOADING", payload: true });

    try {
      const requestData = {
        bookingId: state.currentEvent?.Id,
        userId: user?.externalId,
      };

      await fetchData("deleteBooking", requestData);

      Notification.open(
        "success",
        "Deletion Successful",
        "Event deleted successfully",
        3000,
        "bottom-right"
      );

      getAllBookings();
      dispatch({ type: "SET_DELETE_MODAL", payload: false });
      dispatch({ type: "SET_DRAWER_VISIBLE", payload: false });
    } catch (error) {
      console.error("Error deleting booking:", error);
    } finally {
      dispatch({ type: "SET_DELETE_LOADING", payload: false });
    }
  }, [state.currentEvent, user, fetchData, getAllBookings]);

  // Effects
  useEffect(() => {
    Promise.all([
      getRoomList(),
      getBuildingList(),
      getStatusList(),
      getTimeList(),
    ]);
  }, [getRoomList, getBuildingList, getStatusList, getTimeList]);

  // Load bookings only when status colors are available
  useEffect(() => {
    if (Object.keys(state.statusColors).length > 0) {
      getAllBookings();
    }
  }, [state.statusColors, getAllBookings]);

  // Process bookings when dependencies are ready
  useEffect(() => {
    if (
      state.rawBookings?.length > 0 &&
      Object.keys(state.statusColors).length > 0 &&
      state.ownerData?.length > 0
    ) {
      processBookingsToEvents(
        state.rawBookings,
        state.statusColors,
        state.breakTimeData,
        state.ownerData
      );
    }
  }, [
    state.rawBookings,
    state.statusColors,
    state.breakTimeData,
    state.ownerData,
    processBookingsToEvents,
  ]);

  useEffect(() => {
    if (
      state.roomData?.length > 0 &&
      state.buildingData?.length > 0 &&
      Object.keys(state.statusColors).length > 0
    ) {
      const dynamicOwnerData = state.roomData.map((room) => {
        const building = state.buildingData.find(
          (building) => building?.id === room?.building_id
        );

        return {
          text: room?.name,
          id: room?.id,
          color: state.statusColors["Pending"], // Use default status color
          capacity: room?.capacity,
          type: room?.type,
          building: building?.name,
        };
      });

      dispatch({ type: "SET_OWNER_DATA", payload: dynamicOwnerData });
    }
  }, [state.roomData, state.buildingData, state.statusColors]);

  useEffect(() => {
    if (state.currentEvent) {
      const inputDate = new Date(state.currentEvent.StartTime);
      const formattedDate = dateUtils.formatDateForDisplay(inputDate);
      const isoDate = dateUtils.convertToISO(state.currentEvent.StartTime);
      const startTime = timeUtils.formatTime(state.currentEvent.StartTime);

      if (state.currentEvent.Id) {
        const endTime = timeUtils.formatTime(state.currentEvent.EndTime);
        const data = state.bookingList?.find(
          (data) => data.id === state.currentEvent.Id
        );

        if (data) {
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

          const updatedDateText = dateUtils.formatDateForDisplay(
            new Date(data?.updated_at)
          );
          const isoUpdateDate = dateUtils.convertToISO(data?.updated_at);

          dispatch({ type: "SET_CURRENT_BOOKING", payload: data });
          dispatch({
            type: "SET_EVENT_FORM_VALUES",
            payload: {
              id: state.currentEvent.Id,
              eventTitle: state.currentEvent.Subject,
              description: state.currentEvent.Description,
              roomId: state.currentEvent.RoomId,
              bookingDate: isoDate,
              bookingDateText: formattedDate,
              startTime: startTime,
              endTime: endTime,
              status: state.currentEvent.rawData.status,
              createdBy: createdBy,
              updatedBy: updatedBy,
              updatedDate: isoUpdateDate,
              updatedDateText: updatedDateText,
            },
          });
        }
      } else {
        dispatch({
          type: "SET_EVENT_FORM_VALUES",
          payload: {
            ...INITIAL_FORM_VALUE,
            bookingDate: isoDate,
            bookingDateText: formattedDate,
            startTime: startTime,
            status: "Pending",
            roomId: state.currentEvent.RoomId,
          },
        });
      }
    } else {
      dispatch({ type: "SET_EVENT_FORM_VALUES", payload: INITIAL_FORM_VALUE });
    }
  }, [state.currentEvent, state.bookingList]);

  // Templates
  const resourceHeaderTemplate = useCallback(
    (props) => (
      <div className="template-wrap">
        <div className="room-building">{props?.resourceData.building}</div>
        <div className="room-name">
          {props?.resourceData?.[props?.resource.textField]}
        </div>
        <div className="room-type">{props?.resourceData.type}</div>
        <div className="room-capacity">{props?.resourceData.capacity}</div>
      </div>
    ),
    []
  );

  const addEditEventTemplate = useMemo(
    () => (
      <>
        {state.errors?.timeConflict && (
          <Row style={{ marginBottom: "10px" }}>
            <Col sm={12}>
              <div
                style={{
                  color: "red",
                  fontSize: "14px",
                  padding: "10px",
                  backgroundColor: "#fff2f0",
                  border: "1px solid #ffccc7",
                  borderRadius: "4px",
                  marginBottom: "10px",
                  fontWeight: "400",
                }}
              >
                <span>⚠️ {state.errors.timeConflict}</span>
              </div>
            </Col>
          </Row>
        )}

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
              onChange={(value) => handleFormChange("eventTitle", value)}
              value={state.eventFormValues.eventTitle || ""}
            />
            {state.errors?.eventTitle && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {state.errors?.eventTitle}
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
              defaultValue={state.eventFormValues.roomId || null}
              name="room"
              selectOptions={roomSelectOptions}
              onChange={(_, obj) => handleFormChange("roomId", obj.value)}
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
              onChange={(value) => handleFormChange("description", value)}
              value={state.eventFormValues.description || ""}
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
                state.currentEvent?.StartTime
                  ? dateUtils.formatDateForDisplay(
                    new Date(state.currentEvent.StartTime)
                  )
                  : ""
              }
              allowClear={false}
              onChange={(value) => {
                const formattedDate = dateUtils.formatDateForDisplay(
                  new Date(value)
                );
                const isoDate = dateUtils.convertToISO(value);

                dispatch({
                  type: "UPDATE_EVENT_FORM_VALUES",
                  payload: {
                    bookingDateText: formattedDate,
                    bookingDate: isoDate,
                  },
                });
              }}
            />
          </Col>
        </Row>

        <Row style={{ marginBottom: "10px" }}>
          <Col sm={4}>
            <label className="control-label">
              Start Time <span style={{ color: "red" }}>*</span>
            </label>
          </Col>
          <Col sm={8}>
            <Select
              defaultValue={state.eventFormValues.startTime || null}
              name="startTime"
              selectOptions={TIME_OPTIONS.map((item) => ({
                value: item,
                label: item,
              }))}
              onChange={(_, obj) => handleFormChange("startTime", obj?.value)}
            />
            {state.errors?.startTime && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {state.errors?.startTime}
              </span>
            )}
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
              defaultValue={state.eventFormValues.endTime || null}
              name="endTime"
              selectOptions={filteredEndTimeOptions.map((item) => ({
                value: item,
                label: item,
              }))}
              onChange={(_, obj) => handleFormChange("endTime", obj?.value)}
            />
            {state.errors?.endTime && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {state.errors?.endTime}
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
              defaultValue={state.eventFormValues.status || null}
              name="status"
              selectOptions={STATUS_OPTIONS}
              onChange={(_, obj) => handleFormChange("status", obj?.value)}
            />
          </Col>
        </Row>
        <Card key={"1"} className={"card.bg"}>
          <CardHeader>
            <CardTitle>{"card.title"}</CardTitle>
            <CardDescription>{"card.description"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: "22px" }} className="text-3xl font-bold">
              {"card.value"}
            </div>
          </CardContent>
        </Card>
        {/* {state.breakTimeData?.title && (
          <Row style={{ marginBottom: "10px" }}>
            <Col sm={12}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  padding: "8px",
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: "4px",
                }}
              >
                <strong>ℹ️ Note:</strong> {state.breakTimeData.title} is from{" "}
                {state.breakTimeData.start_time} -{" "}
                {state.breakTimeData.end_time}. Events cannot be scheduled
                during this time.
              </div>
            </Col>
          </Row>
        )} */}

        {state.currentEvent?.Id && (
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
                  value={state.eventFormValues.createdBy || ""}
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
                  value={state.eventFormValues.bookingDateText || ""}
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
                  value={state.eventFormValues.updatedBy || ""}
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
                  value={state.eventFormValues.updatedDateText || ""}
                />
              </Col>
            </Row>

          </>
        )}
      </>
    ),
    [
      state.eventFormValues,
      state.errors,
      state.currentEvent,
      state.breakTimeData,
      filteredEndTimeOptions,
      roomSelectOptions,
      handleFormChange,
    ]
  );

  const addEditEventDrawerFooterTemplate = useMemo(
    () => (
      <div className="ec_add_edit_event_footer">
        <div>
          {state.currentEvent?.Id && (
            <Button
              type="danger"
              htmlType="submit"
              form="createScreenForm"
              onClick={() =>
                dispatch({ type: "SET_DELETE_MODAL", payload: true })
              }
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
              dispatch({ type: "SET_DRAWER_VISIBLE", payload: false });
              dispatch({ type: "RESET_FORM" });
              dispatch({ type: "RESET_ERRORS" });
            }}
            style={{ marginRight: 8 }}
          >
            Cancel
          </Button>
        </div>
      </div>
    ),
    [state.currentEvent, handleSubmit]
  );

  console.log(state.currentEvent, "current event");
  return (
    <>
      <div className="event_calendar_container">
        {state.startTime && state.endTime && (
          <EventCalendar
            width="100%"
            height="calc(100vh - 100px)"
            eventList={state.eventList}
            ownerData={state.ownerData}
            resourceHeaderTemplate={resourceHeaderTemplate}
            headerTitle={["Building", "Room", "Type", "Capacity"]}
            currentEvent={state.currentEvent}
            setCurrentEvent={(event) =>
              dispatch({ type: "SET_CURRENT_EVENT", payload: event })
            }
            addEditEventTemplate={addEditEventTemplate}
            headerDropdownTemplate={headerDropdownTemplate}
            ownerColumnWidth={400}
            addEditEventDrawerVisible={state.addEditEventDrawerVisible}
            setAddEditEventDrawerVisible={(visible) =>
              dispatch({ type: "SET_DRAWER_VISIBLE", payload: visible })
            }
            addEditEventDrawerFooterTemplate={addEditEventDrawerFooterTemplate}
            startHour={state.startTime}
            endHour={state.endTime}
            xAxisHeaderLabelStyle={CALENDAR_STYLES.xAxisHeaderLabel}
            xAxisTitleStyle={CALENDAR_STYLES.xAxisTitle}
            xAxisTimelineStyle={CALENDAR_STYLES.xAxisTimeline}
            yAxisValueStyle={CALENDAR_STYLES.yAxisValue}
            xAxisTitleHeight={75}
            xAxisTimelineHeight={75}
            yAxisValueHeight={96}
            allowDragDrop={true}
          />
        )}
      </div>

      <ModalBox
        title="Delete Booking"
        isOpen={state.deleteModalOpen}
        onClose={() => dispatch({ type: "SET_DELETE_MODAL", payload: false })}
        width={500}
        footer={
          <>
            <Button type="primary" onClick={handleDelete}>
              Ok {state.deleteLoading && <Spin size="small" />}
            </Button>
          </>
        }
      >
        <div>
          {`Are you sure you want to delete`}{" "}
          <strong>{state.currentBooking?.title}</strong>
        </div>
      </ModalBox>
    </>
  );
}

export default BookingCalendar;

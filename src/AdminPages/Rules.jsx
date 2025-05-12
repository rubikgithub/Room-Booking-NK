import { useCallback, useEffect, useState } from "react";
import { Block, FormControl, FormRow, Notification, Select } from "unygc";
import { $ajax_post } from "../Library";

const timeOptions = ["1:00 am","1:30 am","2:00 am","2:30 am","3:00 am","3:30 am","4:00 am","4:30 am","5:00 am","5:30 am","6:00 am","6:30 am","7:00 am","7:30 am","8:00 am","8:30 am","9:00 am","9:30 am","10:00 am","10:30 am","11:00 am","11:30 am","12:00 pm","12:30 pm","1:00 pm","1:30 pm","2:00 pm","2:30 pm","3:00 pm","3:30 pm","4:00 pm","4:30 pm","5:00 pm","5:30 pm","6:00 pm","6:30 pm","7:00 pm","7:30 pm","8:00 pm","8:30 pm","9:00 pm","9:30 pm","10:00 pm","10:30 pm","11:00 pm","11:30 pm","12:00 am","12:30 am"];

function Rules() {
  const [timeList, setTimeList] = useState([]);
  const [eventValues, setEventValues] = useState({
    operationalStartTime: "",
    operationalEndTime: "",
    breakStartTime: "",
    breakEndTime: "",
  });

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    const hour = date.getHours() % 12 || 12;
    const minute = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "pm" : "am";

    return `${hour}:${minute} ${ampm}`;
  };

  const getTimeList = useCallback(() => {
    $ajax_post("timeConfig", {}, (response) => {
      setTimeList(response);
    });
  }, []);

  const updateEventValues = useCallback((list) => {
    const getTime = (title) => list.find((item) => item.title === title) || {};

    const operational = getTime("Operational Time");
    const breakTime = getTime("Lunch Break");

    setEventValues({
      operationalStartTime: formatTime(operational.start_time),
      operationalEndTime: formatTime(operational.end_time),
      breakStartTime: formatTime(breakTime.start_time),
      breakEndTime: formatTime(breakTime.end_time),
    });
  }, []);

  useEffect(() => {
    getTimeList();
  }, [getTimeList]);

  useEffect(() => {
    if (timeList.length > 0) {
      updateEventValues(timeList);
    }
  }, [timeList, updateEventValues]);

  const handleSelectChange = (field, value) => {
    const updatedValues = { ...eventValues, [field]: value };
    setEventValues(updatedValues);

    if (["operationalStartTime", "operationalEndTime"].includes(field)) {
      const { operationalStartTime, operationalEndTime } = updatedValues;
      if (operationalStartTime && operationalEndTime) {
        updateTimeConfig(
          "Operational Time",
          operationalStartTime,
          operationalEndTime
        );
      }
    }

    if (["breakStartTime", "breakEndTime"].includes(field)) {
      const { breakStartTime, breakEndTime } = updatedValues;
      if (breakStartTime && breakEndTime) {
        updateTimeConfig("Lunch Break", breakStartTime, breakEndTime);
      }
    }
  };

  const updateTimeConfig = (title, startTime, endTime) => {
    const item = timeList.find((i) => i.title === title);
    if (!item) {
      console.error(`No time item found for title: ${title}`);
      return;
    }

    const payload = {
      title,
      start_time: startTime,
      end_time: endTime,
    };

    $ajax_post(`update-time-config/${item.id}`, payload, () => {
      Notification.open(
        "success",
        "Notification Title",
        `${title} updated successfully`,
        3000,
        "bottom-right"
      );
      getTimeList();
    });
  };

  const renderTimeSelect = (label, name) => (
    <FormControl label={label}>
      <Select
        name={name}
        defaultValue={eventValues[name]}
        selectOptions={timeOptions.map((item) => ({
          value: item,
          label: item,
        }))}
        onChange={(_, obj) => handleSelectChange(name, obj?.value)}
      />
    </FormControl>
  );

  return (
    <Block title="Booking Rules">
      <div className="p-4">
        <FormRow cols={4}>
          {renderTimeSelect("Operational Start Time", "operationalStartTime")}
          {renderTimeSelect("Operational End Time", "operationalEndTime")}
          {renderTimeSelect("Break Start Time", "breakStartTime")}
          {renderTimeSelect("Break End Time", "breakEndTime")}
        </FormRow>
      </div>
    </Block>
  );
}

export default Rules;

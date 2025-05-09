import { useEffect, useState } from "react";
import { FormRow, Kanban, Button } from "unygc";
import axios from "axios";
const RoomsAndBuildings = () => {

    const [columns] = useState([]);
    const [data, setData] = useState([
      {
        id: "App1",
        title: "",
        status: 1,
        statusText: "To Do",
        priority: 3,
        priorityText: "Low",
        startedAssignees: [
          {
            id: 1,
            name: "Tekeshwar",
          },
          {
            id: 2,
            name: "Suresh",
          },
        ],
        totalHours: 10,
        assignees: [
          {
            id: 1,
            name: "Tekeshwar",
          },
          {
            id: 2,
            name: "Suresh",
          },
          {
            id: 3,
            name: "Ramesh",
          },
          {
            id: 4,
            name: "Rajesh",
          },
        ],
      },
      {
        id: "App2",
        title: "Task 2",
        status: 2,
        statusText: "In Progress",
        priority: 1,
        priorityText: "High",
      },
      {
        id: "App3",
        title: "Task 3",
        status: 2,
        statusText: "In Progress",
        priority: 2,
        priorityText: "Medium",
      },
      {
        id: "App4",
        title: "Task 4",
        status: 1,
        statusText: "To Do",
        priority: 3,
        priorityText: "Low",
      },
      {
        id: "App5",
        title: "Task 5",
        status: 2,
        statusText: "In Progress",
        priority: 2,
        priorityText: "Medium",
      },
      {
        id: "App6",
        title: "Task 6",
        status: 2,
        statusText: "In Progress",
        priority: 3,
        priorityText: "Low",
      },
      {
        id: "App7",
        title: "Task 7",
        status: 1,
        statusText: "To Do",
        priority: 1,
        priorityText: "High",
      },
    ]);
    const [stickyFilterContent, setStickyFilterContent] = useState(null);
    const [filterSearchBtn, setFilterSearchBtn] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const [fixedFilters, setFixedFilters] = useState([
      {
        field: "customerText",
        operator: "contains",
        value: "Careymon",
      },
    ]);
    const fetchData = async () => {
      try {
        // Save to the server
        setLoading(true);
        const response = await axios.post(
          "https://curiousrubik.us/dev/pmsdevapi.php?gyu=" +
            "cmp/pm/amenity-booking-list",
          {
            ref: "cmp/pm/amenity-booking-list",
            body: {},
          }
        );
        console.log("Kanban Data : ", response?.data?.data?.slice(0, 20));
        setData(response.data?.data);
      } catch (error) {
        console.error("Error in set:", error);
        throw error; // Re-throw the error for caller handling
      }
      setLoading(false);
    };
    const handleDragEnd = () => {};
  
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
      // HeaderSourceTo:(content)=>{
      //   console.log({content})
      // },
      // onApplyFilters: (filters) => {
      //   console.log(" testfilters onApplyFilters", filters);
      //   setData([...data]);
      // },
      filterOptions: {
        fixedFilters: fixedFilters,
      },
      groupByOptions: [
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
      ],
      defaultRecordType: {
        value: "customrecord_rioo_amenity_booking_calend",
        label: "Amenity Booking Calendar",
      },
      recordTypeOptions: [
        {
          value: "customrecord_rioo_amenity_booking_calend",
          label: "Amenity Booking Calendar",
        },
      ],
      defaultGroupByKey: "booking_status",
      enableFilters: true,
      enableGlobalSearch: true,
      defaultSettingOptions: {
        cardSettings: true,
        groupSettings: true,
        settings: true,
      },
  
      dataFields: [
        {
          id: "id",
          nameText: "ID",
          type: "text",
        },
        {
          id: "name",
          nameText: "Name",
          type: "text",
        },
        {
          id: "nameNumber",
          nameText: "Name Number",
          type: "text",
          allowFiltering: true,
          stickyFilter: true,
        },
        {
          id: "customer",
          nameText: "Customer ID",
          type: "text",
          allowFiltering: true,
          stickyFilter: true,
          field_id: "adjasd",
        },
        {
          id: "customerText",
          nameText: "Customer Name",
          type: "text",
          allowFiltering: true,
          stickyFilter: true,
          field_id: "custrecord_rioo_amnty_bkng_customer",
        },
        {
          id: "phone_num",
          nameText: "Phone Number",
          type: "text",
          allowFiltering: true,
          stickyFilter: true,
          field_id: "test_tst",
        },
        {
          id: "email",
          nameText: "Email",
          type: "text",
          field_id: "test",
        },
        {
          id: "unit_type",
          nameText: "Unit Type ID",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "unit_typeText",
          nameText: "Unit Type",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "unit_id",
          nameText: "Unit ID",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "unit_idText",
          nameText: "Unit Name",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "amenity_type",
          nameText: "Amenity Type ID",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "amenity_typeText",
          nameText: "Amenity Type",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "booking_date",
          nameText: "Booking Date",
          type: "date",
          allowFiltering: false,
        },
        {
          id: "start_time",
          nameText: "Start Time",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "end_time",
          nameText: "End Time",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "booking_status",
          nameText: "Booking Status ID",
          type: "singleSelect",
          listId: "customrecord_rioo_amenity_booking_status",
          allowFiltering: true,
          stickyFilter: true,
        },
        {
          id: "booking_statusText",
          nameText: "Booking Status",
          type: "text",
          allowFiltering: false,
        },
        {
          id: "property",
          nameText: "Property ID",
          type: "text",
        },
        {
          id: "propertyText",
          nameText: "Property Name",
          type: "text",
        },
      ],
      onGroupByChange: (value) => {
        console.log("group by", value);
      },
      allowUserSettings: true,
      filtersListArr: filtersListArr,
      // defaultViewConfig:{
      //   json:{
      //     cardSettings:{
      //       tooltipBackgroundColor:"green",
      //       tooltipFontColor:"red",
      //       showMouseOverFields:true
      //     },
      //     groupSettings:{
      //       headerColor:"dodgerblue",
      //     }
      //   }
      // }
    };
    useEffect(() => {
      fetchData();
    }, []);
    return (
      <div>
        {filterSearchBtn}
        <FormRow cols={4}>
          {stickyFilterContent?.map((item) => item?.element)}
        </FormRow>
        <Kanban
          configurationId={"simpleKanbanDemo"}
          moduleName={"KanbanDemoForGc"}
          columns={columns}
          data={data}
          handleDragEnd={handleDragEnd}
          userSettings={userSettings}
          onClick={(cardData) => {
            console.log("Click", { cardData });
          }}
          // onHover={(cardData) => {
          //   console.log("Hover", cardData);
          // }}
          HeaderSourceTo={(content) => {
            console.log({ content });
          }}
          StickyFilterSourceTo={(content, btn) => {
            setStickyFilterContent(content);
            setFilterSearchBtn(btn);
          }}
          // groupSpacing={20}
          // groupBackgroundColor={"lightgrey"}
          loading={loading}
        />
      </div>
    );
};

export default RoomsAndBuildings;
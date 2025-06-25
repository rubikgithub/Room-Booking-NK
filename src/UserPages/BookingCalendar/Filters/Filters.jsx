// import { useEffect, useState } from "react";
// import { Button, Icon, Tooltip, Drawer, FormRow, Input, FormControl, Select, Flex, Switch, Collapse, Alert } from "unygc";
// import FilterField from "./FilterField";
// import FilterManager from "./FilterManager";

// const ChartFilters = ({ filterDrawer, setFilterDrawer, tableId, columns, applyFilters, onClose, dev, drawerData, setDrawerData }) => {
//     const [searchText, setSearchText] = useState("");

//     const filterOptionsForServerDefault = {
//         text: "contains",
//         singleSelect: "anyof",
//         datepicker: "on",
//         number: "contains",
//         multiSelect: "anyof",
//         currency: "any",
//     };
//     const filterOptionsForServer = {
//         text: [
//             { value: "any", label: "Any" },
//             { value: "is", label: "Is" },
//             { value: "isempty", label: "Is Empty" },
//             { value: "isnot", label: "Is Not" },
//             { value: "startswith", label: "Starts With" },
//             { value: "contains", label: "Contains" },
//             { value: "doesnotstartwith", label: "Does Not Start With" },
//             { value: "doesnotcontain", label: "Does Not Contain" },
//             { value: "isnotempty", label: "Is Not Empty" },
//         ],
//         singleSelect: [
//             { value: "anyof", label: "Any of" },
//             { value: "noneof", label: "None of" },
//         ],
//         datepicker: [
//             { value: "on", label: "On" },
//             { value: "noton", label: "Not on" },
//             { value: "after", label: "After" },
//             { value: "onorafter", label: "On or After" },
//             { value: "before", label: "Before" },
//             { value: "onorbefore", label: "On or Before" },
//             { value: "within", label: "Within" },
//             { value: "notbefore", label: "Not Before" },
//             { value: "notafter", label: "Not After" },
//             { value: "notonorbefore", label: "Not On or Before" },
//             { value: "notonorafter", label: "Not On or After" },
//             { value: "notwithin", label: "Not Within" },
//         ],
//         number: [
//             { value: "contains", label: "Contains" },
//             { value: "any", label: "Any" },
//             { value: "is", label: "Is" },
//             { value: "isempty", label: "Is Empty" },
//             { value: "isnot", label: "Is Not" },
//             { value: "startswith", label: "Starts With" },
//             { value: "doesnotstartwith", label: "Does Not Start With" },
//             { value: "doesnotcontain", label: "Does Not Contain" },
//             { value: "isnotempty", label: "Is Not Empty" },
//         ],
//         multiSelect: [
//             { value: "anyof", label: "Any of" },
//             { value: "noneof", label: "None of" },
//             { value: "isempty", label: "Is Empty" },
//             { value: "isnotempty", label: "Is Not Empty" },
//         ],
//         currency: [
//             { value: "any", label: "Any" },
//             { value: "is", label: "Is" },
//             { value: "isempty", label: "Is Empty" },
//             { value: "isnot", label: "Is Not" },
//             { value: "startswith", label: "Starts With" },
//             { value: "contains", label: "Contains" },
//             { value: "doesnotstartwith", label: "Does Not Start With" },
//             { value: "doesnotcontain", label: "Does Not Contain" },
//             { value: "isnotempty", label: "Is Not Empty" },
//         ],
//     };

//     const handleSearch = (value) => {
//         // alert("Search text: " + value);
//         // alert("Search text: " + e.target.value);
//         setSearchText(value);
//     };

//     const filteredFixedColumns = columns?.filter(col =>
//         col.filter?.enable &&
//         col.filter?.fixed &&
//         (searchText === "" || col.headerName?.toLowerCase().includes(searchText.toLowerCase()))
//     ).sort((a, b) => (a?.filter?.order ?? 999) - (b?.filter?.order ?? 999));




//     const filteredOnDemandColumns = columns?.filter(col =>
//         col.filter?.enable &&
//         !col.filter?.fixed &&
//         (searchText === "" || col.headerName?.toLowerCase().includes(searchText.toLowerCase()))
//     ).sort((a, b) => (a?.filter?.order ?? 999) - (b?.filter?.order ?? 999));


//     let defaultFilters = FilterManager.getAll(tableId) ?? {};

//     filteredFixedColumns?.map((col) => {

//         if (!defaultFilters[col.field]) {
//             defaultFilters[col.field] = {};
//         }
//         if (!defaultFilters[col.field].c) {
//             defaultFilters[col.field].c = filterOptionsForServerDefault[col.type];
//         }
//     });
//     filteredOnDemandColumns?.map((col) => {
//         if (!defaultFilters[col.field]) {
//             defaultFilters[col.field] = {};
//         }
//         if (!defaultFilters[col.field].c) {
//             defaultFilters[col.field].c = filterOptionsForServerDefault[col.type];
//         }
//     });
//     const [FilterValues, setFilterValues] = useState(defaultFilters);

//     // useEffect(() => {    
//     //     // FilterManager.init(tableId, FilterValues);
//     // }, [FilterValues]);

//     const InapplyFilters = () => {
//         FilterManager.init(tableId, FilterValues);
//         applyFilters(FilterValues);
//     }
//     const [ShowOptions, setShowOptions] = useState(true);
//     return (
//         <>
//             {/* <div className="uny-grid-action-btn">
//                 <Tooltip title="Filters">
//                     <Button
//                         id={`${tableId}-filter-btn`}
//                         shape="circle"
//                         className="filterBtn"
//                         onClick={() => {
//                             setFilterValues(FilterManager.getAll(tableId));
//                             setFilterDrawer(true);
//                         }}
//                     >
//                         <Icon type="filter" />
//                     </Button>
//                 </Tooltip>
//             </div> */}

//             {
//                 filterDrawer && (





//                     <Drawer
//                         title={`Filter For : ${!drawerData?.parentType ? drawerData?.title || "" : drawerData?.uiSettings?.tileName || drawerData?.tileName || drawerData?.title || ""}`}
//                         onClose={() => {
//                             setFilterDrawer(false);
//                         }}
//                         isOpen={true}
//                         defaultWidth="800px"
//                         styles={{
//                             body: {
//                                 paddingBottom: 50,
//                             },
//                             drawerStyle: {
//                                 width: "800px",
//                             },
//                         }}
//                         key="1"
//                         placement="right"
//                         footer={
//                             <>
//                                 <Button type={"primary"} onClick={
//                                     () => {
//                                         InapplyFilters();
//                                         // setFilterDrawer(false);
//                                     }
//                                 }>Apply</Button>


//                                 <Button onClick={
//                                     () => {
//                                         FilterManager.reset(tableId);
//                                         setFilterValues({});

//                                         InapplyFilters();
//                                         // alert("Reset filters");
//                                         // FilterManager.reset(tableId);
//                                     }
//                                 }>Reset</Button>




//                             </>
//                         }
//                         resizable={false}
//                         mask={false}
//                     >

//                         {/* <pre>{JSON.stringify(columns, null, 2)}</pre> */}

//                         <div className="sidebarTabs">
//                             <Collapse
//                                 items={[
//                                     {
//                                         key: "1",
//                                         label: "Fixed",
//                                         children: (
//                                             <>
//                                                 <Alert message="The filter options in the below section are the criteria applied at the server level while loading the page. User can however change the values as needed and apply filters." />


//                                             </>
//                                         )
//                                     },
//                                     {
//                                         key: "2",
//                                         label: "On Demand",
//                                         children: (
//                                             <>
//                                                 <Alert message="The filter options in the below section can be applied by the end users as needed." />
//                                                 {dev?.filterDrawerContent}
//                                                 <div className="sidebarTabs">
//                                                     {/* <Flex justify="between">

//                                                         <FormRow cols="2" fieldAlign="side">
//                                                             <FormControl label="">
//                                                                 <Input
//                                                                     placeholder="Search filters..."
//                                                                     value={searchText}
//                                                                     onChange={handleSearch}
//                                                                     prefix={<Icon type="search" />}
//                                                                     allowClear
//                                                                 />
//                                                             </FormControl>
//                                                         </FormRow>
//                                                         <Tooltip title={ShowOptions ? "Hide Filter Options" : "Show Filter Options"}>
//                                                             <Switch
//                                                                 size="small"
//                                                                 checked={ShowOptions}
//                                                                 onChange={(value) => {
//                                                                     setShowOptions(value);
//                                                                 }}
//                                                             />
//                                                         </Tooltip>

//                                                     </Flex> */}



//                                                     {
//                                                         filteredFixedColumns?.map((col, index) => (
//                                                             <Flex justify="space-between" align="center" key={col.field}>
//                                                                 <FormRow cols={ShowOptions ? "3" : "2"} fieldAlign="side">
//                                                                     <FormControl label={""}>
//                                                                         <Input value={`${index + 1}.  ${col?.headerName}`} disabled={true} />
//                                                                     </FormControl>
//                                                                     {ShowOptions && (
//                                                                         <FormControl label={""}>
//                                                                             <Select
//                                                                                 defaultValue={FilterValues?.[col.field]?.c}
//                                                                                 selectOptions={filterOptionsForServer[col?.type]}
//                                                                                 onChange={(value) => {
//                                                                                     const existFilter = FilterValues?.[col.field];
//                                                                                     setFilterValues({
//                                                                                         ...FilterValues,
//                                                                                         [col.field]: {
//                                                                                             ...existFilter,
//                                                                                             c: value
//                                                                                         }
//                                                                                     });
//                                                                                 }}
//                                                                             />
//                                                                         </FormControl>
//                                                                     )}
//                                                                     <FormControl label={""}>
//                                                                         <FilterField FilterValues={FilterValues} tableId={tableId} col={col} value={FilterValues?.[col.field]?.value} onChange={(value) => {
//                                                                             // const existFilter = FilterManager.get(tableId, col.field);
//                                                                             // FilterManager.set(tableId, col.field, {
//                                                                             //     ...existFilter,
//                                                                             //     value: value    
//                                                                             // });
//                                                                             const existFilter = FilterValues?.[col.field];
//                                                                             setFilterValues({
//                                                                                 ...FilterValues,
//                                                                                 [col.field]: {
//                                                                                     ...existFilter,
//                                                                                     value: value
//                                                                                 }
//                                                                             });
//                                                                         }} />
//                                                                     </FormControl>
//                                                                 </FormRow>
//                                                                 <div style={{ width: "30px" }}>

//                                                                     {
//                                                                         FilterValues?.[col.field]?.value && (
//                                                                             <Button
//                                                                                 className={`tableFilter-removeBtn ${col?.filter?.operator ? "active" : ""
//                                                                                     }`}
//                                                                                 style={{ marginBottom: "10px", backgroundColor: "orange" }}
//                                                                                 size="small"
//                                                                                 shape="circle"
//                                                                                 icon={<Icon type={"cross"} />}
//                                                                                 onClick={() => {
//                                                                                     const existFilter = FilterValues?.[col.field];
//                                                                                     setFilterValues({
//                                                                                         ...FilterValues,
//                                                                                         [col.field]: {
//                                                                                             ...existFilter,
//                                                                                             value: null
//                                                                                         }
//                                                                                     });
//                                                                                     // Apply filters immediately after clearing
//                                                                                     // setTimeout(() => {
//                                                                                     //     InapplyFilters();
//                                                                                     // }, 0);
//                                                                                 }}
//                                                                             />
//                                                                         )
//                                                                     }
//                                                                 </div>
//                                                             </Flex>
//                                                         ))
//                                                     }

//                                                     {
//                                                         filteredOnDemandColumns?.filter((col) => col.headerName?.toLowerCase().includes(searchText.toLowerCase()))?.map((col, index) => (
//                                                             <Flex justify="space-between" align="center" key={col.field}>
//                                                                 <FormRow cols={ShowOptions ? "3" : "2"} fieldAlign="side">
//                                                                     <FormControl label={""}>
//                                                                         <Input value={`${filteredFixedColumns?.length + index + 1}.  ${col?.headerName}`} disabled={true} />
//                                                                     </FormControl>
//                                                                     {ShowOptions && (
//                                                                         <FormControl label={""}>
//                                                                             <Select
//                                                                                 defaultValue={FilterValues?.[col.field]?.c}
//                                                                                 selectOptions={filterOptionsForServer[col?.type]}
//                                                                                 onChange={(value) => {
//                                                                                     const existFilter = FilterValues?.[col.field];
//                                                                                     setFilterValues({
//                                                                                         ...FilterValues,
//                                                                                         [col.field]: {
//                                                                                             ...existFilter,
//                                                                                             c: value
//                                                                                         }
//                                                                                     });
//                                                                                 }}
//                                                                             />
//                                                                         </FormControl>
//                                                                     )}
//                                                                     <FormControl label={""}>
//                                                                         <Select
//                                                                             defaultValue={FilterValues?.[col.field]?.c}
//                                                                             selectOptions={filterOptionsForServer[col?.type]}
//                                                                             onChange={(value) => {
//                                                                                 // const existFilter = FilterManager.get(tableId, col.field);
//                                                                                 // FilterManager.set(tableId, col.field, {
//                                                                                 //     ...existFilter,
//                                                                                 //     c: value
//                                                                                 // });
//                                                                                 const existFilter = FilterValues?.[col.field];
//                                                                                 setFilterValues({
//                                                                                     ...FilterValues,
//                                                                                     [col.field]: {
//                                                                                         ...existFilter,
//                                                                                         c: value
//                                                                                     }
//                                                                                 });
//                                                                             }}
//                                                                         />
//                                                                     </FormControl>
//                                                                     <FormControl label={""}>
//                                                                         <FilterField FilterValues={FilterValues} tableId={tableId} col={col} value={FilterValues?.[col.field]?.value} onChange={(value) => {
//                                                                             // const existFilter = FilterManager.get(tableId, col.field);
//                                                                             // FilterManager.set(tableId, col.field, {
//                                                                             //     ...existFilter,
//                                                                             //     value: value
//                                                                             // });
//                                                                             const existFilter = FilterValues?.[col.field];
//                                                                             setFilterValues({
//                                                                                 ...FilterValues,
//                                                                                 [col.field]: {
//                                                                                     ...existFilter,
//                                                                                     value: value
//                                                                                 }
//                                                                             });
//                                                                         }} />
//                                                                     </FormControl>
//                                                                 </FormRow>


//                                                                 <div style={{ width: "30px" }}>
//                                                                     {
//                                                                         FilterValues?.[col.field]?.value && (
//                                                                             <Button
//                                                                                 className={`tableFilter-removeBtn ${col?.filter?.operator ? "active" : ""
//                                                                                     }`}
//                                                                                 style={{ marginBottom: "10px", backgroundColor: "orange" }}
//                                                                                 size="small"
//                                                                                 shape="circle"
//                                                                                 icon={<Icon type={"cross"} />}
//                                                                                 onClick={() => {
//                                                                                     const existFilter = FilterValues?.[col.field];
//                                                                                     setFilterValues({
//                                                                                         ...FilterValues,
//                                                                                         [col.field]: {
//                                                                                             ...existFilter,
//                                                                                             value: null
//                                                                                         }
//                                                                                     });
//                                                                                     // Apply filters immediately after clearing
//                                                                                     // setTimeout(() => {
//                                                                                     //     InapplyFilters();
//                                                                                     // }, 0);
//                                                                                 }}
//                                                                             />
//                                                                         )
//                                                                     }
//                                                                 </div>


//                                                             </Flex>
//                                                         ))
//                                                     }
//                                                 </div>
//                                             </>
//                                         )
//                                     }
//                                 ]}
//                             />
//                         </div>
//                         {/* <pre>{JSON.stringify(FilterManager.getAll(tableId), null, 2)}</pre> */}
//                     </Drawer>
//                 )
//             }
//         </>
//     )
// }

// export default ChartFilters;

import { useEffect, useState } from "react";
import { Button, Icon, Tooltip, Drawer, FormRow, Input, FormControl, Select, Flex, Switch, Collapse, Alert } from "unygc";
import FilterField from "./FilterField";
import FilterManager from "./FilterManager";

const ChartFilters = ({ filterDrawer, setFilterDrawer, tableId, columns, applyFilters, onClose, dev, drawerData, setDrawerData }) => {
    const [searchText, setSearchText] = useState("");
    const [ShowOptions, setShowOptions] = useState(true);

    // Default filter conditions for each column type
    const filterOptionsForServerDefault = {
        text: "contains",
        singleSelect: "anyof",
        datepicker: "on",
        number: "contains",
        multiSelect: "anyof",
        currency: "any",
        default: "any", // Fallback for unknown types
    };

    // Filter options for the Select component
    const filterOptionsForServer = {
        text: [
            { value: "any", label: "Any" },
            { value: "is", label: "Is" },
            { value: "isempty", label: "Is Empty" },
            { value: "isnot", label: "Is Not" },
            { value: "startswith", label: "Starts With" },
            { value: "contains", label: "Contains" },
            { value: "doesnotstartwith", label: "Does Not Start With" },
            { value: "doesnotcontain", label: "Does Not Contain" },
            { value: "isnotempty", label: "Is Not Empty" },
        ],
        singleSelect: [
            { value: "anyof", label: "Any of" },
            { value: "noneof", label: "None of" },
        ],
        datepicker: [
            { value: "on", label: "On" },
            { value: "noton", label: "Not on" },
            { value: "after", label: "After" },
            { value: "onorafter", label: "On or After" },
            { value: "before", label: "Before" },
            { value: "onorbefore", label: "On or Before" },
            { value: "within", label: "Within" },
            { value: "notbefore", label: "Not Before" },
            { value: "notafter", label: "Not After" },
            { value: "notonorbefore", label: "Not On or Before" },
            { value: "notonorafter", label: "Not On or After" },
            { value: "notwithin", label: "Not Within" },
        ],
        number: [
            { value: "contains", label: "Contains" },
            { value: "any", label: "Any" },
            { value: "is", label: "Is" },
            { value: "isempty", label: "Is Empty" },
            { value: "isnot", label: "Is Not" },
            { value: "startswith", label: "Starts With" },
            { value: "doesnotstartwith", label: "Does Not Start With" },
            { value: "doesnotcontain", label: "Does Not Contain" },
            { value: "isnotempty", label: "Is Not Empty" },
        ],
        multiSelect: [
            { value: "anyof", label: "Any of" },
            { value: "noneof", label: "None of" },
            { value: "isempty", label: "Is Empty" },
            { value: "isnotempty", label: "Is Not Empty" },
        ],
        currency: [
            { value: "any", label: "Any" },
            { value: "is", label: "Is" },
            { value: "isempty", label: "Is Empty" },
            { value: "isnot", label: "Is Not" },
            { value: "startswith", label: "Starts With" },
            { value: "contains", label: "Contains" },
            { value: "doesnotstartwith", label: "Does Not Start With" },
            { value: "doesnotcontain", label: "Does Not Contain" },
            { value: "isnotempty", label: "Is Not Empty" },
        ],
        default: [
            { value: "any", label: "Any" },
            { value: "is", label: "Is" },
            { value: "isnot", label: "Is Not" },
        ],
    };

    // Handle search input
    const handleSearch = (value) => {
        setSearchText(value);
    };

    // Filter columns based on search and active filters
    const filteredFixedColumns = columns?.filter(
        (col) =>
            col.filter?.enable &&
            col.filter?.fixed &&
            (searchText === "" || col.headerName?.toLowerCase().includes(searchText.toLowerCase()) || FilterValues?.[col.field]?.value)
    ).sort((a, b) => (a?.filter?.order ?? 999) - (b?.filter?.order ?? 999));

    const filteredOnDemandColumns = columns?.filter(
        (col) =>
            col.filter?.enable &&
            !col.filter?.fixed &&
            (searchText === "" || col.headerName?.toLowerCase().includes(searchText.toLowerCase()) || FilterValues?.[col.field]?.value)
    ).sort((a, b) => (a?.filter?.order ?? 999) - (b?.filter?.order ?? 999));

    // Initialize default filters from FilterManager
    let defaultFilters = FilterManager.getAll(tableId) ?? {};

    // Set default conditions for columns
    filteredFixedColumns?.forEach((col) => {
        if (!defaultFilters[col.field]) {
            defaultFilters[col.field] = {};
        }
        if (!defaultFilters[col.field].c) {
            if (!filterOptionsForServerDefault[col.type]) {
                console.warn(`Unknown column type '${col.type}' for field '${col.field}'. Using default filter condition.`);
            }
            defaultFilters[col.field].c = filterOptionsForServerDefault[col.type] || filterOptionsForServerDefault.default;
        }
    });

    filteredOnDemandColumns?.forEach((col) => {
        if (!defaultFilters[col.field]) {
            defaultFilters[col.field] = {};
        }
        if (!defaultFilters[col.field].c) {
            if (!filterOptionsForServerDefault[col.type]) {
                console.warn(`Unknown column type '${col.type}' for field '${col.field}'. Using default filter condition.`);
            }
            defaultFilters[col.field].c = filterOptionsForServerDefault[col.type] || filterOptionsForServerDefault.default;
        }
    });

    const [FilterValues, setFilterValues] = useState(defaultFilters);

    // Sync FilterValues with FilterManager
    useEffect(() => {
        FilterManager.init(tableId, FilterValues);
    }, [tableId, FilterValues]);

    // Apply filters and update FilterManager
    const InapplyFilters = () => {
        FilterManager.init(tableId, FilterValues);
        applyFilters(FilterValues);
    };

    return (
        <>
            {filterDrawer && (
                <Drawer
                    title={`Filter For : ${!drawerData?.parentType ? drawerData?.title || "" : drawerData?.uiSettings?.tileName || drawerData?.tileName || drawerData?.title || ""}`}
                    onClose={() => {
                        setFilterDrawer(false);
                        if (onClose) onClose();
                    }}
                    isOpen={true}
                    defaultWidth="800px"
                    styles={{
                        body: {
                            paddingBottom: 50,
                        },
                        drawerStyle: {
                            width: "800px",
                        },
                    }}
                    key="1"
                    placement="right"
                    footer={
                        <>
                            <Button
                                type="primary"
                                onClick={() => {
                                    InapplyFilters();
                                }}
                            >
                                Apply
                            </Button>
                            <Button
                                onClick={() => {
                                    FilterManager.reset(tableId);
                                    setFilterValues({});
                                    InapplyFilters();
                                }}
                            >
                                Reset
                            </Button>
                        </>
                    }
                    resizable={false}
                    mask={false}
                >
                    <div className="sidebarTabs">
                        {/* <Flex justify="between" style={{ marginBottom: "16px" }}>
                            <FormRow cols="2" fieldAlign="side">
                                <FormControl label="">
                                    <Input
                                        placeholder="Search filters..."
                                        value={searchText}
                                        onChange={handleSearch}
                                        prefix={<Icon type="search" />} 
                                        allowClear
                                    />
                                </FormControl>
                            </FormRow>
                            <Tooltip title={ShowOptions ? "Hide Filter Options" : "Show Filter Options"}>
                                <Switch
                                    size="small"
                                    checked={ShowOptions}
                                    onChange={(value) => {
                                        setShowOptions(value);
                                    }}
                                />
                            </Tooltip>
                        </Flex> */}
                        <Collapse
                            items={[
                                {
                                    key: "1",
                                    label: "Fixed",
                                    children: (
                                        <>
                                            <Alert message="The filter options in the below section are the criteria applied at the server level while loading the page. Users can change the values as needed and apply filters." />
                                            {filteredFixedColumns?.map((col, index) => (
                                                <Flex justify="space-between" align="center" key={col.field} style={{ marginTop: "8px" }}>
                                                    <FormRow cols={ShowOptions ? "3" : "2"} fieldAlign="side">
                                                        <FormControl label="">
                                                            <Input value={`${index + 1}. ${col?.headerName}`} disabled={true} />
                                                        </FormControl>
                                                        {ShowOptions && (
                                                            <FormControl label="">
                                                                <Select
                                                                    value={FilterValues?.[col.field]?.c || filterOptionsForServerDefault[col.type] || filterOptionsForServerDefault.default}
                                                                    selectOptions={filterOptionsForServer[col?.type] || filterOptionsForServer.default}
                                                                    onChange={(value) => {
                                                                        const existFilter = FilterValues?.[col.field] || {};
                                                                        setFilterValues({
                                                                            ...FilterValues,
                                                                            [col.field]: {
                                                                                ...existFilter,
                                                                                c: value,
                                                                            },
                                                                        });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                        <FormControl label="">
                                                            <FilterField
                                                                FilterValues={FilterValues}
                                                                tableId={tableId}
                                                                col={col}
                                                                value={FilterValues?.[col.field]?.value}
                                                                onChange={(value) => {
                                                                    const existFilter = FilterValues?.[col.field] || {};
                                                                    setFilterValues({
                                                                        ...FilterValues,
                                                                        [col.field]: {
                                                                            ...existFilter,
                                                                            value: value,
                                                                        },
                                                                    });
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormRow>
                                                    <div style={{ width: "30px" }}>
                                                        {FilterValues?.[col.field]?.value && (
                                                            <Button
                                                                className={`tableFilter-removeBtn ${col?.filter?.operator ? "active" : ""}`}
                                                                style={{ marginBottom: "10px", backgroundColor: "orange" }}
                                                                size="small"
                                                                shape="circle"
                                                                icon={<Icon type="cross" />}
                                                                onClick={() => {
                                                                    const existFilter = FilterValues?.[col.field] || {};
                                                                    setFilterValues({
                                                                        ...FilterValues,
                                                                        [col.field]: {
                                                                            ...existFilter,
                                                                            value: null,
                                                                        },
                                                                    });
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </Flex>
                                            ))}
                                        </>
                                    ),
                                },
                                {
                                    key: "2",
                                    label: "On Demand",
                                    children: (
                                        <>
                                            <Alert message="The filter options in the below section can be applied by the end users as needed." />
                                            {dev?.filterDrawerContent}
                                            <div className="sidebarTabs">
                                                {filteredOnDemandColumns?.map((col, index) => (
                                                    <Flex justify="space-between" align="center" key={col.field} style={{ marginTop: "8px" }}>
                                                        <FormRow cols={ShowOptions ? "3" : "2"} fieldAlign="side">
                                                            <FormControl label="">
                                                                <Input value={`${filteredFixedColumns?.length + index + 1}. ${col?.headerName}`} disabled={true} />
                                                            </FormControl>
                                                            {ShowOptions && (
                                                                <FormControl label="">
                                                                    <Select
                                                                        value={FilterValues?.[col.field]?.c || filterOptionsForServerDefault[col.type] || filterOptionsForServerDefault.default}
                                                                        selectOptions={filterOptionsForServer[col?.type] || filterOptionsForServer.default}
                                                                        onChange={(value) => {
                                                                            const existFilter = FilterValues?.[col.field] || {};
                                                                            setFilterValues({
                                                                                ...FilterValues,
                                                                                [col.field]: {
                                                                                    ...existFilter,
                                                                                    c: value,
                                                                                },
                                                                            });
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            )}
                                                            <FormControl label="">
                                                                <FilterField
                                                                    FilterValues={FilterValues}
                                                                    tableId={tableId}
                                                                    col={col}
                                                                    value={FilterValues?.[col.field]?.value}
                                                                    onChange={(value) => {
                                                                        const existFilter = FilterValues?.[col.field] || {};
                                                                        setFilterValues({
                                                                            ...FilterValues,
                                                                            [col.field]: {
                                                                                ...existFilter,
                                                                                value: value,
                                                                            },
                                                                        });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </FormRow>
                                                        <div style={{ width: "30px" }}>
                                                            {FilterValues?.[col.field]?.value && (
                                                                <Button
                                                                    className={`tableFilter-removeBtn ${col?.filter?.operator ? "active" : ""}`}
                                                                    style={{ marginBottom: "10px", backgroundColor: "orange" }}
                                                                    size="small"
                                                                    shape="circle"
                                                                    icon={<Icon type="cross" />}
                                                                    onClick={() => {
                                                                        const existFilter = FilterValues?.[col.field] || {};
                                                                        setFilterValues({
                                                                            ...FilterValues,
                                                                            [col.field]: {
                                                                                ...existFilter,
                                                                                value: null,
                                                                            },
                                                                        });
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </Flex>
                                                ))}
                                            </div>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </Drawer>
            )}
        </>
    );
};

export default ChartFilters;
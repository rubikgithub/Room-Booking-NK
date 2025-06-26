// 

import { useEffect, useState } from "react";
import { Configuration, DatePicker, Input, Rangepicker, Select } from "unygc";

const FilterField = ({tableId, col, value, onChange, FilterValues, ...props}) => {
    const [Options, setOptions] = useState([]);
    const [StateVal, setStateVal] = useState();
    
    useEffect(() => {
        console.log(col.headerName+"::value", value);
        setStateVal(value);
    }, [value]);
    
    // Handle dependent filters
    if(col?.dependent && Array.isArray(col?.dependent)){
        const [PrevFilters, setPrevFilters] = useState({});
        
        useEffect(() => {            
            console.log("col?.dependent s", col?.dependent);
            
            const newFilters = FilterValues;

            for(var x = 0; x < col?.dependent?.length; x++){
                var colid = col?.dependent[x];
                if(newFilters[colid]?.value != PrevFilters[colid]?.value){
                    loadOptions();
                }
            }
            setPrevFilters(FilterValues);
        }, [FilterValues]);
    }

    const loadOptions = () => {
        if(col?.type === "singleSelect" || col?.type === "multiSelect"){
            // First check if we have static options
            if(col?.staticOptions && Array.isArray(col.staticOptions)){
                setOptions(col.staticOptions);
            }
            // Then check for dynamic options function
            else if(col?.options && typeof col.options === 'function'){
                col?.options(FilterValues, (records) => {
                    setOptions(records);
                });
            }
            // Fallback for listId (if Configuration is available)
            else if(col?.listId){
                // Configuration?.appsetup?.simpleOptions(col?.listId, null, (records)=>{
                //     setOptions(records);
                // });
                
                // For now, we'll use a simple fallback
                setOptions([]);
            }
            else {
                // Default empty options
                setOptions([]);
            }
        }
    }
    
    useEffect(() => {
        loadOptions();
    }, [col, FilterValues]);

    switch(col?.type) {
        case "text":
        case "number":
            return (
                <Input 
                    onBlur={(e) => onChange(e.target.value)} 
                    {...props} 
                    value={StateVal} 
                    type={col?.type} 
                    placeholder={`Filter by ${col.headerName.toLowerCase()}...`}
                />
            );
            
        case "singleSelect":
        case "multiSelect":
            return (
                <Select
                    {...(col?.filter?.multiple ? {multiple: true} : {})}
                    defaultValue={StateVal}
                    selectOptions={Options}
                    onChange={(value) => {
                        onChange(value);
                    }}
                    listId={col?.listId}
                    placeholder={`Select ${col.headerName.toLowerCase()}...`}
                    allowClear={true}
                />
            );
            
        case "datepicker":
            return col?.filter?.operator !== "between" ? (
                <DatePicker
                    onChange={(value) => {
                        onChange(value);
                    }}
                    defaultValue={StateVal}
                    placeholder="Select date..."
                    allowClear={true}
                />
            ) : (
                <Rangepicker
                    onChange={(val) => onChange(val)}
                    allowClear={true}
                    defaultDateRange={
                        Array.isArray(StateVal) ? StateVal : []
                    }
                    placeholder={["Start date", "End date"]}
                />
            );
            
        default:
            return (
                <Input 
                    onBlur={(e) => onChange(e.target.value)} 
                    {...props} 
                    value={StateVal}
                    placeholder={`Filter by ${col.headerName.toLowerCase()}...`}
                />
            );
    }
}

export default FilterField;
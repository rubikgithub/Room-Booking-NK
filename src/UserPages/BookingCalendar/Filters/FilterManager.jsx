// // TableFilterManager.js
// const FilterManager = (() => {
//     const filters = {};

//     return {
//       init(tableId, defaultFilters = {}) {
//         filters[tableId] = { ...defaultFilters };
//         console.log("filters service initialized", filters[tableId]);
//         return filters[tableId];
//       },
//       set(tableId, field, valueObj) {
//         if (!filters[tableId]) filters[tableId] = {};
//         filters[tableId][field] = valueObj;
//         console.log("filters service changes", filters);
//       },
//       get(tableId, field) {
//         return filters[tableId]?.[field];
//       },
//       getAll(tableId) {
//         return filters[tableId] || {};
//       },
//       reset(tableId) {
//         filters[tableId] = {};
//       },
//       clearAll() {
//         Object.keys(filters).forEach(id => delete filters[id]);
//       }
//     };
//   })();

//   export default FilterManager;


// FilterManager.js - Table Filter Management Utility
const FilterManager = (() => {
  const filters = {};

  return {
    init(tableId, defaultFilters = {}) {
      filters[tableId] = { ...defaultFilters };
      console.log("filters service initialized", filters[tableId]);
      return filters[tableId];
    },

    set(tableId, field, valueObj) {
      if (!filters[tableId]) filters[tableId] = {};
      filters[tableId][field] = valueObj;
      console.log("filters service changes", filters);
    },

    get(tableId, field) {
      return filters[tableId]?.[field];
    },

    getAll(tableId) {
      return filters[tableId] || {};
    },

    reset(tableId) {
      filters[tableId] = {};
    },

    clearAll() {
      Object.keys(filters).forEach(id => delete filters[id]);
    }
  };
})();

export default FilterManager;
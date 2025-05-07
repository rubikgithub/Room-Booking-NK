import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { $ajax_post } from "../Library/Library";

const User = () => {
  const [data, setData] = useState([]);

  const columns = [
    {
      field: "first_name",
      headerName: "First Name",
      type: "text",
      renderCell: (params) => (
        <a
          style={{ cursor: "pointer", color: "blue" }}
          onClick={() => handleOpenDrawer(params?.row)}
        >
          {params?.value}
        </a>
      ),
    },
    { field: "last_name", headerName: "Last Name", type: "text" },
    { field: "email", headerName: "Email", type: "text" },
    { field: "address", headerName: "Address", type: "text" },
    { field: "phone_number", headerName: "Phone Number", type: "text" },
    { field: "dob", headerName: "Date of Birth", type: "date" },
    { field: "status", headerName: "Status", type: "text" },
    {
      field: "authenticate",
      headerName: "Authenticate",
      type: "text",
      renderCell: (params) => (params?.value ? "Yes" : "No"),
    },
    {
      field: "role",
      headerName: "Role",
      type: "text",
      renderCell: (params) =>
        params?.value?.toLowerCase() === "admin" ? "Admin" : "User",
    },
  ];

  const handleOpenDrawer = (row) => {
    console.log("Open drawer for", row);
    // your drawer logic here
  };

  const getUsers = async () => {
    $ajax_post("users", {}, function (response) {
      setData(response || []);
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
      <Table className="min-w-full divide-y divide-gray-200 bg-white">
        <TableHeader className="bg-gray-100">
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.field}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {col.headerName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((col) => {
                  const value = row[col.field];
                  const params = { value, row };
                  return (
                    <TableCell
                      key={col.field}
                      className="px-4 py-2 text-sm text-gray-800"
                    >
                      {col.renderCell ? col.renderCell(params) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default User;

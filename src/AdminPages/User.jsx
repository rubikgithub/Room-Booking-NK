import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { $ajax_post } from "../Library";
import UserDrawer from "./UserDrawer";

const User = () => {
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerMode, setDrawerMode] = useState("view");

  const getUsers = async () => {
    $ajax_post("users", {}, (response) => {
      setData(response || []);
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleOpenDrawer = (user = {}, mode = "view") => {
    setDrawerMode(mode);
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleCreateUser = (newUser) => {
    $ajax_post("users/create", newUser, () => {
      setDrawerOpen(false);
      getUsers();
    });
  };

  const handleEditUser = (updatedUser) => {
    $ajax_post("users/update", updatedUser, () => {
      setDrawerOpen(false);
      getUsers();
    });
  };

  const handleDeleteUser = (userId) => {
    $ajax_post("users/delete", { id: userId }, () => {
      setDrawerOpen(false);
      getUsers();
    });
  };

  const columns = [
    {
      field: "first_name",
      headerName: "First Name",
      renderCell: (params) => (
        <a
          style={{ cursor: "pointer", color: "blue" }}
          onClick={() => handleOpenDrawer(params?.row, "view")}
        >
          {params?.value}
        </a>
      ),
    },
    { field: "last_name", headerName: "Last Name" },
    { field: "email", headerName: "Email" },
    { field: "address", headerName: "Address" },
    { field: "phone_number", headerName: "Phone Number" },
    { field: "dob", headerName: "Date of Birth" },
    { field: "status", headerName: "Status" },
    {
      field: "authenticate",
      headerName: "Authenticate",
      renderCell: (params) => (params?.value ? "Yes" : "No"),
    },
    {
      field: "role",
      headerName: "Role",
      renderCell: (params) =>
        params?.value?.toLowerCase() === "admin" ? "Admin" : "User",
    },
  ];

  return (
    <div>
      <div className="flex justify-end">
        <Button
          onClick={() => handleOpenDrawer({}, "create")}
          className="mb-4 border-1 border-gray-400 cursor-pointer hover:bg-gray-50"
        >
          Add User
        </Button>
      </div>

      <div className="overflow-x-auto max-h-[80vh] rounded-lg shadow border border-gray-200">
        <Table className="min-w-full divide-y divide-gray-200 bg-white">
          <TableHeader className="bg-gray-100 ">
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

      <UserDrawer
        open={drawerOpen}
        mode={drawerMode}
        data={selectedUser}
        setDrawerMode={setDrawerMode}
        handleCreateUser={handleCreateUser}
        handleEditUser={handleEditUser}
        handleDeleteUser={handleDeleteUser}
        onClose={() => setDrawerOpen(false)}
        onRefresh={() => {
          setDrawerOpen(false);
          getUsers();
        }}
      />
    </div>
  );
};

export default User;

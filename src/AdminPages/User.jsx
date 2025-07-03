import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { $ajax_post } from "../Library";
import UserDrawer from "./UserDrawer";
import { X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const User = () => {
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerMode, setDrawerMode] = useState("view");
  const { theme } = useTheme();

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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const handleStatusClick = (user) => {
    setUserToToggle(user);
    setStatusDialogOpen(true);
  };

  // const handleStatusUpdate = () => {
  //   if (!userToToggle) return;

  //   const newStatus = userToToggle.status === "active" ? "inactive" : "active";

  //   $ajax_post("users/update-status", {
  //     id: userToToggle.id,
  //     status: newStatus
  //   }, () => {
  //     setStatusDialogOpen(false);
  //     setUserToToggle(null);
  //     getUsers(); // Refresh the data
  //   });
  // };
  const handleStatusUpdate = (newStatus) => {
    if (!userToToggle) return;

    $ajax_post(
      `updateStatus/${userToToggle.id}`,
      {
        status: newStatus,
      },
      () => {
        setStatusDialogOpen(false);
        setUserToToggle(null);
        getUsers(); // Refresh the data
      }
    );
  };
  const columns = [
    {
      field: "first_name",
      headerName: "First Name",
      renderCell: (params) => (
        <a
          style={{ cursor: "pointer", color: theme==="dark" ? "#f7b00f" : "blue" }}
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
    // { field: "status", headerName: "Status" },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params) => {
        console.log(params, "params");
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 ${
              params?.value?.toLowerCase() === "approved"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : params?.value?.toLowerCase() === "rejected"
                ? "bg-red-100 text-red-800 hover:bg-red-200"
                : "bg-yellow-100 text-red-800 hover:bg-red-200"
            }`}
            onClick={() => handleStatusClick(params?.row)}
            title="Click to toggle status"
          >
            {params?.value?.charAt(0).toUpperCase() + params?.value?.slice(1)}
          </span>
        );
      },
    },
    {
      field: "authenticate",
      headerName: "Authenticate",
      renderCell: (params) => (params?.value ? "Yes" : "No"),
    },
    { field: "department", headerName: "Department" },
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
        {/* <Button
      onClick={() => handleOpenDrawer({}, "create")}
      className="mb-4 border border-border cursor-pointer hover:bg-accent hover:text-accent-foreground"
    >
      Add User
    </Button> */}
      </div>

      <div className="overflow-x-auto max-h-[80vh] rounded-2xl shadow-md border border-border">
        <Table className="min-w-full divide-y divide-border bg-card text-sm">
          <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.field}
                  className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  {col.headerName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-secondary/30 transition-colors duration-150 group"
                >
                  {columns.map((col) => {
                    const value = row[col.field];
                    const params = { value, row };
                    return (
                      <TableCell
                        key={col.field}
                        className="px-3 py-3 whitespace-nowrap text-foreground group-hover:text-primary transition-colors duration-200"
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
                  className="px-4 py-10 text-center text-muted-foreground"
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

      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent className="bg-card border border-border relative fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-lg w-full mx-4">
          {/* Cross Icon Button */}
          <button
            onClick={() => setStatusDialogOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>

          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">
              Change User Status
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Select the new status for user{" "}
              <strong className="text-card-foreground">
                {userToToggle?.first_name} {userToToggle?.last_name}
              </strong>
              :
              <br />
              Current status:{" "}
              <span className="font-medium text-card-foreground">
                {userToToggle?.status}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-wrap gap-2 w-full">
              {userToToggle?.status != "Approved" && (
                <Button
                  onClick={() => handleStatusUpdate("Approved")}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[100px] dark:bg-green-700 dark:hover:bg-green-800"
                  disabled={userToToggle?.status === "approved"}
                >
                  Approve
                </Button>
              )}
              <Button
                onClick={() => handleStatusUpdate("Rejected")}
                className="bg-red-600 hover:bg-red-700 text-white flex-1 min-w-[100px] dark:bg-red-700 dark:hover:bg-red-800"
                disabled={userToToggle?.status === "rejected"}
              >
                {userToToggle?.status === "Approved" ? "Inactive" : "Reject"}
              </Button>
              {/* <Button
            onClick={() => handleStatusUpdate("pending")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex-1 min-w-[100px] dark:bg-yellow-700 dark:hover:bg-yellow-800"
            disabled={userToToggle?.status === "pending"}
          >
            Pending
          </Button> */}
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default User;

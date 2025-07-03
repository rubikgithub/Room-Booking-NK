import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { $ajax_post } from "../../Library";
import { useTheme } from "@/components/theme-provider";

const AllBookings = () => {
  const [allBookings, setBookings] = useState([]);
  const { theme } = useTheme();

  const handleOpenDrawer = (row) => {
    // Add your drawer opening logic here
    console.log("Opening drawer for:", row);
  };

  const columns = [
    {
      field: "title",
      headerName: "Booking Title",
      type: "text",
      renderCell: (params) => {
        return (
          <a
            style={{
              cursor: "pointer",
              color: theme === "dark" ? "#f7b00f" : "blue",
            }}
            onClick={() => handleOpenDrawer(params?.row)}
          >
            {params?.value}
          </a>
        );
      },
    },
    {
      field: "room_name",
      headerName: "Room",
      type: "text",
      renderCell: (params) => {
        return <span>{params?.row?.rooms?.name}</span>;
      },
    },
    {
      field: "building_name",
      headerName: "Building",
      type: "text",
      renderCell: (params) => {
        return <span>{params?.row?.rooms?.buildings?.name}</span>;
      },
    },
    {
      field: "user_name",
      headerName: "User Name",
      type: "text",
      renderCell: (params) => {
        return (
          <span>
            {params?.row?.user?.first_name} {params?.row?.user?.last_name}
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      type: "text",
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
            params?.value?.toLowerCase() === "confirmed" ||
            params?.value?.toLowerCase() === "approved"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : params?.value?.toLowerCase() === "cancelled" ||
                params?.value?.toLowerCase() === "rejected"
              ? "bg-red-100 text-red-800 hover:bg-red-200"
              : params?.value?.toLowerCase() === "pending"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          {params?.value?.charAt(0).toUpperCase() + params?.value?.slice(1)}
        </span>
      ),
    },
    {
      field: "date",
      headerName: "Booking Date",
      type: "date",
      renderCell: (params) => {
        const date = new Date(params?.value);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      field: "created_at",
      headerName: "Booking On",
      type: "date",
      renderCell: (params) => {
        const date = new Date(params?.value);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      field: "start_time",
      headerName: "Start Time",
      type: "text",
      renderCell: (params) => (
        <span className="font-mono text-sm">{params?.value}</span>
      ),
    },
    {
      field: "end_time",
      headerName: "End Time",
      type: "text",
      renderCell: (params) => (
        <span className="font-mono text-sm">{params?.value}</span>
      ),
    },
  ];

  const getAllBookings = () => {
    $ajax_post("allBookings", {}, function (response) {
      console.log(response, "bookings");
      setBookings(response || []);
    });
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  return (
    <>
      <div>
        <div className="overflow-x-auto max-h-[80vh] rounded-2xl shadow-md border border-border">
          <Table className="min-w-full divide-y divide-border bg-card text-sm">
            <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.field}
                    className="px-2 py-2 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    {col.headerName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border">
              {allBookings.length > 0 ? (
                allBookings.map((row, rowIndex) => (
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
                          className="px-2 py-2 whitespace-nowrap text-foreground group-hover:text-primary transition-colors duration-200"
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
      </div>
    </>
  );
};

export default AllBookings;

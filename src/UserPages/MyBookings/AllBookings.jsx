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
const AllBookings = () => {
  const [allBookings, setBookings] = useState([]);

  const columns = [
    {
      field: "title",
      headerName: "Booking Title",
      type: "text",
      renderCell: (params) => {
        return (
          <a style={{ cursor: "pointer", color: "blue" }} onClick={() => handleOpenDrawer(params?.row)}>{params?.value}</a>
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
        return <span>{params?.row?.user?.first_name} {params?.row?.user?.last_name}</span>;
      },
    },
    {
      field: "status",
      headerName: "Status",
      type: "text",
      // renderCell: (params) => (
      //   <span>{statusText[params.value] || params.value}</span>
      // ),
    },
    {
      field: "date",
      headerName: "Booking Date",
      type: "date",
    },
    {
      field: "created_at",
      headerName: "Booking On",
      type: "date",
    },
    {
      field: "start_time",
      headerName: "Start Time",
      type: "text",
    },
    {
      field: "end_time",
      headerName: "End Time",
      type: "text",
    },
  ];

  const getAllBookings = () => {

    $ajax_post("allBookings", {}, function (response) {
      console.log(response, 'bookings');
      setBookings(response || []);
    });
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  return (
    <>
      <div>
        <Table className="w-full mt-2 shadow-sm border border-gray-200 rounded-md p-2">
          <TableHeader>
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
            {allBookings.length > 0 ? (
              allBookings.map((row, rowIndex) => (
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
    </>
  )
}

export default AllBookings
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

const Rooms = () => {
  const [data, setData] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleOpenDrawer = (row) => {
    console.log("Open drawer for", row);
    // implement drawer logic here
  };

  const openModalWithImages = (images) => {
    console.log("Open modal with images:", images);
    // implement modal logic here
  };

  const [columns] = useState([
    {
      field: "building_name",
      headerName: "Building Name",
      type: "text",
    },
    {
      field: "name",
      headerName: "Name",
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
    {
      field: "type",
      headerName: "Type",
      type: "text",
    },
    {
      field: "capacity",
      headerName: "Capacity",
      type: "number",
    },
    {
      field: "description",
      headerName: "Description",
      type: "text",
    },
    {
      field: "area",
      headerName: "Area (sq ft)",
      type: "number",
    },
    {
      field: "features",
      headerName: "Additional Features",
      type: "text",
    },
    {
      field: "status",
      headerName: "Status",
      type: "text",
    },
    {
      field: "image",
      headerName: "Image",
      type: "image",
      renderCell: (params) => {
        const images = Array.isArray(params?.value)
          ? params.value
          : JSON.parse(params?.value || "[]");

        return (
          <div style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img.path}
                alt={img.originalName || "room image"}
                style={{ width: "30px", height: "30px", borderRadius: "4px" }}
                onClick={() => {
                  setCurrentImageIndex(index);
                  openModalWithImages(images);
                }}
              />
            ))}
          </div>
        );
      },
    },
  ]);

  const getRooms = async () => {
    $ajax_post("rooms", {}, function (response) {
      setData(response || []);
    });
  };

  useEffect(() => {
    getRooms();
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

export default Rooms;

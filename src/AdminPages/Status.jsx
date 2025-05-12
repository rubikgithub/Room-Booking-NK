import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { $ajax_post } from "../Library";
import { ColorPicker, Notification } from "unygc";

const Status = () => {
  const [data, setData] = useState([]);

  const getStatusList = async () => {
    try {
      $ajax_post(`statusColors`, {}, function (response) {
        setData(response);
      });
    } catch (error) {
      console.error("Error fetching status", error);
    }
  };

  useEffect(() => {
    getStatusList();
  }, []);

  const handleColorChange = async (id, newColor) => {
    try {
      const bodyData = { id, color: newColor };
      $ajax_post(`update-status-color`, { ...bodyData }, function () {
        Notification.open(
          "success",
          "Success",
          "Status updated successfully",
          3000,
          "bottom-right"
        );
        getStatusList();
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const columns = [
    {
      field: "status",
      headerName: "Status",
      type: "text",
    },
    {
      field: "indicator",
      headerName: "Indicator",
      type: "text",
      renderCell: (params) => (
        <ColorPicker
          value={params.row.color}
          onChange={(color) => handleColorChange(params.row.id, color)}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <Table className="min-w-full divide-y divide-gray-200 bg-white">
          <TableHeader className="bg-gray-100">
            <TableRow>
              {columns?.map((col) => (
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
                  No status data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Status;

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
import { useTheme } from "@/components/theme-provider";

const Status = () => {
  const [data, setData] = useState([]);
  const { theme } = useTheme();

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
      renderCell: (params) => (
        <span className="font-medium text-foreground">{params?.value}</span>
      ),
    },
    {
      field: "indicator",
      headerName: "Indicator",
      type: "text",
      renderCell: (params) => (
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: params.row.color }}
          />
          <ColorPicker
            value={params.row.color}
            onChange={(color) => handleColorChange(params.row.id, color)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="overflow-x-auto max-h-[80vh] rounded-2xl shadow-md border border-border">
        <Table className="min-w-full divide-y divide-border bg-card text-sm">
          <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
            <TableRow>
              {columns?.map((col) => (
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
                  className="px-2 py-6 text-center text-muted-foreground"
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

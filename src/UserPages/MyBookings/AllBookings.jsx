import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const AllBookings = () => {
    return (
        <>
            <div>
                            <Table className="w-full mt-2 shadow-sm border border-gray-200 rounded-md p-2">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[100px]">Invoice</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Method</TableHead>
                                  <TableHead>Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium">INV001</TableCell>
                                  <TableCell>Paid</TableCell>
                                  <TableCell>Credit Card</TableCell>
                                  <TableCell>$250.00</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">INV001</TableCell>
                                  <TableCell>Paid</TableCell>
                                  <TableCell>Credit Card</TableCell>
                                  <TableCell>$250.00</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">INV001</TableCell>
                                  <TableCell>Paid</TableCell>
                                  <TableCell>Credit Card</TableCell>
                                  <TableCell>$250.00</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
        </>
    )
}

export default AllBookings
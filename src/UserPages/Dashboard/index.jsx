import React, { useEffect, useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { $ajax_post } from "../../Library";

const Dashboard = () => {
    const { user } = useClerk();
    const [userDetails, setUserDetails] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUserDetails(user);
    }, [user]);

    useEffect(() => {
        setLoading(true);
        // Fetch all data in parallel
        Promise.all([
            new Promise((resolve) => $ajax_post("rooms", {}, resolve)),
            new Promise((resolve) => $ajax_post("buildings", {}, resolve)),
            new Promise((resolve) => $ajax_post("users", {}, resolve)),
            new Promise((resolve) => $ajax_post("allBookings", {}, resolve)),
        ]).then(([roomsRes, buildingsRes, usersRes, bookingsRes]) => {
            setRooms(roomsRes || []);
            setBuildings(buildingsRes || []);
            setUsers(usersRes || []);
            setBookings(bookingsRes || []);
            setLoading(false);
        });
    }, []);

    // Compute tile values
    const today = new Date().toISOString().split("T")[0];
    const scheduledRoomsToday = bookings.filter(b => b.date === today);
    const scheduledRoomIdsToday = new Set(scheduledRoomsToday.map(b => b.room_id));
    const vacantRoomsToday = rooms.filter(r => !scheduledRoomIdsToday.has(r.id));
    const studentCount = users.filter(u => (u.role || '').toLowerCase() === 'user' || (u.role || '').toLowerCase() === 'student').length;

    return (
        <>
            <h1>Dashboard</h1>
            <h3>Welcome {userDetails?.firstName || 'User'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>No. of Rooms</CardTitle>
                        <CardDescription>Total rooms in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? '...' : rooms.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>No. of Buildings</CardTitle>
                        <CardDescription>Total buildings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? '...' : buildings.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>No. of Students</CardTitle>
                        <CardDescription>Registered students</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? '...' : studentCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Vacant Rooms Today</CardTitle>
                        <CardDescription>Rooms not booked today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? '...' : vacantRoomsToday.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Scheduled Rooms</CardTitle>
                        <CardDescription>Rooms booked today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? '...' : scheduledRoomsToday.length}</div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Dashboard;
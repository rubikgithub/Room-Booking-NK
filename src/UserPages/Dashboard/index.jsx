import React, { useEffect, useState } from "react";
import { $ajax_post } from "../../Library";

const Dashboard = () => {
    useEffect(() => {}, [
        $ajax_post(`getUser/user_2wogJroXsrv2qL3Yufp2POUpLlS`, {}, function (response) {
            console.log(response.role, 'userssss');
            localStorage.setItem('role', response.role);
        }),
    ],[]);
    return (
        <>
            <h1>Dashbaord</h1>
        </>
    )
}

export default Dashboard;
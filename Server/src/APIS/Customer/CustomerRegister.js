const express = require("express");
const router = express.Router();
const clearkClientInstance = require("../../../config/clerkClient");
const { v4: uuidv4 } = require('uuid');
const supabase = require("../../../config/supabaseClient")


const createUserSupabase = async () => {
    try {
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            throw checkError;
        }

        if (existingUser) {
            return {
                success: false,
                message: "User already exists.",
            };
        }

        const { data, error } = await supabase
            .from("users")
            .insert([user])
            .select();
        if (error) throw error;

        return {
            success: true,
            message: "User created successfully.",
            data,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to create user.",
            error: error.message || error,
        };
    }
}

router.post("/createUser", async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body.body;
        const clerk = clearkClientInstance();
        const uuid = uuidv4();
        const userData = {
            "external_id": uuid,
            "first_name": firstName,
            "last_name": lastName,
            "email_address": [email],
            "username": `${firstName}${uuid}`,
            "password": password,
            "skip_password_checks": true,
            "skip_password_requirement": true,
            "delete_self_enabled": true,
            "create_organization_enabled": true,
            "create_organizations_limit": 0
        }

        const user = await clerk.users.createUser(userData)
        res.send({
            status: 'success',
            message: 'User created successfully',
            data: user
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({
            status: 'error',
            message: 'User creation failed',
            error: err
        })
    }
});


module.exports = router;
const express = require("express");
const router = express.Router();
const clearkClientInstance = require("../../../config/clerkClient");
const { v4: uuidv4 } = require('uuid');
const supabase = require("../../../config/supabaseClient")

const createUserSupabase = async (userData) => {
    try {
        const user = {
            id: uuidv4(),
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            email: userData?.email,
        }
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
    const user = req.body.body;
    const { success, message, data, error } = await createUserSupabase(user);
    if (success) {
        try {
            const { email, password, first_name, last_name } = req.body.body;
            const clerk = clearkClientInstance();
            const uuid = uuidv4();
            const userData = {
                "external_id": uuid,
                "first_name": first_name,
                "last_name": last_name,
                "email_address": [email],
                "username": `${first_name}${uuid}`,
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
    } else {
        res.status(500).send({
            status: "error",
            message: message,
            error: error,
        })
    }

});


module.exports = router;
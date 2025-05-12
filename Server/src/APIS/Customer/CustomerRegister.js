const express = require("express");
const router = express.Router();
const clearkClientInstance = require("../../../config/clerkClient");
const { v4: uuidv4 } = require('uuid');
const supabase = require("../../../config/supabaseClient");

const createUserSupabase = async (userData) => {
    try {
        console.log("userData", userData);
        const user = {
            id: uuidv4(),
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            email: userData?.email,
            address: userData?.address,
            phone_number: userData?.phone_number,
            dob: userData?.dob,
            role: userData?.role || "user"
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
    let supabaseData;
    try {
        const user = req.body.body;
        const { success, message, data, error } = await createUserSupabase(user);
        if (success) {
            const { email, password, first_name, last_name } = req.body.body;
            supabaseData = data[0]
            const clerk = clearkClientInstance();
            const uuid = uuidv4();
            const userData = {
                "external_id": data[0].id,
                "first_name": first_name,
                "last_name": last_name,
                "email_address": [email],
                "username": `${first_name}${uuid}`,
                "password": password,
                // "skip_password_checks": true,
                // "skip_password_requirement": true,
                "delete_self_enabled": true,
                "create_organization_enabled": true,
                "create_organizations_limit": 0
            }

            await clerk.users.createUser(userData)
            res.send({
                status: 'success',
                message: 'User created successfully',
                data: user
            })
        }
        else {
            console.log('password duplicatioe')
            res.status(500).send({
                status: "error",
                message: message,
                error: error,
            })
        }

    } catch (err) {
        if (err.errors[0].code === 'form_password_pwned') {
            await supabase
                .from("users")
                .delete()
                .eq("id", supabaseData?.id);
        }
        res.status(err.status || 500).send({
            status: 'error',
            message: 'User creation failed',
            error: err
        })
    }
});

router.post('/revokeSession/:sessionId', async (req, res) => {
    try {
        console.log('run', req.params.sessionId)
        const { sessionId } = req.params
        const clerk = clearkClientInstance();
        const session = await clerk.sessions.revokeSession(sessionId)
        res.send({
            status: 'success',
            data: session,
            message: 'User logged out successfully'
        })

    } catch (err) {
        res.send({
            success: false,
            data: err,
            message: 'Internal Server Error'
        })
    }
})

module.exports = router;
const express = require("express");
const router = express.Router();
const clearkClientInstance = require("../../../config/clerkClient");
const { v4: uuidv4 } = require('uuid');
const supabase = require("../../../config/supabaseClient");

const createUserSupabase = async (userData) => {
    try {
        const user = {
            id: uuidv4(),
            first_name: userData?.firstName,
            last_name: userData?.lastName,
            email: userData?.email,
            address: '141, new test',
            phone_number: '9893600766',
            clerk_id: userData?.clerk_id,
            role:"admin"
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
    // const { success, message, data, error } = await createUserSupabase(user);
    // if (success) {
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

            const userResp = await clerk.users.createUser(userData)
            console.log(userResp.id, 'userResp');
            await createUserSupabase({...user, clerk_id: userResp.id});
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
    // } else {
    //     res.status(500).send({
    //         status: "error",
    //         message: message,
    //         error: error,
    //     })
    // }

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
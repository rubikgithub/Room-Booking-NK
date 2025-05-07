const express = require("express");
const router = express.Router();
const clearkClientInstance = require("../../../config/clerkClient");
const { v4: uuidv4 } = require('uuid');

router.post("/createUser", async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const clerk = clearkClientInstance();
        const uuid = uuidv4();
        const userData = {
            "external_id": uuid,
            "first_name": firstName,
            "last_name": lastName,
            "email_address": [email],
            "username": `${firstName}${uuid}`,
            "password": 'Test@#$%1234',
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
        res.status(500).send(err)
    }
});


module.exports = router;
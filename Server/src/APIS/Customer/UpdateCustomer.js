const express = require("express");
const clearkClientInstance = require("../../../config/clerkClient");
const router = express.Router();

router.post("/updatePassword/:userId", async (req, res) => {
    try {
        const {  password,} = req.body.body;
        const clerk = clearkClientInstance();
        const userData = {
            "password": password,
            "skip_password_checks": true,
            "skip_password_requirement": true,
            "delete_self_enabled": true,
            "create_organization_enabled": true,
            "create_organizations_limit": 0
        }

        const user = await clerk.users.updateUser(req.params.userId, userData)
        res.send({
            status: 'success',
            message: 'User password updated successfully',
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

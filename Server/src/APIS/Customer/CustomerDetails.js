const express = require("express");

const router = express.Router();

router.get("/getUser", (req, res) => {
   res.send({
      status: 'success',
      message: 'User fetched successfully',
      data: req.user
   })
});


module.exports = router;
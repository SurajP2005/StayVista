const express = require("express");
const router = express.Router({ mergeParams: true });

const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");

router.post("/", isLoggedIn, async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    const { checkIn, checkOut, guests } = req.body;

    // Calculate number of nights
    const nights = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) /
        (1000 * 60 * 60 * 24)
    );

    const totalPrice = nights * listing.price;

    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice,
    });

    await booking.save();

    req.flash("success", "Booking Confirmed!");

    res.redirect("/listings");
});

module.exports = router;
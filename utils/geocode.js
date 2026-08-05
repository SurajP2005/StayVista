const axios = require("axios");

async function geocode(location, country) {
    const query = `${location}, ${country}`;

    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: query,
                    format: "json",
                    limit: 1,
                },
                headers: {
                    "User-Agent": "StayVista Project",
                },
            }
        );

        console.log(response.data); // For debugging

        if (response.data.length === 0) {
            return null;
        }

        return {
            type: "Point",
            coordinates: [
                parseFloat(response.data[0].lon),
                parseFloat(response.data[0].lat),
            ],
        };
    } catch (err) {
        console.error("Geocoding Error:", err.message);
        return null;
    }
}

module.exports = geocode;
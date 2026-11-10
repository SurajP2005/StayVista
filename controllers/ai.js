
const { GoogleGenAI } = require("@google/genai");
const { marked } = require("marked");
const Listing = require("../models/listing.js");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Show Planner Page
module.exports.renderPlanner = (req, res) => {
    res.render("ai/planner.ejs");
};

// Generate Trip Plan
module.exports.generateTrip = async (req, res) => {
    try {
        const { destination, budget, days, guests, interests } = req.body;

        // Find matching StayVista listings
        const listings = await Listing.find({
            $or: [
                { location: { $regex: destination, $options: "i" } },
                { country: { $regex: destination, $options: "i" } },
                { title: { $regex: destination, $options: "i" } },
                { description: { $regex: destination, $options: "i" } },
                { category: { $regex: destination, $options: "i" } },
            ],
        }).limit(3);

        // Convert listings into text
        const listingInfo =
            listings.length > 0
                ? listings.map((listing) => `
Title: ${listing.title}
Location: ${listing.location}, ${listing.country}
Price: ₹${listing.price}/night
Description: ${listing.description}
`).join("\n")
                : "No StayVista listings available for this destination.";

        // AI Prompt
        const prompt = `
You are an expert AI travel planner for StayVista.

User Details:
Destination: ${destination}
Budget: ₹${budget}
Days: ${days}
Guests: ${guests}
Interests: ${interests}

These are the available StayVista properties. Recommend the BEST one for the user based on their budget, interests and destination.

For each property:
- Mention the property name.
- Mention the location.
- Mention the price.
- Explain why it is the best choice.

${listingInfo}

Instructions:
1. Create a day-wise itinerary.
2. Recommend ONE StayVista property from the list if available.
3. Explain why that property suits the user's budget and interests.
4. Give estimated expenses.
5. Recommend local food.
6. Suggest places to visit.
7. Give travel tips.

If no StayVista listing is available, clearly say:
"No StayVista property is available for this destination."
`;

        // Gemini API with retry logic
        let response;
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: "gemini-3.5-flash-lite",
                    contents: prompt,
                });

                break;

            } catch (error) {
                const status = Number(error.status || error.code);

                console.error(`Gemini API attempt ${attempt} failed:`, error.message);

                if (status === 503 && attempt < maxRetries) {
                    const delay = 2000 * Math.pow(2, attempt - 1);

                    await new Promise(resolve =>
                        setTimeout(resolve, delay)
                    );
                } else {
                    throw error;
                }
            }
        }

        // Format AI response
        const formattedTrip = marked(response.text);

        res.render("ai/result.ejs", {
            tripPlan: formattedTrip,
        });

    } catch (error) {
        console.error("AI Trip Planner Error:", error);

        res.status(503).render("ai/planner.ejs", {
            error: "AI Trip Planner is temporarily unavailable. Please try again later.",
        });
    }
};

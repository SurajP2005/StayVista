// coordinates are stored as [longitude, latitude]
    
const lng = coordinates[0];
const lat = coordinates[1];

const map = L.map("map").setView([lat, lng], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${listingTitle}</b>`)
    .openPopup();
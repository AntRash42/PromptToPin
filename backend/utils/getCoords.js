import getData from "./getData.js";
async function fetchCoordsFromMapsCo(placeName) {
    try {
        const url = `https://geocode.maps.co/search?q=${encodeURIComponent(placeName)}&api_key=${process.env.GEO_CODE_API_KEY_}`;
        const axios = (await import('axios')).default;
        const response = await axios.get(url);
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            if (!isNaN(lat) && !isNaN(lon)) {
                return [lat, lon];
            }
        }
    } catch (e) {
        // ignore
    }
    return [null, null];
}

async function getFullCoords(prompt) {
    try {
        const dataResponse = await getData(prompt);
        let locationObj;
        if (dataResponse.json) {
            locationObj = dataResponse.json;
        } else {
            const text = dataResponse.raw || dataResponse.output_text;
            if (!text) throw new Error("No output text from getData");
            locationObj = JSON.parse(text);
        }
        // Fallback: for each place, if coordinates are missing/null/invalid, fetch from maps.co
        for (const place of Object.keys(locationObj)) {
            const arr = locationObj[place];
            // Expecting arr[2] to be [lat, lon] or undefined
            let coords = arr[2];
            let lat = coords && Array.isArray(coords) ? parseFloat(coords[0]) : null;
            let lon = coords && Array.isArray(coords) ? parseFloat(coords[1]) : null;
            let source = 'gpt';
            if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
                const [mapsLat, mapsLon] = await fetchCoordsFromMapsCo(place);
                if (mapsLat && mapsLon) {
                    arr[2] = [mapsLat, mapsLon];
                    source = 'maps.co';
                } else {
                    arr[2] = [null, null];
                    source = 'none';
                }
            }
            // Log the coordinates and their source for each place
            console.log(`Coords for ${place}:`, arr[2], `(source: ${source})`);
        }
        return locationObj;
    } catch (error) {
        console.error("Error in getFullCoords:", error);
    }
}

export default getFullCoords;
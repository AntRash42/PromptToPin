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
        // console.log("Raw response from GPT:", dataResponse.json);
        let locationObj;
        if (dataResponse.json) {
            locationObj = dataResponse.json.places; //Cuz now the places is the sub-object(?) of the response
        } else {
            const text = dataResponse.raw || dataResponse.output_text;
            if (!text) throw new Error("No output text from getData");
            locationObj = JSON.parse(text);
        }
        for (const rank of Object.keys(locationObj)) {
            const arr = locationObj[rank];
            let coords = arr[3];
            let lat = coords && Array.isArray(coords) ? parseFloat(coords[0]) : null;
            let lon = coords && Array.isArray(coords) ? parseFloat(coords[1]) : null;
            let source = 'gpt';
            if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
                const [mapsLat, mapsLon] = await fetchCoordsFromMapsCo(arr[0]);
                if (mapsLat && mapsLon) {
                    arr[3] = [mapsLat, mapsLon];
                    source = 'maps.co';
                } else {
                    arr[3] = [null, null];
                    source = 'none';
                }
            }
            console.log(`${arr[0]}: [${arr[3][0]}, ${arr[3][1]}] (${source})`);
        }
        dataResponse.json.places = locationObj; //Assigning the modified locationObj back to the dataResponse
        return dataResponse;
    } catch (error) {
        console.error("Error in getFullCoords:", error);
    }
}

export default getFullCoords;
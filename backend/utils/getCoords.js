import getInfo from "./getInfo.js";
import getData from "./getData.js";
import axios from 'axios';
import slugify from 'slugify';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getFullCoords(prompt) {
  try {
    const response = await getInfo(prompt);
    const dataResponse = await getData(response.output_text);        
        // Use the parsed JSON if available, otherwise try to parse the raw/output_text
        let locationObj;
        if (dataResponse.json) {
            locationObj = dataResponse.json;
        } else {
            const text = dataResponse.raw || dataResponse.output_text;
            if (!text) throw new Error("No output text from getData");
            locationObj = JSON.parse(text);
        }
        const locations = Object.keys(locationObj)
    for (const location of locations) {
        const location_slug = slugify(location, {
            lower: true,      // convert to lowercase
            strict: true      // remove special characters
        });
        const url = "https://geocode.maps.co/search?q=" + location_slug + "&api_key=" + process.env.GEO_CODE_API_KEY_;
        try {
            const response = await axios.get(url);
            let lat = response?.data[0]?.lat || null;
            let lon = response?.data[0]?.lon || null;
            locationObj[location][2] = [lat, lon];
            locationObj[location][3] = response?.data[0]?.boundingbox;
            locationObj[location][4] = url;
            // Fallback: If geocode failed, ask GPT for coordinates
            if (lat === null || lon === null) {
                const gptCoordPrompt = `Give only the latitude and longitude (as a JSON array [lat, lng]) for the following place: ${location}. No explanation, no extra text, just the array.`;
                try {
                    const gptCoordResp = await getData(gptCoordPrompt);
                    let gptCoords = null;
                    if (gptCoordResp.json && Array.isArray(gptCoordResp.json)) {
                        gptCoords = gptCoordResp.json;
                    } else {
                        // Try to extract array from raw output
                        const match = (gptCoordResp.raw || gptCoordResp.output_text || '').match(/\[\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\]/);
                        if (match) {
                            try {
                                gptCoords = JSON.parse(match[0]);
                            } catch {}
                        }
                    }
                    if (gptCoords && gptCoords.length === 2) {
                        locationObj[location][2] = gptCoords;
                    }
                } catch (gptErr) {
                    console.error('GPT fallback for coordinates failed:', gptErr);
                }
            }
            await delay(1000);
        } catch (error) {
            console.error('Error fetching geocode data:', error);
            throw error;
        }
    }
    return locationObj;
  } catch (error) {
    console.error("Error in getFullCoords:", error);
  }
}

export default getFullCoords;
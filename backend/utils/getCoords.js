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
                lower: true,
                strict: true
            });
            const url = "https://geocode.maps.co/search?q=" + location_slug + "&api_key=" + process.env.GEO_CODE_API_KEY_;
            try {
                const response = await axios.get(url);
                let lat = response?.data[0]?.lat || null;
                let lon = response?.data[0]?.lon || null;
                if (!lat || !lon) {
                    lat = null;
                    lon = null;
                }
                locationObj[location][2] = [lat, lon];
                locationObj[location][3] = response?.data[0]?.boundingbox;
                locationObj[location][4] = url;
                if (lat === null || lon === null) {
                    const gptCoordPrompt = `Give only the latitude and longitude (as a JSON array [lat, lng]) for the following place: ${location}. No explanation, no extra text, just the array.`;
                    try {
                        const gptCoordResp = await getData(gptCoordPrompt);
                        let gptCoords = null;
                        if (gptCoordResp.json && Array.isArray(gptCoordResp.json)) {
                            gptCoords = gptCoordResp.json;
                        } else {
                            const raw = gptCoordResp.raw || gptCoordResp.output_text || '';
                            const match = raw.match(/\[\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\]/);
                            if (match) {
                                try {
                                    gptCoords = JSON.parse(match[0]);
                                } catch (e) {
                                    const nums = match[0].replace(/\[|\]/g, '').split(',').map(Number);
                                    if (nums.length === 2 && !isNaN(nums[0]) && !isNaN(nums[1])) {
                                        gptCoords = nums;
                                    }
                                }
                            }
                        }
                        if (gptCoords && gptCoords.length === 2 && !isNaN(gptCoords[0]) && !isNaN(gptCoords[1])) {
                            locationObj[location][2] = gptCoords;
                        } else {
                            console.warn(`Could not get fallback coords for: ${location}`, gptCoordResp);
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
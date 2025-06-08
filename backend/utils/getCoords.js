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
        // console.log(dataResponse.output_text);

//         const response = `
//         The University of Delhi || educational institution || Premier university known for diverse academic programs.

// The University of Delhi || educational institution || Home to the main campus of DU.

// St. Stephen's College || educational institution || Renowned college located near Vishwavidyalaya Metro Station.

// Hindu College || educational institution || Esteemed college situated close to Kashmere Gate Metro Station.
//         `
        // const lines = response.split('\n');
        // const lines = dataResponse.output_text.split('\n');
        // const parsedLines = lines.map(line => {
        //     const [place, tag, comment] = line.split(' || ');
        //     return { place, tag, comment };
        // });
        const locationObj = JSON.parse(dataResponse.output_text);
        const locations = Object.keys(locationObj)
        // console.log("Locations:", locations);
          for (const location of locations){
            const location_slug = slugify(location, {
                lower: true,      // convert to lowercase
                strict: true      // remove special characters
            });
            const url = "https://geocode.maps.co/search?q=" + location_slug + "&api_key=" + process.env.GEO_CODE_API_KEY_;
            // console.log("Fetching coordinates for:", location, "from URL:", url);
            try {
                const response = await axios.get(url);
                // console.log(`Fetched coordinates for ${url}:`, response?.data);
                // response.data contains the JSON response
                // console.log(locationObj[location])
                locationObj[location][2] =  [response?.data[0]?.lat, response?.data[0]?.lon];
                locationObj[location][3] = response?.data[0]?.boundingbox;
                locationObj[location][4] =url;
                await delay(1000);
            } catch (error) {
                console.error('Error fetching geocode data:', error);
                throw error;
            }            
        };


        return locationObj
    } catch (error) {
        console.error("Error in getFullCoords:", error);
    }
}

export default getFullCoords;
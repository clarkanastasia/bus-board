import fetch from 'node-fetch';
import promptSync from 'prompt-sync';

const prompt = promptSync();

async function getNextBuses(){
    const postcode = await getPostcode()
    const latitude = await getLatitude(postcode)
    const longitude = await getLongitude(postcode)
    const stopsArray = await getBusStops(latitude, longitude)
    getBuses(stopsArray);
}

async function getPostcode(){
    let postcodeValid = false;
    while(postcodeValid === false){
        try {
            const postcode = prompt('Please enter your postcode: ');
            const response = await fetch (`https://api.postcodes.io/postcodes/${postcode}`);
            const data = await response.json()
            if (data.status !== 200 ) {
                throw `Error ${data.error}`;
            } else {
                postcodeValid = true;
                return postcode;
            }        
        } catch (error) {
            console.log('Invalid postcode - please try again');
        }
    }
}

async function getLatitude(postcode){
    try {
        const API_URL = `https://api.postcodes.io/postcodes/${postcode}`;
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw `API Response Error`
        }
        const data = await response.json();
        const latitude = data.result.latitude;
        // console.log(`Latitude is ${latitude}`);
        return latitude;
    } catch (error) {
        throw error;
    }
}

async function getLongitude(postcode){
    try {
        const API_URL = `https://api.postcodes.io/postcodes/${postcode}`;
        const response = await fetch(API_URL);
        if (!response.ok){
            throw `API Response Error`
        }
        const data = await response.json();
        const longitude = data.result.longitude;
        // console.log(`Longitude is ${longitude}`);
        return longitude;
    } catch(error){
        throw error;
    }
}

async function getBusStops(latitude, longitude){
    const API_URL = `https://api.tfl.gov.uk/StopPoint/?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram`;
    const response = await fetch(API_URL);
    const data = await response.json();
    try {
        if(data.stopPoints.length == 0){
            throw `Error: There are no bus stops nearby`;
        }
        const stopsArray = [];
        for (let i = 0; i < data.stopPoints.length; i++){
            stopsArray.push(data.stopPoints[i].naptanId)
        }
        // console.log(stopsArray);
        return stopsArray;
    } catch(error){
        throw error;
    } 
}

async function getBuses(stopsArray){
    for (let i=0; i < 2; i++) {
        const API_URL = `https://api.tfl.gov.uk/StopPoint/${stopsArray[i]}/Arrivals`;
        const response = await fetch(API_URL);
        const allBuses = await response.json();
        try {
            if(allBuses.length === 0) {
                throw `Error: there are no buses arriving`
            }
            const buses = allBuses.sort((a,b) => a.timeToStation - b.timeToStation);   
            const stationName = buses[0].stationName;
            let platformName = buses[0].platformName;
            platformName = platformName === 'null' ? '' : buses[0].platformName; 
            console.log("---------");
            console.log(`Your next two buses from ${platformName} ${stationName} are:`);
                for (let i= 0; i < 2; i++){
                const route = buses[i].lineId;
                const destination = buses[i].destinationName;
                const arrivalTime = Math.floor(buses[i].timeToStation / 60);
                console.log(`The ${route} to ${destination}. Arriving in ${arrivalTime} minutes.`);
                }
        } catch(error) {
            console.log('There are no buses arriving');
            throw error;
        }
    }
}

getNextBuses();
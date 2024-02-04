import fetch from 'node-fetch';
import promptSync from 'prompt-sync';

const prompt = promptSync();

async function getNextBuses(){
    const stopCode = await getStopCode();
    getBuses(stopCode);
}

async function getStopCode(){
    let validStopCode = false;
    while (!validStopCode) {
        try {
        const stopCode = prompt('Please enter your stop code: ');
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopCode}`);
            if (!response.ok){
                throw `API response status: ${response.status}`;
            } else {
            validStopCode = true;
            return stopCode;
            }
        } catch(error) {
            console.log(`THe stop code you entered is not valid. Please try again`);
        }
    }
}

async function getBuses(stopCode){
    const API_URL = `https://api.tfl.gov.uk/StopPoint/${stopCode}/Arrivals`;
    try {
        const response = await fetch(API_URL);
        const allBuses = await response.json();
        if (!response.ok) {
            throw `API response status: ${response.status}`;
        }
        const buses = allBuses.sort((a,b) => a.timeToStation - b.timeToStation);   
        console.log("Your next five buses are:");
            for (let i= 0; i < 5; i++){
            const route = buses[i].lineId;
            const destination = buses[i].destinationName;
            const arrivalTime = Math.floor(buses[i].timeToStation / 60);
            console.log(`The ${route} to ${destination}. Arriving in ${arrivalTime} minutes.`);
            }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

getNextBuses();
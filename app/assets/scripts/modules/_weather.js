import $ from '../vendor/jquery-3.2.1.min';
import config from './_config';

var apiKey = config.apiKey;
var url    = config.url;

// convert fahrenheit to celsius
function fToC(fahrenheit) {
    var fTemp = parseInt(fahrenheit),
        fToCel = (fTemp - 32) * 5 / 9;
    // rounding to nearest number after converting
    return Math.round(fToCel);
}
// convert celsius to fahrenheit
function cToF(celsius) {
    var cTemp = parseFloat(celsius);
    var cToFh = (cTemp * (9 / 5)) + 32;
    return Math.round(cToFh);
}

// DarkSky current weather API call
function weatherAPI(latitude, longitude) {
    // variables config for coordinates, url and api key
    // latitude and longitude are accepted arguments and passed once a user has submitted the form.
    var lat = parseFloat(latitude),
        lng = parseFloat(longitude), // TODO: implement auto units with &units=auto 
        api_call = url + apiKey + "/" + lat + "," + lng + "?exclude=alerts,flags,hourly,daily&callback=?";

    return $.getJSON(api_call, function (forecast) {
        var skycons;
        // console.log(forecast);
        skycons = new Skycons({
            "color": "#272a38",
            "resizeClear": true
        });
        skycons.add(document.getElementById("icon"), forecast.currently.icon);
        skycons.play();
    });
}

// get User's current location(city, state)
function getAddress(latitude, longitude) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        var method = 'GET';
        var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=AIzaSyAS7K0j6WL719mEhiIFH2XYlkZdEo3breo`;
        var async = true;
        var spinner = $('.icon-spin4');

        request.open(method, url, async);
        request.onreadystatechange = function () {
            if (request.readyState < 4) {
                //show spinner while waiting for request
                spinner.show();
            }
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var data = JSON.parse(request.responseText);
                    var address = data.results[2].formatted_address;

                    // hide spinner once data is fetched
                    spinner.hide();
                    // console.log(data);                                  
                    resolve(address);
                } else {
                    reject(request.status);
                }
            }
        };
        request.send();
    }).then(function (address) {
        return address;
    });
};

function weatherReport() {
    // Check HTML5 geolocation.
    if (!navigator.geolocation) {
        console.error('Geolocation not enabled');
        $('.location').append(`<p>Geolocation is not enabled.</p>`);
        return;
    };
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var currentTemp = weatherAPI(latitude, longitude);
            var userAddress = getAddress(latitude, longitude);
            // waiting for all promises to resolve and and assigning them to promise var
            var promised = Promise.all([currentTemp, userAddress]);

            if (promised) {
                console.log(promised);
                resolve(promised);
                console.log('resolved');
            } else
                throw reject(`Error Happened: ${reject.reason}`);
        });
    }).then(function (result) {
        // appending basic data ( current temp, animated icon, and location) to weather section
        $('.currentTemp').append(`<p class="temp" title="${result[0].currently.summary}">
            ${fToC(result[0].currently.apparentTemperature)}<sup class="cel unit">&#8451;</sup></p>`);
        $('.location').append(`<p class="loc">${result[1]}</p>`);
        return result;
    }).then(function (data) {
        const daysToReport = 5;        
        let lat = parseFloat(data[0].latitude),
            lng = parseFloat(data[0].longitude), // TODO: implement auto units with &units=auto 
            api_call = url + apiKey + "/" + lat + "," + lng + "?exclude=alerts,flags,hourly,currently&callback=?",
            date;
        console.log(data);

        // Fetch daily weather data
        // I could do this with already fetched data but couldn't add skycons in that way performance wise
        // but I excluded all data except daily in this API call
        $.getJSON(api_call, function (forecast) {
            var skycons;
            var daily = forecast.daily.data;

            skycons = new Skycons({
                "color": "#e0e0f8",
                "resizeClear": true
            });
            for (var index = 0; index <= daysToReport; index++) {
                // get data from received timestamp
                date = new Date(daily[index].time * 1000).toString().substring(0, 10);
                // console.log(date);
                // add formated date and skycons to daily overview
                $(`.daily_${index}`).html(`<p class="daily_date">${date}</p><canvas id="icon_${index}" width="30" height="30"></canvas>`);
                skycons.add(document.getElementById(`icon_${index}`), daily[index].icon);
            }
            skycons.play();                
        });
    });
};

// Object for exporting
const func = {
    weatherReport,
    cToF,
    fToC
}
export default func;

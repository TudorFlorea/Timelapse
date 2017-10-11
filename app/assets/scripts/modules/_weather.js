import $ from '../vendor/jquery-3.2.1.min';
import config from './_config';

var apiKey = config.apiKey;
var url = config.url;

function populateDailyInfo(arr, index, data) {
    var sunUp = new Date(data[index].sunriseTime * 1000).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
    var sunDown = new Date(data[index].sunsetTime * 1000).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    $('.daily_header').html(`<h4>${arr[index].children[0].dataset.date}</h4>`);
    $('.hiTemp').text(fToC(data[index].apparentTemperatureHigh));
    $('.lowTemp').text(fToC(data[index].apparentTemperatureMin));
    $('.wi-umbrella').text(` ${parseFloat(data[index].precipProbability) * 100}%`);
    $('.wi-cloudy').text(` ${parseFloat(data[index].cloudCover) * 100}%`);
    $('.wi-humidity').text(` ${parseFloat(data[index].humidity) * 100}%`);
    $('.wi-strong-wind').text(` ${Math.round(parseFloat(parseFloat(data[index].windSpeed)))} mph`);
    $('.wi-sunrise').text(` ${sunUp}`);
    $('.wi-sunset').text(` ${sunDown}`);
    $('.daily_summary').text(data[index].summary);

    $('.daily_icon').html(`<canvas id="dailyIcon" width="90" height="90"></canvas>`);
}

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
        api_call = url + apiKey + "/" + lat + "," + lng + "/?exclude=alerts,flags,hourly,daily&Accept-Encoding:gzip&callback=?";

    return $.getJSON(api_call, function (forecast) {
        var skycons;
        // console.log(forecast);
        skycons = new Skycons({
            "color": "#e0e0f8",
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
                if(request.readyState == 3){
                    // hide spinner once data is fetched
                    spinner.hide();
                }
            } 
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var data = JSON.parse(request.responseText);
                    var address = data.results[2].formatted_address;

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
        var dataArr = []; // TODO: send data storage

        // Fetch daily weather data
        if (dataArr.length < daysToReport) {
            // I could do this with already fetched data but couldn't add skycons in that way performance wise
            // but I excluded all data except daily in this API call
            $.getJSON(api_call, function (forecast) {
                var skycons;
                var daily = forecast.daily.data;

                skycons = new Skycons({
                    "color": "#e0e0f8",
                    "resizeClear": true
                });
                for(var i in daily) {
                    if(parseInt(i) <= daysToReport){
                        // prepare data for storage
                        dataArr[i] = daily[i];
                        // get data from received timestamp
                        date = new Date(daily[i].time * 1000).toString().substring(0, 10);
                        // add formated date and skycons to daily overview
                        $(`.daily_${i}`).html(`<p data-date="${date}" class="daily_date">${date}</p><canvas id="icon_${i}" width="30" height="30"></canvas>`);
                        skycons.add(document.getElementById(`icon_${i}`), daily[i].icon);
                    }                                
                }
                let dailyArr = document.querySelectorAll(".forecast");
                // Populate the daily info for the tomorrow only
                populateDailyInfo(dailyArr, 0, dataArr);
                skycons.add(document.getElementById(`dailyIcon`), dataArr[0].icon);

                // populate daily info for each day, when user clicks on day <li></li> element
                $(dailyArr).on('click', function (e) {
                    // check for index number of clicked item
                    var thisIndex = $(dailyArr).index(this);
                    populateDailyInfo(dailyArr, thisIndex, dataArr);
                    // Add skycons
                    skycons.add(document.getElementById(`dailyIcon`), dataArr[thisIndex].icon);
                });
                // Animate Skycons
                skycons.play();
            });
        }

    });
};

// Object for exporting
const func = {
    weatherReport,
    cToF,
    fToC
}
export default func;

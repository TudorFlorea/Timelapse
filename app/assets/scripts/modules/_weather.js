import $ from '../vendor/jquery-3.2.1.min';
import config from './_config';

var storage = chrome.storage.local;
var apiKey = config.wKey;
var url = config.url;
var skycons = new Skycons({ // weather icons
    "color": "#e0e0f8",
    "resizeClear": true
});
var wForecast = []; // All weather data
var today; // Weather data for current day
var daily; // Weekly forecast data
var location;
var date;
var dailyArr = document.querySelectorAll(".forecast");
const DAYS_TO_REPORT = 5; // weekly forecast
const CACHE_DURATION = Date.now() - 3600 * 1000; // 1 hour

/**
 * clearCache removes cache and cacheTime objects from storage
/ */
function clearCache() {
    storage.remove(['cache', 'cacheTime'], function () {
        console.log('Cache cleaned');
    });
}
/**
 * cacheCheck, checks if there is weather cache in storage and returns boolean value.
/ */
function cacheCheck() {
    return new Promise(function (resolve, reject) {
        var status;
        storage.get(['cache', 'cacheTime'], function (items) { // if cache is not older that 1h
            console.log(items);
            if (items.cache && items.cacheTime && (items.cache.length > 1) && (items.cacheTime > CACHE_DURATION)) {
                status = true;
            } else {
                status = false;
            }
            resolve(status);
        })
    }).then(function (value) {
        console.log('Value: ' + value);
        return value;
    }).catch(function (reason) {
        console.log('Error: ' + reason);
        return reason;
    });
};
/**
 * @param {any} data - caches data to storage
/ */
function storeCache(data) {
    storage.set({
        cache: data,
        cacheTime: Date.now()
    }, function () {
        console.log('Cache stored');
    });
}
/**
 * loadCache is loading cached weather data from storage, checks if data is not too old 
 * and if not populates weather module with required information.
 */
function loadCache() {
    storage.get(['cache', 'cacheTime'], function (items) {
        today = items.cache[0];
        daily = items.cache[1].data;
        location = items.cache[2];
        console.log(new Date(items.cacheTime));
        console.log(new Date(Date.now()));
        try {
            // add weather info for current day to module
            $('.currentTemp').append(`<p class="temp" title="${items.cache[0].summary}">
                    ${Math.round(items.cache[0].apparentTemperature)}<i class="wi wi-degrees"></i></p>`);
            $('.location').append(`<p class="loc">${items.cache[2]}</p>`);
            skycons.add(document.getElementById("icon"), items.cache[0].icon);

            for (var i in items.cache[1].data) {
                if (parseInt(i) <= DAYS_TO_REPORT) {
                    // get date from received timestamp
                    date = new Date(items.cache[1].data[i].time * 1000).toString().substring(0, 10);
                    // add formated date and skycons to daily overview
                    $(`.daily_${i}`).html(`<p data-date="${date}" class="daily_date">${date}</p><canvas id="icon_${i}" width="30" height="30"></canvas>`);
                    skycons.add(document.getElementById(`icon_${i}`), items.cache[1].data[i].icon);
                }
            }
            // Populate the daily info for the tomorrow only
            populateDailyInfo(dailyArr, 0, items.cache[1].data);
            skycons.add(document.getElementById(`dailyIcon`), items.cache[1].data[0].icon);
        } catch (error) {
            throw new Error('Caching failed: ');
        }
    });
}
/**
 *  Populates weather information elements
 * 
 * @param {any} arr  - takes and array of HTML elements to iterate through, main purpose is to set date for element through its index
 * @param {any} index - index of selected element
 * @param {any} data - data from cache or freshly fetched from APIs
 */
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
    $('.hiTemp').text(Math.round(data[index].apparentTemperatureHigh));
    $('.lowTemp').text(Math.round(data[index].apparentTemperatureMin));
    $('.wi-umbrella').text(` ${Math.round(parseFloat(data[index].precipProbability) * 100) / 10}%`);
    $('.wi-cloudy').text(` ${Math.round(parseFloat(data[index].cloudCover)* 100) / 10}%`);
    $('.wi-humidity').text(` ${Math.round(parseFloat(data[index].humidity) * 100)}%`);
    $('.wi-strong-wind').text(` ${Math.round(parseFloat(data[index].windSpeed))} mph`);
    $('.wi-sunrise').text(` ${sunUp}`);
    $('.wi-sunset').text(` ${sunDown}`);
    $('.daily_summary').text(data[index].summary);

    $('.daily_icon').html(`<canvas id="dailyIcon" width="90" height="90"></canvas>`);
}

function eventListeners() {
    // Animate weekly report showing
    $('#icon').on('click', function (e) {
        $('#daily').toggleClass('invisible');
        if ($('#daily').hasClass('invisible')) {
            $("#daily").css({
                'transform': 'translateX(100%)'
            });
            skycons.pause();
        } else {
                $("#daily").css({
                    'transform': 'translateX(0%)'
                });
            skycons.play();
        }
    });

    // populate daily info for each day, when user clicks on day <li> element
    $(dailyArr).on('click', function (e) {
        // check for index number of clicked item
        let thisIndex = $(dailyArr).index(this);
        populateDailyInfo(dailyArr, thisIndex, daily);
        // Add skycons
        skycons.add(document.getElementById(`dailyIcon`), daily[thisIndex].icon);
    });
}

// DarkSky current weather API call
function weatherAPI(latitude, longitude) {
    // latitude and longitude are accepted arguments and passed once a user has submitted the form.
    let lat = parseFloat(latitude),
        lng = parseFloat(longitude),
        api_call = url + apiKey + "/" + lat + "," + lng + "/?exclude=alerts,flags,hourly&units=auto&Accept-Encoding:gzip&callback=?";

    return $.getJSON(api_call, function (forecast) {});
}

// get User's current location(city, state)
function getAddress(latitude, longitude) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        var method = 'GET';
        var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${config.gKey}`;
        var async = true;

        request.open(method, url, async);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var data = JSON.parse(request.responseText);
                    var address = data.results[2].formatted_address;

                    resolve(address);
                } else {
                    reject(request.status);
                }
            }
        };
        request.send();
    });
};

function weatherReport() {
    // Check HTML5 geolocation.
    if (!navigator.geolocation) {
        console.error('Geolocation not enabled');
        $('.location').append(`<p>Geolocation is not enabled.</p>`);
    };

    // try to populate data from cache if possible
    return new Promise(function (resolve, reject) {
        resolve(cacheCheck());
    }).then(function (value) {
        if (value) {
            // populate from cache
            console.log('Loading data from cache');
            loadCache();
        } else {
            // fetch data from Dark Sky and Google location API
            console.log('Cache error. Fetching data from APIs');
            clearCache(); // clear old cache
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
                        reject(`Error Happened: ${reject.reason}`);
                });
            }).then(function (result) {
                wForecast.push(result[0].currently, result[0].daily, result[1]);
                daily = wForecast[1].data;
                today = wForecast[0];
                location = wForecast[2];
                // store new data to cache
                storeCache(wForecast);
                storage.get(['cache', 'cacheTime'], function (items) {
                    console.log(items);
                });

                // appending basic data ( current temp, animated icon, and location) to weather section
                $('.currentTemp').append(`<p class="temp" title="${result[0].currently.summary}">
                 ${Math.round(result[0].currently.apparentTemperature)}<i class="wi wi-degrees"></i></p>`);
                $('.location').append(`<p class="loc">${result[1]}</p>`);
                skycons.add(document.getElementById("icon"), result[0].currently.icon);

                for (var i in daily) {
                    if (parseInt(i) <= DAYS_TO_REPORT) {
                        // get date from received timestamp
                        date = new Date(daily[i].time * 1000).toString().substring(0, 10);
                        // add formated date and skycons to daily overview
                        $(`.daily_${i}`).html(`<p data-date="${date}" class="daily_date">${date}</p><canvas id="icon_${i}" width="30" height="30"></canvas>`);
                        skycons.add(document.getElementById(`icon_${i}`), daily[i].icon);
                    }
                }
                dailyArr = document.querySelectorAll(".forecast");

                // Populate the daily info for the tomorrow only
                populateDailyInfo(dailyArr, 0, daily);
                skycons.add(document.getElementById(`dailyIcon`), daily[0].icon);
            }).catch(function (reason) {
                console.log('Error while fetching data from APIs: ' + reason);
                throw new Error(reason);
            });
        };
    });
};

// Object for exporting
const func = {
    weatherReport,
    eventListeners
}
export default func;

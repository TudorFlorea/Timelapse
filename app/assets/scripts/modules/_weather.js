import $ from '../vendor/jquery-3.2.1.min';
import config from './_config';

const [apiKey, url] = [config.wKey, config.url];
const storage = chrome.storage.local;
const skycons = new Skycons({ // weather icons
    color: '#e0e0f8',
    resizeClear: true,
});
const wForecast = []; // All weather data
let today; // Weather data for current day
let daily; // Weekly forecast data
let location;
let date;
let dailyArr = document.querySelectorAll('.forecast');
const DAYS_TO_REPORT = 5; // weekly forecast
const CACHE_DURATION = Date.now() - 3600 * 1000; // 1 hour

/**
 * clearCache removes cache and cacheTime objects from storage
/ */
function clearCache() {
    storage.remove(['cache', 'cacheTime'], () => {
    });
}
/**
 * cacheCheck, checks if there is weather cache in storage and returns boolean value.
/ */
function cacheCheck() {
    return new Promise(((resolve) => {
        let status;
        storage.get(['cache', 'cacheTime'], (items) => { // if cache is not older that 1h
            if (items.cache && items.cacheTime && (items.cache.length > 1) && (items.cacheTime > CACHE_DURATION)) {
                status = true;
            } else {
                status = false;
            }
            resolve(status);
        });
    })).then((value) => {
        return value;
    }).catch((reason) => {
        return reason;
    });
}
/**
 * @param {any} data - caches data to storage
/ */
function storeCache(data) {
    storage.set({
        cache: data,
        cacheTime: Date.now(),
    }, () => {
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
    const sunUp = new Date(data[index].sunriseTime * 1000).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    const sunDown = new Date(data[index].sunsetTime * 1000).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    $('.daily_header').html(`<h4>${arr[index].children[0].dataset.date}</h4>`);
    $('.hiTemp').text(Math.round(data[index].apparentTemperatureHigh));
    $('.lowTemp').text(Math.round(data[index].apparentTemperatureMin));
    $('.wi-umbrella').text(` ${Math.round(parseFloat(data[index].precipProbability) * 100) / 10}%`);
    $('.wi-cloudy').text(` ${Math.round(parseFloat(data[index].cloudCover) * 100) / 10}%`);
    $('.wi-humidity').text(` ${Math.round(parseFloat(data[index].humidity) * 100)}%`);
    $('.wi-strong-wind').text(` ${Math.round(parseFloat(data[index].windSpeed))} mph`);
    $('.wi-sunrise').text(` ${sunUp}`);
    $('.wi-sunset').text(` ${sunDown}`);
    $('.daily_summary').text(data[index].summary);

    $('.daily_icon').html('<canvas id="dailyIcon" width="80" height="80"></canvas>');
}

/**
 * loadCache is loading cached weather data from storage, checks if data is not too old
 * and if not populates weather module with required information.
 */
function loadCache() {
    storage.get(['cache', 'cacheTime'], (items) => {
        [today, daily, location] = [items.cache[0], items.cache[1].data, items.cache[2]];
        try {
            // add weather info for current day to module
            $('.currentTemp').append(`<p class="temp" title="${items.cache[0].summary}">
                    ${Math.round(items.cache[0].apparentTemperature)}<i class="wi wi-degrees"></i></p>`);
            $('.location').append(`<p class="loc">${items.cache[2]}</p>`);
            skycons.add(document.getElementById('icon'), items.cache[0].icon);
            /*eslint-disable */
            for (const i in items.cache[1].data) {
                if (parseInt(i) <= DAYS_TO_REPORT) {
                    // get date from received timestamp
                    date = new Date(items.cache[1].data[i].time * 1000).toString().substring(0, 10);
                    // add formated date and skycons to daily overview
                    $(`.daily_${i}`).html(`<p data-date="${date}" class="daily_date">${date}</p><canvas id="icon_${i}" width="30" height="30"></canvas>`);
                    skycons.add(document.getElementById(`icon_${i}`), items.cache[1].data[i].icon);
                }
            }
            /* eslint-enable */
            // Populate the daily info for the tomorrow only
            populateDailyInfo(dailyArr, 0, items.cache[1].data);
            skycons.add(document.getElementById('dailyIcon'), items.cache[1].data[0].icon);
        } catch (error) {
            throw new Error('Caching failed: ');
        }
    });
}

function eventListeners() {
    // Animate weekly report showing
    $('#icon').on('click', (e) => {
        $('#daily').toggleClass('invisible');
        if ($('#daily').hasClass('invisible')) {
            $('#daily').css({
                transform: 'translateX(100%)',
            });
            skycons.pause();
        } else {
            $('#daily').css({
                transform: 'translateX(0%)',
            });
            skycons.play();
        }
    });

    // populate daily info for each day, when user clicks on day <li> element
    $(dailyArr).on('click', function (e) {
        // check for index number of clicked item
        const thisIndex = $(dailyArr).index(this);
        populateDailyInfo(dailyArr, thisIndex, daily);
        // Add skycons
        skycons.add(document.getElementById('dailyIcon'), daily[thisIndex].icon);
    });
}

// DarkSky current weather API call
function weatherAPI(latitude, longitude) {
    // latitude and longitude are accepted arguments and passed once a user has submitted the form.
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const apiCall = `${url + apiKey}/${lat},${lng}/?exclude=alerts,flags,hourly&units=auto&Accept-Encoding:gzip&callback=?`;

    return $.getJSON(apiCall, (forecast) => {});
}

// get User's current location(city, state)
function getAddress(latitude, longitude) {
    return new Promise(((resolve, reject) => {
        const request = new XMLHttpRequest();
        const method = 'GET';
        const lUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${config.gKey}`;
        const async = true;

        request.open(method, lUrl, async);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    const data = JSON.parse(request.responseText);
                    const address = data.results[2].formatted_address;

                    resolve(address);
                } else {
                    reject(request.status);
                }
            }
        };
        request.send();
    }));
}

function weatherReport() {
    // Check HTML5 geolocation.
    if (!navigator.geolocation) {
        $('.location').append('<p>Geolocation is not enabled.</p>');
    }

    // try to populate data from cache if possible
    return new Promise(((resolve, reject) => {
        resolve(cacheCheck());
    })).then((value) => {
        if (value) {
            // populate from cache
            loadCache();
        } else {
            // fetch data from Dark Sky and Google location API
            clearCache(); // clear old cache
            return new Promise(((resolve, reject) => {
                navigator.geolocation.getCurrentPosition((position) => {
                    const [latitude, longitude] = [position.coords.latitude, position.coords.longitude];
                    const currentTemp = weatherAPI(latitude, longitude);
                    const userAddress = getAddress(latitude, longitude);
                    // waiting for all promises to resolve and and assigning them to promise var
                    const promised = Promise.all([currentTemp, userAddress]);

                    if (promised) {
                        resolve(promised);
                    } else {
                        reject(Error(`Error Happened: ${reject.reason}`));
                    }
                });
            })).then((result) => {
                wForecast.push(result[0].currently, result[0].daily, result[1]);
                [daily, today, location] = [wForecast[1].data, wForecast[0], wForecast[2]];
                // store new data to cache
                storeCache(wForecast);
                storage.get(['cache', 'cacheTime'], (items) => {});

                // appending basic data ( current temp, animated icon, and location) to weather section
                $('.currentTemp').append(`<p class="temp" title="${result[0].currently.summary}">
                 ${Math.round(result[0].currently.apparentTemperature)}<i class="wi wi-degrees"></i></p>`);
                $('.location').append(`<p class="loc">${result[1]}</p>`);
                skycons.add(document.getElementById('icon'), result[0].currently.icon);
                /*eslint-disable */
                for (const i in daily) {
                    if (parseInt(i) <= DAYS_TO_REPORT) {
                        // get date from received timestamp
                        date = new Date(daily[i].time * 1000).toString().substring(0, 10);
                        // add formated date and skycons to daily overview
                        $(`.daily_${i}`).html(`<p data-date="${date}" class="daily_date">${date}</p><canvas id="icon_${i}" width="30" height="30"></canvas>`);
                        skycons.add(document.getElementById(`icon_${i}`), daily[i].icon);
                    }
                }
                /* eslint-enable */
                dailyArr = document.querySelectorAll('.forecast');

                // Populate the daily info for the tomorrow only
                populateDailyInfo(dailyArr, 0, daily);
                skycons.add(document.getElementById('dailyIcon'), daily[0].icon);
            }).catch((reason) => {
                throw new Error(reason);
            });
        }
    });
}

// Object for exporting
const func = {
    weatherReport,
    eventListeners,
};
export default func;

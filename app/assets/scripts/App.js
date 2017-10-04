import $ from './vendor/jquery-3.2.1.min';

import func from './modules/_weather';

$(document).ready(function () {
    func.weatherReport();
});

$('.currentTemp').on('click', function (e) {
    var currTemp = $('.currentTemp').text();
    if ($('.unit').hasClass('cel')) {
        $('.temp').html(`${func.cToF(currTemp)}<sup class="frh unit">&#8457;</sup>`);
    } else { 
        $('.temp').html(`${func.fToC(currTemp)}<sup class="cel unit">&#8451;</sup>`);
    }
 })
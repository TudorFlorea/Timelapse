import $ from './vendor/jquery-3.2.1.min';
import func from './modules/_weather';
import quoteGenerator from './modules/_quotes';
import todoFunc from './modules/_todolist';

$(document).ready(function () {
    func.weatherReport();
    quoteGenerator();
    todoFunc();
});

$('.currentTemp').on('click', function (e) {
    var currTemp = $('.currentTemp').text();
    if ($('.unit').hasClass('cel')) {
        $('.temp').html(`${func.cToF(currTemp)}<sup class="frh unit">&#8457;</sup>`);
    } else { 
        $('.temp').html(`${func.fToC(currTemp)}<sup class="cel unit">&#8451;</sup>`);
    }
 })
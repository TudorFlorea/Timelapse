
import $ from './vendor/jquery-3.2.1.min';
import func from './modules/_weather';
import quoteGenerator from './modules/_quotes';
import todoFunc from './modules/_todolist';
import links from './modules/_links';
import mainFocusFeat from './modules/_mainFocus';
import videoFunc from './modules/_timelapse';
import timeFunc from './modules/_time';
import startFunc from './modules/_start';


$(document).ready(() => {
    videoFunc();
    startFunc.start();
    startFunc.eventListeners();
    timeFunc();
    func.weatherReport();
    func.eventListeners();
    quoteGenerator();
    todoFunc();
    links.init();
    mainFocusFeat();
});


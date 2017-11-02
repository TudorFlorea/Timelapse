
import $ from './vendor/jquery-3.2.1.min';
import func from './modules/_weather';
import quoteGenerator from './modules/_quotes';
import todoFunc from './modules/_todolist';
import links from './modules/_links';
import mainFocusFeat from './modules/_mainFocus';
import videoFunc from './modules/_timelapse';


$(document).ready(() => {
    videoFunc();
    func.weatherReport();
    func.eventListeners();
    quoteGenerator();
    todoFunc();
    links.init();
    mainFocusFeat();
});

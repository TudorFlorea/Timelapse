'use strict';

import $ from './vendor/jquery-3.2.1.min';
import func from './modules/_weather';
import quoteGenerator from './modules/_quotes';
import todoFunc from './modules/_todolist';
import links from "./modules/_links";
import mainFocusFeat from "./modules/_mainFocus";


$(document).ready(function () {
    func.weatherReport();
    func.eventListeners();
    quoteGenerator();
    todoFunc();
    mainFocusFeat();
    links.renderCustomLinks();
    links.renderTopSites();
    links.saveLinkEventListner();
    links.init();
});

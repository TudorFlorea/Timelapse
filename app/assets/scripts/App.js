'use strict';

import $ from './vendor/jquery-3.2.1.min';
import func from './modules/_weather';
import quoteGenerator from './modules/_quotes';
import todoFunc from './modules/_todolist';
import links from "./modules/_links";


$(document).ready(function () {
    func.weatherReport();
    func.eventListeners();
    quoteGenerator();
    todoFunc();
    links.init();
});
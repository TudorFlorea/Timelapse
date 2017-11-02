import $ from '../vendor/jquery-3.2.1.min';

function displayCurrentTime() {
    const time = new Date();
    $('#current-time').append(`${time.getUTCHours()}:${time.getUTCMinutes()}`);
}

export default displayCurrentTime

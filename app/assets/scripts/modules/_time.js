import $ from '../vendor/jquery-3.2.1.min';

function timeFunc() {
    const d = new Date();
    const minutes = d.getMinutes().toString().length == 1 ? `0${d.getMinutes()}` : d.getMinutes();
    const hours = d.getHours().toString().length == 1 ? `0${d.getHours()}` : d.getHours();
    const ampm = d.getHours() >= 12 ? 'pm' : 'am';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    $('.js-clock').html(`<p>${hours}:${minutes}<span>${ampm}</span></p>
    <p class="date">${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}</p>`);
}

export default timeFunc;

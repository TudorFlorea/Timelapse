import $ from '../vendor/jquery-3.2.1.min';

const morGreets = ['Rise and shine ', 'Greet the day ', 'Good morning, it is, '];

function start() {
    return new Promise((resolve) => {
        const d = new Date();
        chrome.storage.local.get('userID', (data) => {
            if (data.userID) {
                $('#js-user').text(data.userID);
                if (d.getHours() >= 5 && d.getHours() < 12) {
                    $('#js-daytimeGreet').text(morGreets[Math.floor(Math.random() * 3)]);
                } else if (d.getHours() >= 12 && d.getHours() < 18) {
                    $('#js-daytimeGreet').text('Good afternoon, ');
                } else {
                    $('#js-daytimeGreet').text('Good evening, ');
                }
            } else {
                console.log('No ID!');
                $('.grid__top').hide();
                $('.grid__bottom').hide();
                $('#start__msg').removeClass('invisible');
                $('.start__input').focus();
                // show start msg and set userID
            }
        });
    });
}

function eventListeners() {
    $('.start__button').on('click', () => {
        const name = $('.start__input').val();
        if (name.length >= 2 && name.length <= 16) {
            chrome.storage.local.set({ userID: name });
            window.location.reload();
        } else {
            // TODO
            console.log('Invalid name format');
            window.location.reload();
        }
    });
}

const startFunc = {
    start,
    eventListeners
};

export default startFunc;

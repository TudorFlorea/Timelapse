import $ from '../vendor/jquery-3.2.1.min';

const video = document.getElementById('js-video');
const numOfVideos = 7;

function randomVideo() {
    const randomBg = Math.round((Math.random() * (numOfVideos - 1)) + 1);
    $('#js-video source').attr('src', `assets/images/${randomBg}.mp4`);
    $('#js-video')[0].load();
}
function videoFunc() {
    randomVideo();
    // check for end of the video fade it out and start playing again
    $('#js-video').bind('ended', () => {
        $('.fullscreen-bg').css('opacity', 0.5).animate({ opacity: 1 }, 2000, 'linear');
        video.play();
    });
    // pause video on click
    $('.grid__bottom').on('click', () => {
    /*eslint-disable */
        video.paused ? video.play() : video.pause();
        /* eslint-enable */
    });
    // Set timer to fadeout content if mouse is inactive for 6 seconds
    let timer;
    $(document).mousemove(() => {
        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }
        $('.main_grid').fadeIn('slow', 'linear');
        timer = setTimeout(() => {
            $('.main_grid').fadeOut('slow', 'linear');
        }, 6000);
    });
}

export default videoFunc;

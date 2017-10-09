import $ from '../vendor/jquery-3.2.1.min';

//hide button on load
$("#tweetButton").hide();

// function to load random quotes from json file
function quoteGenerator() {
    $.getJSON("https://gist.githubusercontent.com/dmakk767/9375ff01aff76f1788aead1df9a66338/raw/491f8c2e91b7d3b8f1c8230e32d9c9bc1a1adfa6/Quotes.json%2520", function(inspiringQuotes) {
        // var to randomize order of array indexes
        var random = Math.floor(Math.random() * 101);
        // Load quotes randomly
        $("#quoteText").append(inspiringQuotes[random].quote);
        $("#quoteAuthor").append(`<a href="#">${inspiringQuotes[random].name}</a>`).hide();
    });

    // tweet quotes
    $("#tweetButton").on("click", tweet);

    function tweet() {
        var randomQuote = document.getElementById('quoteText').textContent;
        var randomAuthor = document.getElementById('quoteAuthor').textContent;
        var tweetUrl = ' https://twitter.com/intent/tweet?text=' + encodeURIComponent(randomQuote) + " " + encodeURIComponent(randomAuthor) + " " + "-" + "Turtles 18";
        window.open(tweetUrl);
    }

    //fade in author and twitter icon
    $('.quotesBox').on('mouseover', function() {
        $('#tweetButton').fadeIn("slow").show();
        $('#quoteAuthor').fadeIn("slow").show();
    });
    $('.quotesBox').on('mouseleave', function() {
        $('#tweetButton').fadeOut("slow");
        $('#quoteAuthor').fadeOut("slow");
    });
}

export default quoteGenerator;

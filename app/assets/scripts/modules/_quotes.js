import $ from '../vendor/jquery-3.2.1.min';

//hide button on load
$("#tweetButton").hide();

// function to load random quotes from json file
function quoteGenerator() {
  $.getJSON("https://gist.githubusercontent.com/dmakk767/9375ff01aff76f1788aead1df9a66338/raw/491f8c2e91b7d3b8f1c8230e32d9c9bc1a1adfa6/Quotes.json%2520", function(inspiringQuotes) {
    return new Promise(function(resolve, reject) {
        var quotes = [];
        inspiringQuotes.forEach(function(quote) {
            quote.wikiUrl = "https://en.wikipedia.org/wiki/" + encodeURI(quote.name);
            quotes.push(quote);
        }, this);
        resolve(quotes);
    }).then(function(data) {
        var randomQuote = data[Math.floor(Math.random() * 101)];

        $("#quoteText").append(randomQuote.quote);
        $("#quoteAuthor").append(`<a href="${randomQuote.wikiUrl}" target="_blank">${randomQuote.name}</a>`).hide();
    });
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

import $ from '../vendor/jquery-3.2.1.min';

//hide button on load
$("#tweetButton").hide();

function checkCache(params) {
    return new Promise(function (resolve) {
        chrome.storage.local.get('quotes', function (params) {
            if (params.quotes) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }).catch(function (error) {
        console.log('Quotes cache error: ', error);
    })
};

function evListeners() {
    // tweet quotes
    $("#tweetButton").on("click", tweet);

    //fade in author and twitter icon
    $('.quotesBox').on('mouseover', function () {
        $('#tweetButton').fadeIn("slow").show();
        $('#quoteAuthor').fadeIn("slow").show();
    });
    $('.quotesBox').on('mouseleave', function () {
        $('#tweetButton').fadeOut("slow");
        $('#quoteAuthor').fadeOut("slow");
    });
}

function loadQuotes() {
    chrome.storage.local.get('quotes', function (quotes) {
        displayQuote(quotes.quotes);
    })
}

function tweet() {
    var randomQuote = document.getElementById('quoteText').textContent;
    var randomAuthor = document.getElementById('quoteAuthor').textContent;
    var tweetUrl = ' https://twitter.com/intent/tweet?text=' + encodeURIComponent(randomQuote) + " " + encodeURIComponent(randomAuthor) + " " + "-" + "Turtles 18";
    window.open(tweetUrl);
}

function displayQuote(quote = []) {
    var randomQuote = quote[Math.floor(Math.random() * 102)];
    // Check for unknown authors
    if (randomQuote.name.toLowerCase() === "unknown") {
        $("#quoteText").append(randomQuote.quote);
        $("#quoteAuthor").append(randomQuote.name).hide();
    } else {
        $("#quoteText").append(randomQuote.quote);
        $("#quoteAuthor").append(`<a href="${randomQuote.wikiUrl}" target="_blank">${randomQuote.name}</a>`).hide();
    }
}
// Store quotes to cache
function storeQuotes(quotes) {
    chrome.storage.local.set({
        quotes: quotes
    }, function () {
    });
}

// function to load random quotes from json file
function quoteGenerator() {
    return new Promise(function (resolve) {
        resolve(checkCache());
    }).then(function (cacheStatus) {
        if (cacheStatus) {
            // if there is cached quotes, load them and fire up event listeners
            loadQuotes();
            evListeners();
        } else {
            // else fetch quotes from github gist and load them
            $.getJSON("https://gist.githubusercontent.com/dmakk767/9375ff01aff76f1788aead1df9a66338/raw/491f8c2e91b7d3b8f1c8230e32d9c9bc1a1adfa6/Quotes.json%2520", function (inspiringQuotes) {
                // var to randomize order of array indexes
                return new Promise(function (resolve, reject) {
                    var quotes = [];
                    inspiringQuotes.forEach(function (quote) {
                        quote.wikiUrl = "https://en.wikipedia.org/wiki/" + encodeURI(quote.name);
                        quotes.push(quote);
                    }, this);
                    resolve(quotes);
                }).then(function (data) {
                    // store modified quotes to storage
                    storeQuotes(data);
                    displayQuote(data);
                    evListeners();
                }).catch(err => {
                    console.log(err);
                });
            });
        }
    })
}

export default quoteGenerator;

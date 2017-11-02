import $ from '../vendor/jquery-3.2.1.min';

function mainFocusFeat() {

    var arrayQuotes = ['Way to go!', 'You did it!', 'You rock!']
    var mFocus;
    loadMainFocus();

    // Checks if there is a Main Focus and triggers function if there is
    function loadMainFocus() {
        chrome.storage.sync.get('mainFocus', function (mainFocusStorage) {
            mFocus = mainFocusStorage.mainFocus;
            if (mFocus.length > 0) {
                showMainFocus();
            } else {
                $(".mainFocusInput").show();
                $("#mainFocusList").hide();
                $(".mainFocusInput").val('');
            }
        });
    }

    // Add Main Focus for the day
    $(".mainFocusInput").on("keyup", function (e) {
        var mainFText = $(".mainFocusInput").val();
        if (e.which == 13 && mainFText.length != 0) {
            chrome.storage.sync.get({mainFocus: []}, function (mainFocusStorage) {
                mFocus = mainFocusStorage.mainFocus;
                mFocus = [];
                mFocus.push({
                    'taskForToday': mainFText
                });
                chrome.storage.sync.set({
                    mainFocus: mFocus
                });
                showMainFocus();
            });
        }
    });

    // Display MainFocus
    function showMainFocus() {
        chrome.storage.sync.get('mainFocus', function (mainFocusStorage) {
            mFocus = mainFocusStorage.mainFocus;
        });
        if (mFocus.length > 0) {
            $(".mainFocusInput").hide();
            $("#mainFocusList").html(
                "<li><input class='mFocusStyle' name='checkbox2' type='checkbox'><span>" + mFocus[0].taskForToday + "</span><button id='deleteMainFocus' class='deleteBtnMainFocus'>Delete</button>"
            );
            $("#mainFocusList").show();
        }
    }

    // Function to delete main focus
    $("#mainFocusList").on("click", "button", function () {
        chrome.storage.sync.get('mainFocus', function (mainFocusStorage) {
            chrome.storage.sync.set({'mainFocus': []});
            loadMainFocus();
        });     
    });

    // Function to mark main focus as done
    $(document).on('change', 'input[name="checkbox2"]', function () {
        var input = $(this).next('span');
        if (this.checked) {
            $(input).toggleClass('mainFocusDone');
            chrome.storage.sync.set({'mainFocus': []});
            $('#mainFocusList').fadeOut(2000, function() {
                $(this).hide()});
            setTimeout(function() {
                loadMainFocus();
            }, 2000);
        } 
    })
}

export default mainFocusFeat;
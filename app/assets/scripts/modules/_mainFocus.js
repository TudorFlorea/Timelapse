import $ from '../vendor/jquery-3.2.1.min';

function mainFocusFeat() {

    var mFocus;
    loadMainFocus();

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

    function showMainFocus() {
        chrome.storage.sync.get('mainFocus', function (mainFocusStorage) {
            mFocus = mainFocusStorage.mainFocus;
        });
        if (mFocus.length > 0) {
            $(".mainFocusInput").hide();
            $("#mainFocusList").html(
                "<li><input class='mFocusStyle' type='checkbox'>" + mFocus[0].taskForToday + "<button id='deleteMainFocus' class='deleteBtnMainFocus'>Delete</button>"
            );
            $("#mainFocusList").show();
        }
    }

    $("#mainFocusList").on("click", "button", function () {
        chrome.storage.sync.get('mainFocus', function (mainFocusStorage) {
            chrome.storage.sync.set({'mainFocus': []});
            loadMainFocus();
        });     
    });
}

export default mainFocusFeat;
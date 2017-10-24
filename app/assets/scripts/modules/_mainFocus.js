import $ from '../vendor/jquery-3.2.1.min';

function mainFocusFeat() {

    var mFocus;
    loadMainFocus();

    function loadMainFocus() {
        chrome.storage.sync.get({mainFocus: []}, function (mainFocusStorage) {
            mFocus = mainFocusStorage.mainFocus;
            if (mFocus.length > 0) {
                showMainFocus();
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
            console.log(mFocus);
        });
        $(".mainFocusInput").remove();
        $("#mainFocus").append(
            "<ul id='mainFocusList'><li><input class='mFocusStyle' type='checkbox'>" + mFocus[0].taskForToday + "<button id='deleteMainFocus' class='deleteBtnMainFocus'>Delete</button></ul>"
        );
        $("#mainFocusList").show();
    }

    $("#deleteMainFocus").on("click", function () {
        alert('We have a click');
    });
}

export default mainFocusFeat;
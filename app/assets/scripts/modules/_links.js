/**
 * Created by Tudor on 10/1/2017.
 */ 

import $ from '../vendor/jquery-3.2.1.min';

function getHistory() {

    return new Promise(function (resolve, reject) {
        chrome.history.search({"text": "", "maxResults": 10}, function(results) {
            resolve(results);
        });
    });

}

function getBookmarks() {
    return new Promise(function(resolve, reject) {
        chrome.bookmarks.getTree(function(results) {
            resolve(results);
        });
    });
}

function getStorage() {
    return new Promise(function(resolve, reject) {
       chrome.storage.sync.get(null, function(storage) {
          resolve(storage);
       });
    });
}

function setStorage() {
    let links = {
        "link-1": "www.google.com",
        "link-2": "www.facebook.com"
    };
    chrome.storage.sync.set({links: links}, function () {
        console.log("storage ",links);
    });
}

function saveLink(name, url) {
    chrome.storage.sync.get(null, function(storage) {
        var customLinks = storage.customLinks || [];
        var id = customLinks.length == 0 ? 1 : customLinks[customLinks.length - 1].id + 1;
        customLinks.push({
           "id": id,
           "name": name,
           "url": url
        });

        chrome.storage.sync.set({customLinks: customLinks});

        renderCustomLinks();

    });
}

function printStorage() {
    getStorage().then(function (storage) {
        console.log(storage);
    })
}

function printBookmarks() {
    getBookmarks().then(function(data) {
        console.log(data);
    });
}

function printHistory() {

    getHistory().then(function (data) {
        console.log(data);
        let html = "<ul>";
        for(var i = 0; i < data.length; i++) {
            html += "<li>" + data[i]["title"] + "</li>";

        }
        html += "</ul>";
        console.log(html);
        $("#history").html(html);
    });

}

function linkToggle() {
    $("#links-header").on('click', function() {
       $("#links-wrapper").toggle();
    });
}

function saveLinkEventListner() {
    $("#link-save").on('click', function() {
        let name = $("#link-name").val();
        let url = $("#link-url").val();
        $("#link-name").val("");
        $("#link-url").val("");
        saveLink(name, url);
    });
}

function renderCustomLinks() {
    let html = "";
    getStorage().then(function (storage) {
        let links = storage.customLinks;
        if(links.length > 0) {
            for(let i = 0; i < links.length; i++) {
                html += "<li data-id='" + links[i].id + "'>" + "<a href='" + addProtocol(links[i].url) + "' target='_blank'><span class='link-name'>" + links[i].name + "</span> </a>" + "<span class='delete-link'>x</span>" + "</li>";
            }
            $("#links-list").html(html);
            $(".delete-link").on('click', function() {
                console.log("aa" + $(this).parent().attr('data-id'));
                removeLink($(this).parent().attr('data-id'));
            });
        }
    });

}

function addProtocol(url) {
    var newUrl = url.split(":");
    if(newUrl[0] == 'http' || url[0] == "https") {
        return url;
    } else {
        return "http://" + url;
    }
}

function removeLink(id) {
    chrome.storage.sync.get(null, function(storage) {
        var customLinks = storage.customLinks || [];
        if (customLinks.length > 0) {
           var newLinks = customLinks.filter(function(link){
               return link.id != id;
           });
            chrome.storage.sync.set({customLinks: newLinks});
            renderCustomLinks();
        }



    });
}

function clearStorage() {
    chrome.storage.sync.clear();
    chrome.storage.local.clear();
}



const links = {
    printHistory,
    printBookmarks,
    printStorage,
    setStorage,
    linkToggle,
    saveLinkEventListner,
    clearStorage,
    renderCustomLinks
};

export default links;

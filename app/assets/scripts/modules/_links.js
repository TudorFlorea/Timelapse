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

function setStorage(name, value) {
    let setName = name;
    let setValue = value;
    chrome.storage.sync.set({setName: setValue}, function () {
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
    });
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
    $("#link_save").on('click', function() {
        let name = $("#link_name").val();
        let url = $("#link_url").val();
        $("#link_name").val("");
        $("#link_url").val("");
        saveLink(name, url);
    });
}

function renderCustomLinks() {
    let html = "";
    getStorage().then(function (storage) {
        let links = storage.customLinks;
        if(links != undefined) {
            for(let i = 0; i < links.length; i++) {
                html += "<li data-id='" + links[i].id + "'>" + "<a href='" + addProtocol(links[i].url) + "' target='_blank'><span class='link-name'>" + substr(links[i].name, 20) + "</span> </a>" + "<span class='delete-link'> <i class='fa fa-trash-o' aria-hidden='true'></i></span>" + "</li>";
            }
            $("#custom_links").html(html);
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

function getTopSites() {

    return new Promise(function (resolve, reject) {
        chrome.topSites.get(function (sites) {
            resolve(sites);
        });
    });
}

function renderTopSites() {
    getTopSites().then(function(topSites) {
        let html = "";

        if (topSites.length) {
            // HARDCODED 6 => TODO - make a constant
            for (var i = 0; i < 6; i++) {
                html += '<li><a href="'+ topSites[i].url +'" rel="noreferrer noopener" target="_blank"><img class="link_icon" src="chrome://favicon/size/48/' + topSites[i].url +'" alt="icon placeholder" height="30px" width="30px"><br /><span class="link_title"> ' + substr(topSites[i].title, 7) + "..." + ' </span></a></li>';
            }

            $("#links_list").html(html);
        }


    });
}

function substr(string, length) {
    return string.substring(0, length);
}

function clearStorage() {
        chrome.storage.sync.set({customLinks: []});
    //chrome.storage.sync.clear();
    //chrome.storage.local.clear();
}




const links = {
    printHistory,
    printBookmarks,
    printStorage,
    setStorage,
    linkToggle,
    saveLinkEventListner,
    clearStorage,
    renderCustomLinks,
    renderTopSites
};

export default links;

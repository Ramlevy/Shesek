var bookmarkBar;
chrome.bookmarks.getTree(findRootNode);
var serverAddress = "http://localhost:8080"
var script = document.createElement('script');
script.src = '\jquery-3.3.1.min.js'
script.type = 'text/javascript'
document.getElementsByTagName('head')[0].appendChild(script);

/**
 * This function searches for the root node of the bookmark tree,
 * which is the bookmark bar itself
 * @param {null} rootNodes Just don't put anything as a parameter and it will work
 */
function findRootNode(rootNodes){
    var rootNode;
    if(rootNodes.length > 0){
        rootNode = rootNodes[0];
    }
    // call the function to recursively search the bookmark bar in the entire tree.
    bookmarkBar = findRootNodeRecursive(rootNode, "Bookmarks bar");
}

//recursuve helper method to findRootNode
function findRootNodeRecursive(rootNode, searchString){
    if(rootNode.url){
        return null;
    }
    else if(rootNode.title.indexOf(searchString) >= 0){
        return rootNode;
    }
    for(var i = 0; i < rootNode.children.length; i++ ){
        var dest = findRootNodeRecursive(rootNode.children[i], searchString);
        if(dest){
            return dest;
        }
    }
}

/**
 * This function adds a new bookmark
 * @param {string} title
 * @param {string} url
 */
function addBookmark(title, url){
    var bookmark_title = title;
    var bookmark_url = url;
    chrome.bookmarks.create({title:bookmark_title,parentId:bookmarkBar.id,url:bookmark_url})
}

/**
 * This function deletes all bookmarks from the bookmark bar
 */
function deleteAllBookmarks(){
    var bookmarks = bookmarkBar.children;
    for(var i = 0; i < bookmarks.length; i++ ){
        chrome.bookmarks.remove(bookmarks[i].id);
    }
}

/**
 * This function receives a new json of bookmarks and
 * updates the bookmaek bar according to it
 * @param {JSON} json
 */
function updateBookmarks(json){
    chrome.bookmarks.getTree(findRootNode);
    deleteAllBookmarks();
    json.forEach(bookmark =>  {
        var b_title = bookmark['title'];
        var b_url = bookmark['url'];
        addBookmark(b_title, b_url);
    });
}

function sendData(){
    var bookmarks = JSON.parse(JSON.stringify(bookmarkBar.children));
    bookmarks.forEach(bookmark => {
        delete bookmark['dateAdded'],
        delete bookmark['id'],
        delete bookmark['parentId']
        });
    var json = JSON.stringify(bookmarks)

    $.post(
        serverAddress,
        json,
        function(data, status){
            console.log("Data: " + data + "\nstatus: " + status)
        }
    );

}

function getData(){
    $.get(
        serverAddress,
        function(data, status){
            console.log(status)
            updateBookmarks(JSON.parse(data))
        }
    );
}

chrome.windows.onCreated.addListener(function(){
    getData();
})
chrome.windows.onRemoved.addListener(function(){
    sendData();
})
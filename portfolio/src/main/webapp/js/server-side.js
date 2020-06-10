//*********************** SERVER-SIDE ***********************
let numEls = 12;
let jsonArray = [];

/**
 * Grabs the comments from the server
 */ 
async function getCommentsFromServer() {
    const response = await fetch('/data');
    const value = await response.json();
    jsonArray = value;
    populateComments(value, numEls);
}

/**
 * Deletes all entries in the database
 * (NOT ACCESSIBLE VIA USER INTERFACE)
 */ 
async function deleteAndFetchEmpty() {
    // Delete data
    var init = {method: 'POST'};
    const deleteRequest = new Request('/delete-data', init);
    const deleteResponse = await fetch(deleteRequest);

    // Fetch empty db
    const grabResponse = await fetch('/data');
    const value = await grabResponse.text();
    document.getElementById("form-container").innerText = value;
}

/**
 * Authentication
 */ 
async function displayAuth(){
     const response = await fetch('/auth');
     const value = await response.text();
     if (value.localeCompare("logged") == 0){
         removeClass("chart-container", "blur-content");
     }
     document.getElementById("authentication").innerHTML = value;
}


//*********************** JSON CONVERSION ***********************
/**
 * Creates comment elements from the JSON array
 * @param {object} jsonArray - JSON array passed in to get information.
 * @param {number} num - number of comment elements to be created
 */
function populateComments(jsonArray, num) {
    for (var i = 0; i < num; i++) {
        let value = jsonArray.shift();
        createCommentElement(value);
    }
    numEls = numEls > jsonArray.length ? jsonArray.length : numEls;
}

/**
 * Creates a comment element from values in the JSON object
 * @param {object} object - Creates a DOM comment element from JSON object.
 */
function createCommentElement(object) {
    const newComment = document.createElement('div');
    newComment.setAttribute('class', 'comments');

    const newCommentHeader = document.createElement('div');
    newCommentHeader.setAttribute('class', 'comment-header');

    const newCommentName = document.createElement('p');
    newCommentName.setAttribute('class', 'comment-header-els');
    newCommentName.textContent = object.name;

    const newSeparator = document.createElement('p');
    newSeparator.setAttribute('class', 'comment-header-els');
    newSeparator.textContent = "|";

    const newCommentDate = document.createElement('p');
    newCommentDate.setAttribute('class', 'comment-header-els comment-ts');
    var s = new Date(object.timestamp).toLocaleDateString("en-US");
    newCommentDate.textContent = s;

    const newCommentBody = document.createElement('div');
    newCommentBody.setAttribute('class', 'comment-body');

    const newCommentBodyEl = document.createElement('p');
    newCommentBodyEl.setAttribute('class', 'comment-body-el');
    newCommentBodyEl.textContent = object.message;

    newCommentHeader.appendChild(newCommentName);
    newCommentHeader.appendChild(newSeparator);
    newCommentHeader.appendChild(newCommentDate);

    newCommentBody.appendChild(newCommentBodyEl);

    newComment.appendChild(newCommentHeader);
    newComment.appendChild(newCommentBody);

    document.getElementById('form-container').appendChild(newComment);
}
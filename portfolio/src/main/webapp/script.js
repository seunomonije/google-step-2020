// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//*********************** ENVIRONMENT VARIABLES ***********************
let listenNext = null;
let retrievedInput = null;
let match_index = 0;
let matchingNodes = null;

//*********************** RANDOM GREETINGS ***********************

/**
 * Adds a random greeting to the page.
 */
function addRandomGreeting() {
  const greetings =
      ['Hello world!', '¡Hola Mundo!', '你好，世界！', 'Bonjour le monde!', 'Computa beast!'];

  // Pick a random greeting.
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Add it to the page.
  const greetingContainer = document.getElementById('greeting-container');
  greetingContainer.innerText = greeting;
}

//*********************** PAGE HANDLING ***********************
/**
 * Displays the right sidebar
 */
let isSidebarOpen = false;
function toggleSidebar(){
    let button = document.getElementById("commentbutton");
    let el = document.getElementById("sidebar");
    if (isSidebarOpen === true){
        openSidebar(el, button);
    } else {
        closeSidebar(el, button);
    }
    isSidebarOpen = !isSidebarOpen;
}

function closeSidebar(el, button){
    el.style.width = "0px";
    button.innerText = "Show comments!";
    button.classList.remove('closeButton');
}

function openSidebar(el, button){
    el.style.width = "550px";
    button.innerText = "Close";
    button.classList.add('closeButton');
}

//*********************** LOADING SCREEN ***********************

/**
 * Sets elements to visible or not.
 * @param {string} id - The id of the HTML element.
 * @param {bool} bool - true to hide, false to show
 */
function setHidden(selector, bool) {
    const el = document.getElementById(selector);
    el.classList.toggle('hidden', bool);
}

/**
 * Gets rid of the loading screen and displays the page
 */
function swapLoaderForContent(){
    setHidden('header', false);
    setHidden('content', false);
    setHidden('loaderid', true);
}

//*********************** SEARCH BAR FUNCTIONS ***********************

window.onload = function(){
    swapLoaderForContent(); // displays page after loaded

    // Next button event listener, always active
    listenNext = document.getElementById("nextbutton");
    listenNext.addEventListener("click", searchHandler);

    //Runs search on enter
    document.getElementById('searchbar').onkeydown = function(e){
        if(e.key === "Enter"){
            // i only want single word alphanumerics to go through
            retrievedInput = document.getElementById('searchbar').value;
            const regex = new RegExp(/^[a-z0-9]+$/i);
            if (regex.test(retrievedInput) === false){
                shakeSearchBar();
            } else {
                search(retrievedInput);
            }
        }
    };
}

/**
 * Handler function for the event listener
 */
function searchHandler(){
    highlightHandler(matchingNodes, retrievedInput, match_index);
}

/**
 * Code to shake the search bar and make it glow
 * Calls a bunch of css transforms
 */
function shakeSearchBar(){
    const el = document.getElementById('searchbar');
    el.classList.add('searchbarglow');
    el.onanimationend = () => { el.classList.remove('searchbarglow') };
}

//*********************** SEARCH IMPLEMENTATION ***********************

/**
 * Finds all the occurences of a substring in a string
 * @param {string} substr - The substring to search for.
 * @param {string} str - The larger string to be combed through.
 */
function findSubstringIndices(substr, str) {
    // no lowercase causes issues with finding the index
    substr = substr.toLocaleLowerCase();
    str = str.toLocaleLowerCase();

    const substrLen = substr.length;
    if (substrLen === 0) return [];

    let startIndex = 0;
    let index = 0;
    const indices = [];

    while ((index = str.indexOf(substr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + substrLen;
    }

    return indices;
}

/**
 * Walks the tree and finds matches,
 * returns index array of matches.
 * Will optimize to gather straight from tree
 * rather than push into new arr to save space
 * @param {object} root - The starting point of the tree.
 * @param {string} text - The string to be match.
 */
function findTextNodesWithText(root, text){
    let matches = []; 

    let all = []; // queue
    all.push(root);

    while(all.length !== 0){
        let cur = all.shift();

        // Locates text nodes. Text nodes have no child nodes. 
        if (cur.nodeType==3){
            const regex = new RegExp(text, "i");
            if (regex.test(cur.textContent) === true){
                matches.push(cur);
                continue;
            }
        }

        if (!cur) continue;
        if (!cur.childNodes) continue;

        if (cur.childNodes.length > 0){
            for (let i = 0; i < cur.childNodes.length; i++){
                all.push(cur.childNodes[i]);
            }
        }

    }

    return matches;
}

/**
 * Clears the current highlighted text nodes
 * Will optimize to actually remove the span rather than the class
 */
function clearHighlightedMatches(){
    let highlightedList = document.querySelectorAll('.highlight');

    highlightedList.forEach(function(el) {
        el.replaceWith(el.innerText);
    });
}

/**
 * Handles clearing old nodes and end of search run,
 * as well as calls the highlighting and scrolling fns
 * @param {object} matches - Array of matching nodes in DOM tree.
 * @param {string} input - Input retrieved from search.
 * @param {number} index - Points to the node in the array we want to highlight.
 */
function highlightHandler(matches, input, index){
    if (index === matches.length && index != 0){
        clearHighlightedMatches();
        setHidden('nextbutton', true);
        match_index = 0; // resetting the index
        document.body.scrollIntoView({behavior: "smooth"}); // back to the top
        return;
    }

    if (index > 0){
        clearHighlightedMatches();
    }
    
    // highlight and scroll to every element
    highlighter(matches[index], input);
    
    let els = document.getElementsByClassName('highlight');
    els[0].scrollIntoView({behavior: "smooth"}); 

    match_index++; // go onto the next value
}

/**
 * Highlights a given text node
 * @param {object} node - The node in the tree I'm highlighting.
 * @param {string} input - The string from the searchbar, used to find matches in node.
 */
function highlighter(node, input){
    const nodeText = node.textContent;

    let foundIndices = findSubstringIndices(input, nodeText);

    if (foundIndices === [] || foundIndices === null){
        return;
    }

    let regex = new RegExp(input, "i");
    let fragments = nodeText.split(regex);

    let rejoinedNode = [];
    for (let i = 0; i < fragments.length-1; i++){
        rejoinedNode.push(fragments[i]);
        rejoinedNode.push(createNodeFromIndexArr(i, input, foundIndices, node));
    }
    rejoinedNode.push(fragments[fragments.length-1]);

    node.replaceWith(...rejoinedNode);
}

/**
 * Creates a span-wrapped node from a given array of indexes
 * @param {number} index - The index of the array of indices of matches.
 * @param {string} input - String from searchbar, length is used to grab substring.
 * @param {object} foundIndices - Indices of matching substrings in text node.
 * @param {object} node - The text node itself.
 */
function createNodeFromIndexArr(index, input, foundIndices, node){
    if (index > foundIndices.length-1){
        throw "Error in implementation, should never get here";
    }

    let highlightedString = node.textContent.substring(
        foundIndices[index], input.length+foundIndices[index]);
    const newNode = document.createElement('span');
    newNode.setAttribute('class', 'highlight');
    newNode.textContent = highlightedString;

    return newNode;
}

/**
 * Sets the stage for the actual search to take place,
 * handles gathering data and checks criteria are met
 * @param {string} retrievedInput - The input in the search bar.
 */
function search(retrievedInput){ 
    matchingNodes = findTextNodesWithText(document.body, retrievedInput);

    //show the next button
    setHidden('nextbutton', false);

    if (matchingNodes.length === 0){
        setHidden('nextbutton', true);
        shakeSearchBar();
        return;
    }

    return; //success
}

//*********************** SERVER-SIDE ***********************
async function getFromServer() {
    const quantity = document.getElementById('quantity').value;
    const response = await fetch(`/data?quantity=${quantity}`);
    const value = await response.text();
    document.getElementById("form-container").innerText = value;
}

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

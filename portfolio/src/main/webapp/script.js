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

//*********************** LOADING SCREEN ***********************

/**
 * Sets elements to visible or not.
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

// env variables
let listenNext = null;
let retrievedInput = null;
let match_index = 0;
let matchingNodes = null;

//*********************** SEARCH BAR FUNCTIONS ***********************

window.onload = function(){
    swapLoaderForContent(); // displays page after loaded

    // Next button event listener, always active
    listenNext = document.getElementById("nextbutton");
    listenNext.addEventListener("click", searchHandler);


    //Runs search on enter
    document.getElementById('searchbar').onkeydown = function(e){
        if(e.keyCode == 13){
            // i only want single word alphanumerics to go through
            retrievedInput = document.getElementById('searchbar').value;
            const regex = new RegExp(/^[a-z0-9]+$/i);
            if (regex.test(retrievedInput) === false){
                shakeSearchBar();
            } else {
                searchSetup();
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
    el.preventDefault;
    el.classList.remove('searchbarglow')
    void el.offsetWidth;
    el.classList.add('searchbarglow');
}


//*********************** SEARCH IMPLEMENTATION ***********************


/**
 * Finds all the occurences of a substring in a string
 */
function findNeedleInHaystack(small, big) {
    // no lowercase causes issues with finding the index
    small = small.toLocaleLowerCase();
    big = big.toLocaleLowerCase();

    let smallLen = small.length;
    if (smallLen === 0) return [];

    let startIndex = 0, index, indices = [];

    while ((index = big.indexOf(small, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + smallLen;
    }

    return indices;
}

/**
 * Walks the tree and finds matches,
 * returns index array of matches.
 * Will optimize to gather straight from tree
 * rather than push into new arr to save space
 */
function htmlWalkerandMatcher(node, input){
    let all = [];

    for (node= node.firstChild; node; node=node.nextSibling){
        if (node.nodeType==3){ //if a text node
            const regex = new RegExp(input, "i");
            if (regex.test(node.textContent) == true){
                all.push(node);
            }
        } else {
            all = all.concat(htmlWalkerandMatcher(node, input));
        }
    }

    return all;
}

/**
 * Clears the current highlighted text nodes
 * Will optimize to actually remove the span rather than the class
 */
function clear(){
    let highlightedList = document.querySelectorAll('.highlight');

    highlightedList.forEach(function(el) {
        el.replaceWith(el.innerText);
    });
    
}

/**
 * Handles clearing old nodes and end of search run,
 * as well as calls the highlighting and scrolling fns
 */
function highlightHandler(matches, input, index){
    if (index === matches.length && index != 0){
        clear();
        setHidden('nextbutton', true);
        match_index = 0; // resetting the index
        document.body.scrollIntoView({behavior: "smooth"}); // back to the top
        return;
    }

    if (index > 0){
        clear();
    }
    
    console.log(index);
    console.log(matches);
    console.log(matches[index]);

    // highlight and scroll to every element
    highlighter(matches[index], input);
    
    console.log(matches[index]);

    let els = document.getElementsByClassName('highlight');
    els[0].scrollIntoView({behavior: "smooth"}); 

    match_index++; // go onto the next value
}


/**
 * Highlights a given text node
 */
function highlighter(node, input){
    const nodeText = node.textContent;

    let foundIndices = findNeedleInHaystack(input, nodeText);

    console.log(foundIndices);
    if (foundIndices == [] || foundIndices == null){
        throw "error with found indices";
    }

    let stringBefore = nodeText.substring(0, foundIndices[0]);
    let stringAfter = nodeText.substring(input.length+foundIndices[0]);
    let highlightedString = nodeText.substring(foundIndices[0], input.length+foundIndices[0]);
    
    let fragments = nodeText.split(highlightedString);

    const newNode = document.createElement('span');
    newNode.setAttribute('class', 'highlight');
    newNode.textContent = highlightedString;

    for (let i = 1; i < fragments.length; i+=2){
        fragments.splice(i, 0, newNode);
    }

    //node.replaceWith(...fragments);
    node.replaceWith(stringBefore, newNode, stringAfter);
}

/**
 * Sets the stage for the actual search to take place,
 * handles gathering data and checks criteria are met
 */
function searchSetup(input){ 
    matchingNodes = htmlWalkerandMatcher(document.body, retrievedInput);

    //show the next button
    setHidden('nextbutton', false);

    if (matchingNodes.length == 0){
        setHidden('nextbutton', true);
        shakeSearchBar();
        return;
    }

    return; //success
}


//*********************** SERVER-SIDE ***********************
async function getFromServer() {
    const response = await fetch('/data');
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

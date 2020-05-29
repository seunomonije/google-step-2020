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

// clone the document
var documentCopy = null; 

//*********************** SEARCH BAR FUNCTIONS ***********************

window.onload = function(){
    documentCopy = document.cloneNode(true);    //storing initial doc
    swapLoaderForContent();

    //Runs search on enter
    document.getElementById('searchbar').onkeydown = function(e){
        if(e.keyCode == 13){

            //i only want single word alphanumerics to go through
            var retrievedInput = document.getElementById('searchbar').value;
            const regex = new RegExp(/^[a-z0-9]+$/i);
            if (regex.test(retrievedInput) === false){
                console.log("nottoday");
                shakeSearchBar();
            } else {
            runSearch(document.getElementById('searchbar')
                .value.toLocaleLowerCase());
            }
        }
    };
}

/**
 * Code to shake the search bar
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
 * Gets the indices of matches
 */
function getIndicesOf(small, big) {

    //no lowercase causes issues with finding the index
    small = small.toLocaleLowerCase();
    big = big.toLocaleLowerCase();

    var smallLen = small.length;
    if (smallLen == 0) {return [];}

    var startIndex = 0, index, indices = [];

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
function treeWalker(node, input){
    var all = [];

    for (node= node.firstChild; node ; node=node.nextSibling){
        if (node.nodeType==3){
            all.push(node);
        } else {
            all = all.concat(treeWalker(node, input));
        }
    }

    //find matches
    var indexArr = [];
    for (var i = 0; i < all.length; i++){
        const regex = new RegExp(input, "i");
        if (regex.test(all[i].textContent) == true){
            indexArr.push(all[i]);
        }
    }

    return indexArr;
}

/**
 * Clears the current highlighted text nodes
 * Will optimize to actually remove the span rather than the class
 */
function clear(){

    var highlightedList = document.querySelectorAll('.highlight');

    highlightedList.forEach(function(el) {
        el.classList.remove('highlight');
    });
    
}

/**
 * Handles clearing old nodes and end of search run,
 * as well as calls the highlighting and scrolling fns
 */
function treeWalkerHelper(matches, input, index){

    if (index === matches.length && index != 0){
        clear();
        setHidden('nextbutton', true);
        document.body.scrollIntoView({behavior: "smooth"}); //back to the top
        return;
    }

    if (index > 0){
        clear();
    }

    console.log(matches[index]);
    highlighter(matches[index], input);

    var els = document.getElementsByClassName('highlight');
    els[0].scrollIntoView({behavior: "smooth"}); 
}

/**
 * Highlights a given text node
 */
function highlighter(node, input){

    try {
        var foundIndices = getIndicesOf(input, node.textContent);
    } catch(err) {
        console.log("indices" + foundIndices);
    }

    var stringBefore = node.textContent.substring(0, foundIndices[0]);
    var stringAfter = node.textContent.substring(input.length+foundIndices[0]);
    var highlightedString = node.textContent.substring(foundIndices[0], input.length+foundIndices[0]);
    
    var newNode = document.createElement('span');
    newNode.setAttribute('class', 'highlight');
    newNode.textContent = highlightedString;

    node.replaceWith(stringBefore, newNode, stringAfter);
}

/**
 * Walks the tree to find matches, displays the next button,
 * runs the search for each match
 */
function runSearch(input){
    
    var matchingNodes = treeWalker(document.body, input);

    //show the next button
    setHidden('nextbutton', false);

    if (matchingNodes.length == 0){
        setHidden('nextbutton', true);
        shakeSearchBar();
        return;
    }

    var counter = 0;
    //Enter searching mode
    var el = document.getElementById("nextbutton");
    el.addEventListener("click", function(){ 
        treeWalkerHelper(matchingNodes, input, counter);
        counter++;
    });

    return; //success
}
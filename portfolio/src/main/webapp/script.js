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
 * Gets the html and returns it in lowercase
 * WILL AMEND WITH REGEX
 */
function retrieveHtml(){

    var source = documentCopy.body.innerHTML;

    if (source != null){
        //toLocaleLowerCase() to ignore caps
        return source.toLocaleLowerCase(); 
    } else {
        alert("source is null");
    }
}


/**
 * Finds the closest tag before the provided index in html text
 */
function getClosestTag(index, source){
    while (source.charAt(index) != '>'){
        if (index == 0){
            alert("index hit 0");
            break;
        }
        index--;
    }

    var endIndex = index+1; //plus 1 to account for bracket

    while (source.charAt(index) != '<'){
        index--;
    }

    var startIndex = index;

    return source.substring(startIndex, endIndex);
}

/**
 * Parses through html tag to get id
 */
function getTags(array, source){
    var retArr = [];
    console.log("array" + array);
    for (var i = 0; i < array.length; i++){
        retArr.push(getClosestTag(array[i], source)); 
    }

    return retArr;
}

/**
 * Gets the indices of matches
 */
function getIndicesOf(small, big) {

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
 * Scans given tag and extracts the id string
 */
function retrieveId(string, source){
    var searchForId = string.search("id=\"");
    if (searchForId == -1){
        return "nothing";
    }
    const startIndex = searchForId+4;
    var retString = string.charAt(startIndex);

    for(var i = startIndex+1; string.charAt(i) != "\""; i++){
        retString += string.charAt(i);
    }

    return retString;
}

/**
 * Get's all id's from a given tag array
 */
function getIds(array, source){
    var retArr = [];
    for (var i = 0; i < array.length; i++){
        var retriever = retrieveId(array[i], source);
        if (retriever === "nothing"){
            continue;
        } else {
            retArr.push(retriever);
        }
    }

    return retArr;
}

/**
 * Counts the number of duplicate elements in an array
 * NOT USED
 */
function getCounts(array){

    var counts = {};
    array.forEach(function(x) { 
        counts[x] = (counts[x] || 0) + 1; 
    });
    
    return counts;
}

/**
 * Wraps each matching element in a div in a span class
 */
function wrapInSpan(div, wantedWord) {

	var div = document.getElementById(div);
    var text = div.innerHTML.toLocaleLowerCase();

    //split spaces, commas, quotes
    var wordArr = text.split(/[\s,"]+/);

    text = [];
    wordArr.forEach(function(el) {
        if(el.includes(wantedWord)){    
            el = '<span class="highlight" id="spanned">' + el + '</span>';
        }
        text.push(el);
    });

    text = text.join(' ');
    div.innerHTML = text;
}


/**
 * Handles physically highlighting each match and clearing matches prior
 */
function runHighlights(ids, highlightedWord, src, index){
    newids = removeDuplicates(ids);

    //if done with all matches
    if (index === newids.length){
        clearDivAtIndex(newids[index-1]);
        setHidden('nextbutton', true);
        document.body.scrollIntoView({behavior: "smooth"}); //back to the top
        return;
    }
    
    //clear the prior div
    if (index > 0){
        clearDivAtIndex(newids[index-1]);
    }

    wrapInSpan(newids[index], highlightedWord);

    // no support for safari or ie
    document.getElementById(newids[index]).scrollIntoView({behavior: "smooth"}); 
}

/**
 *  Reverts given div back to original source code
 */
function clearDivAtIndex(div){
    document.getElementById(div).innerHTML = documentCopy.getElementById(div).innerHTML; 
}

/**
 *  Removes duplicates in an array
 */
function removeDuplicates(array){
    newArr = [...new Set(array)];
    return newArr;
}



function runSearch(input){
    
    var matchingNodes = treeWalker(document.body, input);

    //show the next button
    setHidden('nextbutton', false);

    var counter = 0;
    console.log(matchingNodes);
    if (matchingNodes.length == 0){
        setHidden('nextbutton', true);
        shakeSearchBar();
        return;
    }

    //Enter searching mode
    var el = document.getElementById("nextbutton");
    console.log(matchingNodes);
    el.addEventListener("click", function(){ 
        treeWalkerHelper(matchingNodes, input, counter);
        counter++;
    });

    return; //success
}

/**
 * EXPERIMENTAL -- for use in walking the tree
 */
function textNodesUnder(node){
  var all = [];
  for (node=node.firstChild;node;node=node.nextSibling){
    if (node.nodeType==3) all.push(node);
    else all = all.concat(textNodesUnder(node));
  }
  return all;
}

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

//going to modify this so that it's not writing an insane number of spans
function clear(){

    var highlightedList = document.querySelectorAll('.highlight');

    highlightedList.forEach(function(el) {
        el.classList.remove('highlight');
    });
    
}

function treeWalkerHelper(matches, input, index){

    console.log(index);
    if (index === matches.length && index != 0){
        clear();
        setHidden('nextbutton', true);
        document.body.scrollIntoView({behavior: "smooth"}); //back to the top
        return;
    }

    if (index > 0){
        clear();
    }

    highlighter(matches[index], input);

    var els = document.getElementsByClassName('highlight');
    els[0].scrollIntoView({behavior: "smooth"}); 
}

function highlighter(node, input){

    console.log()
    console.log(node.textContent);
    var foundIndices = getIndicesOf(input, node.textContent);
    
    var stringBefore = node.textContent.substring(0, foundIndices[0]);
    var stringAfter = node.textContent.substring(input.length+foundIndices[0]);
    var highlightedString = node.textContent.substring(foundIndices[0], input.length+foundIndices[0]);
    
    var newNode = document.createElement('span');
    newNode.setAttribute('class', 'highlight');
    newNode.textContent = highlightedString;

    node.replaceWith(stringBefore, newNode, stringAfter);

}

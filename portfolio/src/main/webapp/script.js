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
function setVisible(selector, bool) {
    const el = document.getElementById(selector);
    el.classList.toggle('hiddenclass', bool);
}

function swapLoaderForContent(){
    setVisible('header', false);
    setVisible('content', false);
    setVisible('loaderid', true);
}

//*********************** SEARCH BAR FUNCTIONS ***********************

window.onload = function(){
    swapLoaderForContent();
    document.getElementById('searchbar').onkeydown = function(e){
        if(e.keyCode == 13){
            runSearch(document.getElementById('searchbar').value.toLocaleLowerCase());
        }
    };
}



//*********************** SEARCH IMPLEMENTATION ***********************

function retrieveHtml(){
    var source = document.body.innerHTML;

    if (source != null){
        return source.toLocaleLowerCase();    //toLocaleLowerCase() to ignore caps
    } else {
        alert("source is null");
    }
}


//js is pass by value so no need for a copy
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

function getTags(array, source){
    var retArr = [];
    console.log("array" + array);
    for (var i = 0; i < array.length; i++){
        retArr.push(getClosestTag(array[i], source)); 
    }
    console.log(retArr);
    return retArr;
}

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
    console.log(retArr);
    return retArr;
}

function runSearch(input){  //returns an array of [id, index]

    var source = retrieveHtml();

    var foundIndices = getIndicesOf(input, source);
    if (foundIndices == []){
        alert("Invalid input");
        return;
    }


    var tags = getTags(foundIndices, source); 
    var ids = getIds(tags, source);

    if(ids == []){
        alert("no gotten Ids");
        return;
    }

    runHighlights(ids, input);

    return;
}

function getCounts(array){  //counts the number duplicate elements in an array

    var counts = {};
    array.forEach(function(x) { 
        counts[x] = (counts[x] || 0) + 1; 
    });
    
    return counts;
}

function wrapWords(str, tmpl) {
  return str.replace(/\w+/g, tmpl || "<span>$&</span>");
}

function wrapInSpan(div, wantedWord) {
	var paragraph = document.getElementById(div);
    var text = paragraph.innerHTML;

    var wordArr = text.split(' ');
    text = [];
    wordArr.forEach(function(el) {
        if(el === wantedWord)
            el = '<span class="matched">' + el + '</span>';
        text.push(el);
    });
    console.log(text);
    text = text.join(' ');
    paragraph.innerHTML = text;
}

function runHighlights(ids, highlightedWord){   //for some reason this will not run multiple times, need to investigate
    
    var countObject = getCounts(ids);

    // var div = document.getElementById(ids[0]);
    // div.innerHTML = div.innerHTML.replace(/(^|<\/?[^>]+>|\s+)([^\s<]+)/g, '$1<span class="word">$2</span>');  //wraps every word within a span

    var div = document.getElementById(ids[0]);
    div.innerHTML = wrapWords(div.innerHTML);
    console.log(div);

    for (let [key, value] of Object.entries(countObject)) {
        if (value > 0){

        }
    }

    return;
}



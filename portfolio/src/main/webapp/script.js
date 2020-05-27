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

window.onload = swapLoaderForContent;




//*********************** SEARCH IMPLEMENTATION ***********************

function retrieveHtml(){
    var source = document.body.innerHTML;

    if (source != null){
        return source.toLowerCase();    //toLowerCase() to ignore caps, potentially problematic with symbols?
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

    return source.substring(startIndex, endIndex)

}

function retrieveId(string, source){

    var searchForId = string.search("id=\"");
    if (!searchForId){
        return;
    }
    const startIndex = searchForId+4;
    var retString = string.charAt(startIndex);

    for(var i = startIndex+1; string.charAt(i) != "\""; i++){
        retString += string.charAt(i);
    }

    return retString;
}

function runSearch(input){

    var source = retrieveHtml();

    var foundIndex = source.indexOf(input);
    if (foundIndex == -1){return};

    var closestTag = getClosestTag(foundIndex, source); 
    var gottenId = retrieveId(closestTag, source);


    if(gottenId == null){
        alert("gottenId == null");
        return;
    }
    document.getElementById(gottenId).scrollIntoView({behavior: "smooth"}); // no support for safari or ie
    

}



/*
 * Name: Toby Jay
 * Date: October 25, 2020
 * Section: CSE 154 AI
 *
 * This is the JS to implement the set game website. more?
 */

"use strict";

(function() {
  const STYLE = ["solid", "outline", "striped"];
  const SHAPE = ["diamond", "oval", "squiggle"];
  const COLOR = ["green", "purple", "red"];
  const COUNT = ["1", "2", "3"];
  const STANDARD_CARDS = 12;
  const EASY_CARDS = 9;
  const NUMBER_OF_ATTRIBUTES = 4;
  const SECONDS_INNA_MINUTE = 60;
  const ONE_SECOND = 1000;
  const ATTRIBUTE_OPTIONS = 3;
  const CARDS_INNA_SET = 3;

  let timerId;
  let remainingSeconds;
  let totalCards;

  window.addEventListener("load", init);

  /**
   * Runs when the window is loaded. Makes the start button back button and the refresh button
   * clickable. These transfer between game and main menus and refresh the cards on the board.
   */
  function init() {
    let startBtn = id("start-btn");
    let backBtn = id("back-btn");
    let refreshBtn = id("refresh-btn");
    startBtn.addEventListener("click", startGame);
    backBtn.addEventListener("click", backToMain);
    refreshBtn.addEventListener("click", refresh);
  }

  /**
   * This is run whenever the start button is pressed. It begins the game and fills the set board
   * and begins the timer.
   */
  function startGame() {
    startTimer();
    toggleViews();
    id("refresh-btn").disabled = false;
    let isEasy = qs("input").checked;
    if (isEasy) {
      totalCards = EASY_CARDS;
    } else {
      totalCards = STANDARD_CARDS;
    }
    refresh();
  }

  /**
   * This toggles between the main and game menus.
   */
  function toggleViews() {
    id("menu-view").classList.toggle("hidden");
    id("game-view").classList.toggle("hidden");
  }

  /**
   * This resets the game when you return to the main menu. It clears the board and the timer.
   * It also resets the set count to 0. It also runs toggleViews which causes you to return to menu.
   */
  function backToMain() {
    toggleViews();
    id("refresh-btn").disabled = false;
    id("set-count").textContent = "0";
    if (remainingSeconds > 0) {
      endGame();
    }
    id("board").innerHTML = "";
  }

  /**
   * When the refresh button is clicked this is run. It eliminates all cards on the board and
   * replaces them with a random new selection of cards.
   */
  function refresh() {
    id("board").innerHTML = "";
    for (let i = 0; i < totalCards; i++) {
      id("board").appendChild(generateUniqueCard(totalCards === EASY_CARDS));
    }
  }

  /**
   * This generates an array with randomized style shape color and count attributes. In the case
   * that isEasy is true the style will always be solid, instead of being randomly selected.
   * @param {boolean} isEasy - true if the game is in easy mode
   * @returns {Array} - randomly generated string array
   */
  function generateRandomAttributes(isEasy) {
    let randCard = [];
    let rand = Math.floor(Math.random() * ATTRIBUTE_OPTIONS);
    if (isEasy) {
      rand = 0;
    }
    for (let i = 0; i < NUMBER_OF_ATTRIBUTES; i++) {
      randCard[i] = rand;
      rand = Math.floor(Math.random() * ATTRIBUTE_OPTIONS);
    }
    return sortArray(randCard);
  }

  /**
   * Transforms the integer array into an array of strings with the attributes of style shape color
   * and count.
   * @param {Array} randCard - array of integers
   * @returns {Array} - array of strings
   */
  function sortArray(randCard) {
    randCard[0] = STYLE[randCard[0]];
    randCard[1] = SHAPE[randCard[1]];
    randCard[2] = COLOR[randCard[2]];
    randCard[3] = COUNT[randCard[3]];
    return randCard;
  }

  /**
   * Creates a unique card not on the current board. Returns this as a div element.
   * @param {boolean} isEasy - boolean that is true when game is in easy mode
   * @returns {object} - DOM object representing one card
   */
  function generateUniqueCard(isEasy) {
    let newCard = document.createElement("div");
    newCard.classList.add("card");
    newCard.addEventListener("click", cardSelected);
    let cardId = generateRandomAttributes(isEasy);
    while (!isUnique(cardId)) {
      cardId = generateRandomAttributes(isEasy);
    }
    newCard.id = arrayToText(cardId, NUMBER_OF_ATTRIBUTES);
    for (let i = 0; i < parseInt(cardId[3]); i++) {
      let img = document.createElement("img");
      img.src = "img/" + arrayToText(cardId, NUMBER_OF_ATTRIBUTES - 1) + ".png";
      img.alt = arrayToText(cardId, NUMBER_OF_ATTRIBUTES);
      newCard.appendChild(img);
    }
    return newCard;
  }

  /**
   * transforms the given array and returns it as a string with dashes in betweeen the indecies.
   * The given index parameter indicates how many indecies of your matrix it will put into the
   * string starting from the 0 index. ie it cuts off the later indecies if you put a number less
   * than the length of the array.
   * @param {Array} array - takes in an array usually of strings
   * @param {integer} index - takes in total number of indecies to be in the string.
   * @returns {string} - returns string with dashes seperating each word or previous array values.
   */
  function arrayToText(array, index) {
    let stringForm = array[0];
    for (let i = 1; i < index; i++) {
      stringForm = stringForm + "-" + array[i];
    }
    return stringForm;
  }

  /**
   * begins the timer. Is executed whenever the start button is pressed. Length of timer depends
   * upon selected value by the user. 1, 3 or 5 minutes.
   */
  function startTimer() {
    let options = qsa("option");
    let index = qs("select").selectedIndex;
    remainingSeconds = options[index].value;
    let minutes = Math.round(remainingSeconds / SECONDS_INNA_MINUTE);
    id("time").textContent = "0" + minutes + ":00";
    timerId = setInterval(advanceTimer, ONE_SECOND);
  }

  /**
   * This is executed every second once the timer is started. It incriments down the remaining time
   * by one second. If time runs out the game is ended and the refresh button along with the cards
   * are deactivated and deselected. Remaining time is also updated on the clock at the top of the
   * page.
   */
  function advanceTimer() {
    remainingSeconds--;
    if (remainingSeconds === 0) {
      let selected = qsa(".selected");
      for (let i = 0; i < selected.length; i++) {
        selected[i].classList.remove("selected");
      }
      endGame();
    }
    let seconds = remainingSeconds % SECONDS_INNA_MINUTE;
    let minutes = Math.trunc(remainingSeconds / SECONDS_INNA_MINUTE);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    id("time").textContent = "0" + minutes + ":" + seconds;
  }

  /**
   * Called when time is out or when the back button is pressed. It deactivates the cards and the
   * refresh button. Also stops the timer so it stays at 0 seconds.
   */
  function endGame() {
    let allCards = qsa(".card");
    for (let i = 0; i < totalCards; i++) {
      allCards[i].removeEventListener("click", cardSelected);
    }
    id("refresh-btn").disabled = true;
    clearInterval(timerId);
  }

  /**
   * When a card is clicked this function is run. It selects the card and if there are three cards
   * selected it will check if it is a set. If it is a set it will replace the cards and display
   * "SET!" on each card for one second. Incriments the set counter up one as well. If it is not a
   * set then it displays "Not a Set" on each card for one second and then the game remains as it
   * was before.
   */
  function cardSelected() {
    this.classList.toggle("selected");
    let cardGroup = qsa(".selected");
    if (cardGroup.length === CARDS_INNA_SET) {
      for (let i = 0; i < cardGroup.length; i++) {
        cardGroup[i].classList.remove("selected");
      }
      if (isASet(cardGroup)) {
        cardGroup = replaceCards(cardGroup);
      } else {
        for (let i = 0; i < cardGroup.length; i++) {
          cardGroup[i].classList.add("hide-imgs");
          let ptag = document.createElement("p");
          cardGroup[i].appendChild(ptag);
          ptag.textContent = "Not a Set";
        }
      }
      setTimeout(function() {
        for (let i = 0; i < cardGroup.length; i++) {
          cardGroup[i].removeChild(cardGroup[i].lastElementChild);
          cardGroup[i].classList.remove("hide-imgs");
        }
      }, ONE_SECOND);
    }
  }

  /**
   * This takes in the correct set array and replaces them with three new random cards. Also
   * incriments the set count up one.
   * @param {array} cardGroup - array of card objects that are in the selected set.
   * @returns {array} - array of new randomized unique card objects that replace the correct set.
   */
  function replaceCards(cardGroup) {
    for (let i = 0; i < cardGroup.length; i++) {
      let replacement = generateUniqueCard(totalCards === EASY_CARDS);
      replacement.classList.add("new");
      replacement.classList.add("hide-imgs");
      cardGroup[i].replaceWith(replacement);
      let ptag = document.createElement("p");
      replacement.appendChild(ptag);
      ptag.textContent = "SET!";
    }
    id("set-count").textContent = parseInt(id("set-count").textContent) + 1;
    cardGroup = qsa(".new");
    for (let i = 0; i < cardGroup.length; i++) {
      cardGroup[i].classList.remove("new");
    }
    return cardGroup;
  }

  /**
   * Takes in an array of attributes and checks to make sure that a card with those same attributes
   * does not exist on the current board state. returns false if there is a card matching those
   * attributes.
   * @param {array} idArray - array of four attributes of a card
   * @returns {boolean} - true if the given array's set of attributes is unique to the current board
   */
  function isUnique(idArray) {
    let textId = arrayToText(idArray, NUMBER_OF_ATTRIBUTES);
    return qs("#" + textId) === null;
  }

  /**
   * Checks to see if the three selected cards make up a valid set. This is done by comparing each
   * of the type of attribute against the other two cards. If each four attributes for each card are
   * either all the same or all different, then the cards make a set. If not, they do not make a set
   * @param {DOMList} selected - list of all selected cards to check if a set.
   * @return {boolean} true if valid set false otherwise.
   */
  function isASet(selected) {
    let attribute = [];
    for (let i = 0; i < selected.length; i++) {
      attribute.push(selected[i].id.split("-"));
    }
    for (let i = 0; i < attribute[0].length; i++) {
      let diff = attribute[0][i] !== attribute[1][i] &&
                attribute[1][i] !== attribute[2][i] &&
                attribute[0][i] !== attribute[2][i];
      let same = attribute[0][i] === attribute[1][i] &&
                    attribute[1][i] === attribute[2][i];
      if (!(same || diff)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements matching the given query.
   * @param {string} query - CSS query selector.
   * @returns {array} - Array of DOM objects matching the given query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }
})();

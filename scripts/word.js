const WORD_LENGTH = 5;
const MAX_ROW_INDEX = 5;
const DEFAULT_WORD = "hello";
const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const keys = Array.from(document.querySelectorAll(".keyboard > .row > div"));
const tiles = Array.from(document.querySelectorAll(".tiles > div"));

let currentRow = 0;
let currentColumn = 0;
let word;
const buffer = [];

async function handleKey(key) {
  if (key === "enter") {
    if (currentColumn === WORD_LENGTH) {
      const guess = buffer.join("");
      if (await isValidWord(guess)) {
        showResult(buffer);
        buffer.length = 0;
        if (currentRow < MAX_ROW_INDEX) {
          currentRow++;
          currentColumn = 0;
        } else {
          console.log("Game Over");
        }
      } else {
        console.log("invalid word");
      }
    }
  } else if (key === "←") {
    buffer.pop();
    currentColumn = Math.max(--currentColumn, 0);
    setTileText("");
  } else {
    if (currentColumn < WORD_LENGTH) {
      buffer.push(key);
      setTileText(key);
      currentColumn = Math.min(++currentColumn, WORD_LENGTH);
    }
  }
}

// return the number of times letter appears in array
const countOccurrences = (array, letter) =>
  array.reduce((count, current) => (current === letter ? count + 1 : count), 0);

//TODO: color key pressed
//TODO: check letter count before adding wrong location
function showResult(buffer) {
  const letterCount = {};
  buffer.forEach(letter => {
    if (!letterCount.hasOwnProperty(letter)) {
      letterCount[letter] = countOccurrences(buffer, letter);
    }
  });
  console.log("letter occurrences", letterCount);

  const classes = [];
  const keyClasses = {};
  console.log(`you guessed: ${buffer.join("")} for ${word}`);
  buffer.forEach((letter, index) => {
    if (letter === word[index]) {
      classes.push("correct");
      keyClasses[letter] = "correct";
    } else if (word.includes(letter)) {
      classes.push("wrong-location");
      keyClasses[letter] = "wrong-location";
    } else {
      classes.push("incorrect");
      keyClasses[letter] = "incorrect";
    }
  });

  classes.forEach((className, index) => {
    const offset = currentRow * WORD_LENGTH + index;
    tiles[offset].classList.add(className);
  });

  for (const prop in keyClasses) {
    const keyElement = document.querySelector(`[data-key="${prop}"]`);
    if (!keyElement.classList.contains("correct")) {
      keyElement.removeAttribute("class");
      keyElement.classList.add(keyClasses[prop]);
    }
  }
}

async function isValidWord(word) {
  return fetch(API_URL + word)
    .then(response => response.ok)
    .catch(error => console.log("network error", error));
}

function setTileText(key) {
  const index = currentRow * WORD_LENGTH + currentColumn;
  tiles[index].innerText = key.toUpperCase();
}

function start(list) {
  //TODO: remove loader
  const randIndex = Math.random() * list.length;
  word = list[Math.floor(randIndex)];
  console.log(`starting game with: ${word}`);
}

keys.forEach(key => {
  key.addEventListener("click", () => {
    handleKey(key.textContent);
  });
});

// TODO: add loader
fetch("./assets/target-words.txt")
  .then(response => (response.ok ? response.text() : DEFAULT_WORD))
  .then(data => data.split(/\r?\n/))
  .then(list => start(list))
  .catch(error => {
    console.log("network issues", error);
  });

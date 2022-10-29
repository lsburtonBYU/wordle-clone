const keys = document.querySelectorAll(".keyboard > .row > div");
const tiles = document.querySelectorAll(".tiles > div");
const tileArray = Array.from(tiles);
const WORD_LENGTH = 5;
const MAX_ROW_INDEX = 5;
DEFAULT_WORD = "hello";
const RANDOM_URL =
  "https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=10000&minLength=5&maxLength=5&includePartOfSpeech=noun,verb,adjective&api_key=";
const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

let currentRow = 0;
let currentColumn = 0;
let word;
const buffer = [];

async function handleKey(key) {
  if (key === "↴") {
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
  const checked = [];
  buffer.forEach(letter => {
    if (!checked.includes(letter)) {
      console.log(
        `I see ${countOccurrences(buffer, letter)} occurrences of ${letter}`
      );
      checked.push(letter);
    }
  });

  const classes = [];
  console.log(`you guessed: ${buffer.join("")} for ${word}`);
  buffer.forEach((letter, index) => {
    if (letter === word[index]) {
      classes.push("correct");
    } else if (word.includes(letter)) {
      classes.push("wrong-location");
    } else {
      classes.push("incorrect");
    }
  });

  classes.forEach((className, index) => {
    const offset = currentRow * WORD_LENGTH + index;
    tileArray[offset].classList.add(className);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

keys.forEach(key => {
  key.addEventListener("click", () => {
    handleKey(key.textContent);
  });
});

async function getAPIKey() {
  return fetch("./scripts/api-key.json")
    .then(response => response.json())
    .then(data => data.API_KEY)
    .catch(error => console.log("couldn't load api key", error));
}

async function callAPIRandomWord(apiKey) {
  return fetch(RANDOM_URL + apiKey)
    .then(response => {
      if (response.status == 200) return response.json();
      else return { word: DEFAULT_WORD };
    })
    .then(data => data.word)
    .catch(() => {
      word: DEFAULT_WORD;
    });
}

async function generateWord() {
  const apiKey = await getAPIKey();
  let attempts = 5;
  word = DEFAULT_WORD;

  while (attempts > 0) {
    word = await callAPIRandomWord(apiKey);
    if (/[a-z]{5}/.test(word)) {
      console.log(`valid word: ${word}`);
      attempts = 0;
    } else {
      console.log(`attempt: ${attempts}: invalid word: ${word}`);
      await sleep(1000);
      attempts--;
    }
  }
  start();
}

function start() {
  console.log("starting game");
}

generateWord();

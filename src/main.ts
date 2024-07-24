import './style.css';
import { wordList } from './words';

const wordSection = document.getElementById('word-section') as HTMLDivElement;
const inputField = document.getElementById('input-field') as HTMLInputElement;
const timerElement = document.getElementById('timer') as HTMLSpanElement;
const wpmElement = document.getElementById('wpm') as HTMLSpanElement;
const finishPage = document.getElementById('finish-page') as HTMLDivElement;
const finalWpmElement = document.getElementById(
  'final-wpm',
) as HTMLParagraphElement;
const finalAccuracyElement = document.getElementById(
  'final-accuracy',
) as HTMLParagraphElement;
const restartBtn = document.getElementById('restart-btn') as HTMLButtonElement;
const timeSelect = document.getElementById('time-select') as HTMLSelectElement;

let currentWordIndex = 0;
let correctWords = 0;
let startTime: number | null = null;
let timerInterval: number | null = null;
let testDuration = 60;

function generateWords() {
  wordSection.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const wordSpan = document.createElement('span');
    wordSpan.textContent =
      wordList[(currentWordIndex + i) % wordList.length] + ' ';
    wordSpan.className = i === 0 ? 'current-word' : '';
    wordSection.appendChild(wordSpan);
  }
}

function startTimer() {
  let timeLeft = testDuration;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `${timeLeft}s`;
    updateWPM();
    if (timeLeft <= 0) endTest();
  }, 1000);
}

function updateWPM() {
  if (!startTime) return;
  const elapsedTime = (Date.now() - startTime) / 1000 / 60; // in minutes
  const wpm = Math.round(correctWords / elapsedTime);
  wpmElement.textContent = `${wpm} WPM`;
}

function checkWord() {
  const currentWord = wordList[currentWordIndex % wordList.length];
  const typedWord = inputField.value.trim();

  if (typedWord === currentWord) {
    const wordElements = wordSection.getElementsByTagName('span');
    if (wordElements[0]) {
      wordElements[0].className = 'completed-word';
    }
    if (wordElements[1]) {
      wordElements[1].className = 'current-word';
    }
    correctWords++;
    currentWordIndex++;
    inputField.value = '';

    // Update word styling without removing words
    for (let i = 0; i < wordElements.length; i++) {
      if (i < currentWordIndex) {
        wordElements[i].className = 'completed-word';
      } else if (i === currentWordIndex) {
        wordElements[i].className = 'current-word';
      } else {
        wordElements[i].className = '';
      }
    }

    // Add more words if we're close to the end
    if (wordElements.length - currentWordIndex < 10) {
      for (let i = 0; i < 10; i++) {
        const newWordSpan = document.createElement('span');
        newWordSpan.textContent =
          wordList[
            (currentWordIndex + wordElements.length + i) % wordList.length
          ] + ' ';
        wordSection.appendChild(newWordSpan);
      }
    }
  }
}

function endTest() {
  if (timerInterval) clearInterval(timerInterval);
  inputField.disabled = true;
  finishPage.style.display = 'block';

  const elapsedTime = (Date.now() - (startTime || 0)) / 1000 / 60; // in minutes
  const finalWpm = Math.round(correctWords / elapsedTime);
  const accuracy = Math.round((correctWords / currentWordIndex) * 100);

  finalWpmElement.textContent = `Words Per Minute: ${finalWpm}`;
  finalAccuracyElement.textContent = `Accuracy: ${accuracy}%`;
}

function restartTest() {
  currentWordIndex = 0;
  correctWords = 0;
  startTime = null;
  if (timerInterval) clearInterval(timerInterval);
  inputField.disabled = false;
  inputField.value = '';
  finishPage.style.display = 'none';
  timerElement.textContent = `${testDuration}s`;
  wpmElement.textContent = '0 WPM';
  generateWords();
}

inputField.addEventListener('input', () => {
  if (!startTime) startTimer();
  checkWord();
});

restartBtn.addEventListener('click', restartTest);

timeSelect.addEventListener('change', (e) => {
  testDuration = parseInt((e.target as HTMLSelectElement).value);
  timerElement.textContent = `${testDuration}s`;
});

generateWords();

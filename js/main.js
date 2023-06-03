document.addEventListener("DOMContentLoaded", () => {

    let word;
    let guessedWords = [[]];
    let availableSpace = 1;
    let guessedWordCount = 0

    initLocalStorage();
    initHelpModal();
    initStatsModal();
    createSquares();
    loadLocalStorage();

    function getNewWord() {
        fetch(
            'https://random-words5.p.rapidapi.com/getRandom?wordLength=5',
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '478da3cd64msh99ae188a7adfa4fp128920jsn2cdcaf3ad861',
                    'X-RapidAPI-Host': 'random-words5.p.rapidapi.com'
                },
            }
        ).then((response) => {
            return response.text();
        }).then((res) => {
            word = res;
            window.localStorage.setItem('currentWord', word);
        }).catch((err) => {
            console.error(err);
        });
    }

    function initLocalStorage() {
        const storedCurrentWord = window.localStorage.getItem("currentWord");
        if (!storedCurrentWord) {
            window.localStorage.setItem("currentWord", getNewWord());
        } else {
            word = storedCurrentWord;
        }
    }

    function loadLocalStorage() {
        guessedWordCount = Number(window.localStorage.getItem("guessedWordCount")) || guessedWordCount;
        availableSpace = Number(window.localStorage.getItem("availableSpace")) || availableSpace;
        guessedWords = JSON.parse(window.localStorage.getItem("guessedWords")) || guessedWords;

        const storedBoardContainer = window.localStorage.getItem("boardContainer");
        if (storedBoardContainer) {
            document.getElementById("board-container").innerHTML = storedBoardContainer;
        };

        const storedKeyboardContainer = window.localStorage.getItem("keyboardContainer");
        if (storedKeyboardContainer) {
            document.getElementById("keyboard-container").innerHTML = storedKeyboardContainer;
        };

        addKeyBoardClicks();
    }

    function resetGameState() {
        window.localStorage.removeItem('guessedWordCount');
        window.localStorage.removeItem('availableSpace');
        window.localStorage.removeItem('guessedWords');
        window.localStorage.removeItem('boardContainer');
        window.localStorage.removeItem('keyboardContainer');
    }

    function createSquares() {
        const gameBoard = document.getElementById("board");
        for (let i = 0; i < 30; i++) {
            let square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated");
            square.setAttribute("id", i+1);
            gameBoard.appendChild(square);
        }
    }

    function preserveGameState() {
        window.localStorage.setItem("guessedWords", JSON.stringify(guessedWords));
        window.localStorage.setItem("availableSpace", availableSpace);
        window.localStorage.setItem("guessedWordCount", guessedWordCount);

        const boardContainer = document.getElementById('board-container');
        window.localStorage.setItem("boardContainer", boardContainer.innerHTML);

        const keyboardContainer = document.getElementById('keyboard-container');
        window.localStorage.setItem("keyboardContainer", keyboardContainer.innerHTML);
    }

    function getCurrentWordArr() {
        const numberOfGuessedWords = guessedWords.length;
        return guessedWords[numberOfGuessedWords - 1]
    }

    function updateGuessedWords(letter) {
        const currentWordArr = getCurrentWordArr()
        if (currentWordArr && currentWordArr.length < 5) {
            currentWordArr.push(letter);

            const availableSpaceEl = document.getElementById(String(availableSpace));
            availableSpace ++;
            availableSpaceEl.textContent = letter;
        }
    }

    function updateTotalGames() {
        const totalGames = window.localStorage.getItem("totalGames") || 0;
        window.localStorage.setItem("totalGames", Number(totalGames) + 1);
    }

    function showResult() {
        const finalResultEl = document.getElementById("final-score");
        finalResultEl.textContent = "You win!";

        const totalWins = window.localStorage.getItem("totalWins") || 0;
        window.localStorage.setItem("totalWins", Number(totalWins) + 1);

        const currentStreak = window.localStorage.getItem("currentStreak") || 0;
        window.localStorage.setItem("currentStreak", Number(currentStreak) + 1);
    }

    function showLosingResult() {
        const finalResultEl = document.getElementById("final-score");
        finalResultEl.textContent = "Unsuccessful Today! Come back tommorow.";

        window.localStorage.setItem("currentStreak", 0);
    }

    function clearBoard() {
        for (let i = 0; i < 30; i++) {
            let square = document.getElementById(i+1);
            square.textContent = "";
        }

        const keys = document.querySelectorAll(".keyboard-row button");
        for (let key of keys) {
            key.disabled = true;
        }

        const keyboardContainer = document.getElementById('keyboard-container');
        window.localStorage.setItem("keyboardContainer", keyboardContainer.innerHTML);
    }

    function getTileColor(letter, index) {
        const isCorrectLetter = word.includes(letter);

        if (!isCorrectLetter) {
            return "rgb(58, 58, 60)";
        }

        const letterAtIndex = word.charAt(index);
        const isCorrectPosition = (letterAtIndex === letter);

        if (isCorrectPosition) {
            return "rgb(83, 141, 78)";
        }
        return "rgb(181, 159, 59)";
    }


    function handleSubmitWord() {
        const keys = document.querySelectorAll(".keyboard-row button");
        const currentWordArr = getCurrentWordArr();
        if (currentWordArr.length !== 5) {
            window.alert("Word must be 5 letters");
            for (let key of keys) {
                key.disabled = false;
            }
            return;
        }

        const currentWord = currentWordArr.join('');
        fetch(
            `https://wordsapiv1.p.rapidapi.com/words/${currentWord}`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '478da3cd64msh99ae188a7adfa4fp128920jsn2cdcaf3ad861',
                    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
                }
            }
        ).then((res) => {
            if (!res.ok) {
                for (let key of keys) {
                    key.disabled = false;
                }
                throw Error()
            } else {
                const firstletterId = guessedWordCount * 5 + 1;
                const interval = 350;
                currentWordArr.forEach((letter, index) => {
                    const tileColor = getTileColor(letter, index);
                    setTimeout(() => {
                        const tileColor = getTileColor(letter, index);
                        const letterId = firstletterId + index;
                        const letterEl = document.getElementById(letterId);
                        letterEl.classList.add("animate__flipInX");
                        letterEl.style = `background-color: ${tileColor}; border-color: ${tileColor}`;

                        const key = document.querySelector(`button[data-key=${letter}]`);
                        if (window.getComputedStyle(key).getPropertyValue('background-color') != 'rgb(83, 141, 78)') {
                            key.style = `background-color: ${tileColor}`;   
                        }
                    }, interval * index);
                });

                setTimeout(() => {
                    for (let key of keys) {
                        key.disabled = false;
                    }
                    guessedWordCount ++;

                    preserveGameState();

                    if (currentWord === word) {
                        window.confirm("Congratulations!");
                        showResult();
                        clearBoard();
                        getNewWord();
                        updateTotalGames();
                        resetGameState();
                    } else if (guessedWordCount === 6) {
                        window.confirm(`Sorry, you have no more guesses! The word is ${word.toUpperCase()}`);
                        showLosingResult();
                        clearBoard();
                        getNewWord();
                        updateTotalGames();
                        resetGameState();
                    }
                }, interval * 4 + 100);

                guessedWords.push([]);
            }
        }).catch((err) => {
            console.log(err);
            window.alert("Word is not recognized!");
            for (let key of keys) {
                key.disabled = false;
            }
        })
    }

    function handleDeleteLetter() {
        const currentWordArr = getCurrentWordArr()
        if (currentWordArr.length > 0) {
            currentWordArr.pop();
            guessedWords[guessedWords.length - 1] = currentWordArr;
            const lastLetterEl = document.getElementById(String(availableSpace - 1));
            availableSpace --;
            lastLetterEl.textContent = '';
        }
    }

    function addKeyBoardClicks() {
        const keys = document.querySelectorAll(".keyboard-row button");
        
        for (let i = 0; i < keys.length; i++) {
            keys[i].addEventListener("click", ({ target }) => {
                const letter = target.getAttribute("data-key");
                if (letter === "enter") {
                    for (let key of keys) {
                        key.disabled = true;
                    }
                    handleSubmitWord();
                    return;
                }
                if (letter === "del") {
                    handleDeleteLetter()
                    return;
                }
                updateGuessedWords(letter);
            });
        }
    }

    function initHelpModal() {
        const modal = document.getElementById("help-modal");
        const btn = document.getElementById("help");
        const span = document.getElementById("close-help");

        btn.addEventListener("click", () => {
            modal.style.display = "block";
        });

        span.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    function updateStatsModal() {
        const currentStreak = window.localStorage.getItem("currentStreak");
        const totalWins = window.localStorage.getItem("totalWins");
        const totalGames = window.localStorage.getItem("totalGames");

        document.getElementById("total-played").textContent = totalGames;
        document.getElementById("total-wins").textContent = totalWins;
        document.getElementById("current-streak").textContent = currentStreak;

        const winPct = Math.round(totalWins / totalGames * 100) || 0;
        document.getElementById("win-pct").textContent = winPct;
    }

    function initStatsModal() {
        const modal = document.getElementById("stats-modal");
        const btn = document.getElementById("stats");
        const span = document.getElementById("close-stats");

        btn.addEventListener("click", () => {
            modal.style.display = "block";
            updateStatsModal();
        });

        span.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    document.addEventListener("keypress", (event) => {
        const regex = /^[a-z]$/;
        if (regex.test(event.key)) {
            const key = document.querySelector(`button[data-key=${event.key}]`)
            key.click();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === 'Enter') {
            const key = document.querySelector(`button[data-key=enter`)
            key.click();
        } else if (event.key === 'Backspace') {
            const key = document.querySelector(`button[data-key=del`)
            key.click();
        }
    });
});

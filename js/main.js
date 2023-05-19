document.addEventListener("DOMContentLoaded", () => {
    createSquares();

    let word;
    getNewWord();

    const guessedWords = [[]];
    let availableSpace = 1;
    let guessedWordCount = 0

    const keys = document.querySelectorAll(".keyboard-row button");

    function getNewWord() {
        fetch(
            `https://wordsapiv1.p.rapidapi.com/words/?random=true&lettersMin=5&lettersMax=5`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '478da3cd64msh99ae188a7adfa4fp128920jsn2cdcaf3ad861',
                    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
                },
            }
        ).then((response) => {
            return response.json();
        }).then((res) => {
            word = res.word;
        }).catch((err) => {
            console.error(err);
        });
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
        const currentWordArr = getCurrentWordArr();
        if (currentWordArr.length !== 5) {
            window.alert("Word must be 5 letters");
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
                    }, interval * index);
                    const key = document.querySelector(`button[data-key=${letter}]`);
                    if (window.getComputedStyle(key).getPropertyValue('background-color') != 'rgb(83, 141, 78)') {
                        key.style = `background-color: ${tileColor}`;   
                    }
                })
                
                guessedWordCount ++;

                if (currentWord === word) {
                    window.alert("Congratulations!");
                }

                if (guessedWords.length === 6) {
                    window.alert(`Sorry, you have no more guesses! The word is ${word.toUpperCase()}`);
                }
                guessedWords.push([]);
            }
        }).catch((err) => {
            window.alert("Word is not recognized!");
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

    document.addEventListener("keypress", (event) => {
        const regex = /^[a-z]$/;
        if (regex.test(event.key)) {
            const key = document.querySelector(`button[data-key=${event.key}]`)
            key.click();
        }
    });

    document.addEventListener("keydown", (event) => {
        console.log(event.key)
        if (event.key === 'Enter') {
            const key = document.querySelector(`button[data-key=enter`)
            key.click();
        } else if (event.key === 'Backspace') {
            const key = document.querySelector(`button[data-key=del`)
            key.click();
        }
    });

    for (let i = 0; i < keys.length; i++) {
        keys[i].addEventListener("keypress", (event) => {
            if (event.key === keys[i].getAttribute("data-key")) {
                console.log(event.key);
                keys[i].click();
            }
        });
        keys[i].onclick = ({ target }) => {
            const letter = target.getAttribute("data-key");
            if (letter === "enter") {
                handleSubmitWord();
                return;
            }
            if (letter === "del") {
                handleDeleteLetter()
                return;
            }
            updateGuessedWords(letter);
        }
    }
});


document.addEventListener("DOMContentLoaded", function() {
    const rows = 10; // Number of rows in the game field
    const cols = 10; // Number of columns in the game field
    let totalBombs; // Total number of bombs to be placed in the game field

    const backButton = document.getElementById("backButton"); // Back button in the menu
    const menu = document.querySelector('.menu'); // Menu element
    const tools = document.querySelector('.tools'); // Tools element (hidden by default)
    let gameField = document.querySelector('.gameField'); // Game field element
    const bombInput = document.getElementById("bombInput"); // Input for the number of bombs
    const updateBombs = document.getElementById("updateBombs"); // Button to update the number of bombs
    const clickSound = document.getElementById("clickSound"); // Sound for clicking a cell
    const explodeSound = document.getElementById("explodeSound"); // Sound for exploding a bomb
    const winSound = document.getElementById("winSound"); // Sound for winning the game
    const loseSound = document.getElementById("loseSound"); // Sound for losing the game
    const bkSound = document.getElementById("bk"); // Background music sound
    const volumeControl = document.getElementById("volumeControl"); // Volume control input

    let field = []; // 2D array to represent the game field
    let nonBombCells; // Number of cells that are not bombs
    let revealedCells = 0; // Counter for revealed cells

    playBackgroundMusic(); // Start playing background music
    setVolume(volumeControl.value); // Set the volume based on the control's current value

    volumeControl.addEventListener('input', function() {
        setVolume(volumeControl.value); // Update the volume when the slider is moved
    });

     function setupMenu() {
        // Clear the menu to avoid overlapping elements
        menu.innerHTML = ''; 
        // Create the main menu buttons
        menu.innerHTML = `
            <button id="arcadeButton">Arcade</button> 
            <button id="historyButton">History Mode</button>
            <button id="twoPlayersButton">Two Players</button>
            <button id="instructionsBtn">Instructions</button>
        `;

        const buttons = menu.querySelectorAll('button'); // Select all buttons in the menu

        const arcadeButton = document.getElementById("arcadeButton"); // Arcade mode button
        arcadeButton.addEventListener("click", function() {
            tools.classList.remove('hidden'); // Show tools when arcade mode is selected
            buttons.forEach(button => button.classList.add('hidden'));  // Hide all menu buttons
            menu.classList.remove('menu'); // Change the menu class to game field
            menu.classList.add('gameField');
            gameField = menu; // Update the game field reference
            createField(); // Create the game field
        });

         // Back button functionality
         backButton.addEventListener("click", function() {
            tools.classList.add('hidden'); // Hide tools when going back
            clearInstructions(); // Clear instructions when going back
            buttons.forEach(button => button.classList.remove('hidden')); // Show all menu buttons
            menu.classList.remove('gameField'); // Change class back to menu
            menu.classList.add('menu');
            gameField.innerHTML = ''; // Clear the game field display
            setupMenu(); // Reset the menu
        });

function clearInstructions() {
     menu.classList.remove("instructions"); // Remove the 'instructions' class from the menu element 
     const langButtons = menu.querySelectorAll('.lang-btn'); // Remove elements with the class 'lang-btn' from the menu
     langButtons.forEach(button => button.remove());    
     const portugueseBtn = menu.querySelector('button.lang-btn'); // Remove 'portugueseBtn' and 'englishBtn' from the menu
     const englishBtn = menu.querySelector('button.lang-btn');
     if (portugueseBtn) portugueseBtn.remove();
     if (englishBtn) englishBtn.remove();   
    const paragraphs = menu.querySelectorAll('p'); // Remove <p> elements from the menu
    paragraphs.forEach(paragraph => paragraph.remove());    
    const instructionParagraphs = menu.querySelectorAll('.paragraph'); // Remove elements with class 'paragraph' from the menu
    instructionParagraphs.forEach(p => p.remove());
}

       // Instructions button functionality
        const instructionsBtn = document.getElementById("instructionsBtn");
        instructionsBtn.addEventListener("click", () => {
            menu.classList.remove('menu');
            buttons.forEach(button => button.classList.add('hidden'));
            menu.classList.add("instructions");

            const portugueseBtn = document.createElement("button");
            portugueseBtn.innerText = "Português";
            portugueseBtn.classList.add("lang-btn");

            const englishBtn = document.createElement("button");
            englishBtn.innerText = "English";
            englishBtn.classList.add("lang-btn");

            menu.appendChild(portugueseBtn);
            menu.appendChild(englishBtn);

            portugueseBtn.addEventListener('click', function() {
                const langButtons = document.querySelectorAll('.lang-btn');
                langButtons.forEach(button => button.remove());
                menu.classList.remove('instructions');
                
                const instructionsText = `Selecione um quadrado, se for uma mina você perdeu, uma numeração representa a quantidade de minas adjacentes ao quadrado clicado (o que inclui diagonais). Use o botão direito para colocar ou retirar bandeiras para ajudar a se orientar. O objetivo é descobrir onde estão todas as minas em diferentes modos de jogo.

    Modo Arcade = Selecione a quantidade de minas e tente terminar o campo no menor tempo possível.

    Modo História = Um divertido modo com dificuldade crescente e uma história envolvente.

    Modo Dois Jogadores = O primeiro jogador escolhe quantas minas terá o campo. A quantidade de espaços revelados será acrescida à pontuação. Ao terminar sua tentativa de conclusão do campo é a vez do segundo jogador. 
    Em caso de um jogador "explodir" e o outro não, o jogador que concluiu o campo vence. Em caso de ambos os jogadores "explodirem", ganha quem tiver a maior pontuação. Se ambos os jogadores concluírem o campo, a partida reinicia com o segundo jogador escolhendo a quantidade de bombas.`;
                const paragraph = document.createElement('p');
                paragraph.innerText = instructionsText;
                menu.appendChild(paragraph);
            });

            englishBtn.addEventListener('click', function() {
                const langButtons = document.querySelectorAll('.lang-btn');
                langButtons.forEach(button => button.remove());
                menu.classList.remove('instructions');

                const instructionsText = `Select a square, if it's a mine you missed it, a number represents the number of mines adjacent to the clicked square (which includes diagonals). Use the right button to place or remove flags to help guide you. The goal is to find out where all the mines are in different game modes.

    Arcade Mode = Select the number of mines and try to finish the field in the shortest time possible.

    Story Mode = A fun mode with increasing difficulty and an engaging story.

    Two Player Mode = The first player chooses how many mines the field will have. The number of spaces revealed will be added to the score. When you finish your attempt to complete the field, it is the second player's turn. In case one player "explode" and the other doesn't, the player who completed the field wins. If both players "explode", the one with the highest score wins. If both players complete the field, the game restarts with the second player choosing the number of bombs.`;
                const paragraph = document.createElement('p');
                paragraph.innerText = instructionsText;
                menu.appendChild(paragraph);
            });
        });
    }

    updateBombs.addEventListener('click', function() {
        totalBombs = parseInt(bombInput.value);
        if (isNaN(totalBombs) || totalBombs < 1 || totalBombs >= rows * cols) {
            alert(`Please enter a number between 1 and ${rows * cols - 1}`);
            return;
        }
        nonBombCells = rows * cols - totalBombs;
        revealedCells = 0;
        createField();
    });

    function playBackgroundMusic() {
        bkSound.loop = true;
        bkSound.play();
    }

    function setVolume(volume) {
        clickSound.volume = volume;
        explodeSound.volume = volume;
        winSound.volume = volume;
        loseSound.volume = volume;
        bkSound.volume = volume;
    }

    function createField() {
        gameField.innerHTML = '';
        field = Array.from({ length: rows }, () => Array(cols).fill(0));
        placeBombs();
        updateCellCounts();

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                cell.addEventListener('click', handleClick);
                cell.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    toggleFlag(cell);
                });

                gameField.appendChild(cell);
            }
        }
    }

    function placeBombs() {
        let bombsPlaced = 0;
        while (bombsPlaced < totalBombs) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);

            if (field[randomRow][randomCol] !== 'B') {
                field[randomRow][randomCol] = 'B';
                bombsPlaced++;
            }
        }
    }

    function updateCellCounts() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (field[i][j] !== 'B') {
                    field[i][j] = countAdjacentBombs(i, j);
                }
            }
        }
    }

    function countAdjacentBombs(row, col) {
        let count = 0;
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < cols && field[i][j] === 'B') {
                    count++;
                }
            }
        }
        return count;
    }

    function handleClick(event) {
        const cell = event.target;
        const row = cell.dataset.row;
        const col = cell.dataset.col;

        if (cell.classList.contains('revealed')) return;

        if (field[row][col] === 'B') {
            playExplodeSound();
            revealBombs();
            playLoseSound();
            setTimeout(() => {
                if (confirm("Game Over! Do you want to restart the game?")) {
                    restartGame();
                }
            }, 500);
        } else {
            const bombCount = field[row][col];
            updateCellClass(cell, bombCount);
            playClickSound();
            cell.classList.add('revealed');

            revealedCells++;
            if (bombCount === 0) flood(row, col);

            if (revealedCells === nonBombCells) {
                playWinSound();
                setTimeout(() => {
                    alert("Congratulations! You won!");
                    restartGame();
                }, 500);
            }
        }
    }

    function updateCellClass(cell, count) {
        cell.classList.remove('cell');
        const className = `empty${count}`; 
        cell.classList.add(className);

        if (count === 0) flood(cell.dataset.row, cell.dataset.col);
    }

    function flood(row, col) {
        row = parseInt(row);
        col = parseInt(col);

        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < cols) {
                    const adjacentCell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);

                    if (adjacentCell && !adjacentCell.classList.contains('revealed')) {
                        const bombCount = field[i][j];
                        if (bombCount === 0) {
                            updateCellClass(adjacentCell, 0);
                            adjacentCell.classList.add('revealed');
                            revealedCells++;
                            flood(i, j);
                        }
                    }
                }
            }
        }
    }

    function toggleFlag(cell) {
        if (!cell.classList.contains('revealed')) {
            if (cell.classList.contains('flag')) {
                cell.classList.remove('flag');
            } else {
                cell.classList.add('flag');
            }
        }
    }

    function revealBombs() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (field[i][j] === 'B') {
                    const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                    cell.classList.add('bomb');
                }
            }
        }
    }

    function restartGame() {
        createField();
        revealedCells = 0;
    }

    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    function playExplodeSound() {
        explodeSound.currentTime = 0;
        explodeSound.play();
    }

    function playWinSound() {
        winSound.currentTime = 0;
        winSound.play();
    }

    function playLoseSound() {
        loseSound.currentTime = 0;
        loseSound.play();
    }

    setupMenu();
});

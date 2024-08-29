document.addEventListener("DOMContentLoaded", function() {
    // Dimensions of the game field
    const rows = 10;
    const cols = 10;
    let totalBombs;

    // Get references to DOM elements
    const gameField = document.getElementById("gameField");
    const bombInput = document.getElementById("bombInput");
    const updateBombs = document.getElementById("updateBombs");
    const clickSound = document.getElementById("clickSound");
    const explodeSound = document.getElementById("explodeSound");
    const winSound = document.getElementById("winSound");
    const loseSound = document.getElementById("loseSound");
    const bkSound = document.getElementById("bk");
    const volumeControl = document.getElementById("volumeControl"); // Volume control slider


    let field = [];
    let nonBombCells;
    let revealedCells = 0;

    // Play background music in a loop
    playBackgroundMusic();

   // Set initial volume
    setVolume(volumeControl.value);

    // Event listener to update the volume
    volumeControl.addEventListener('input', function() {
        setVolume(volumeControl.value);
    });

    // Initialize the game field
    createField();

    // Event listener to update the number of bombs
    updateBombs.addEventListener('click', function() {
        totalBombs = parseInt(bombInput.value);
        if (isNaN(totalBombs) || totalBombs < 1 || totalBombs >= rows * cols) {
            alert(`Please enter a number between 1 and ${rows * cols - 1}`);
            return;
        }
        nonBombCells = rows * cols - totalBombs; // Update the number of non-bomb cells
        revealedCells = 0; // Reset the revealed cells counter
        createField();
    });

     function playBackgroundMusic() {
        bkSound.loop = true;  // Enable looping
        bkSound.play();       // Start playing the music
    }
   
    function setVolume(volume) {
        // Set the volume for all sounds
        clickSound.volume = volume;
        explodeSound.volume = volume;
        winSound.volume = volume;
        loseSound.volume = volume;
        bkSound.volume = volume;
    }

    // Function to create the game field
    function createField() {
        gameField.innerHTML = ''; // Clear the field before creating a new one

        // Initialize the game field with zeroes
        field = Array.from({ length: rows }, () => Array(cols).fill(0));

        placeBombs(); // Place bombs in the field
        updateCellCounts(); // Update the number of adjacent bombs for each cell

        // Create and add cells to the game field
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                cell.addEventListener('click', handleClick);

                gameField.appendChild(cell);
            }
        }
    }

    // Function to randomly place bombs in the field
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

    // Function to update the number of adjacent bombs for each cell
    function updateCellCounts() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (field[i][j] !== 'B') {
                    field[i][j] = countAdjacentBombs(i, j);
                }
            }
        }
    }

    // Function to count the number of bombs adjacent to a given cell
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

    // Function to handle cell clicks
    function handleClick(event) {
        const cell = event.target;
        const row = cell.dataset.row;
        const col = cell.dataset.col;

        if (cell.classList.contains('revealed')) return; // Do nothing if the cell is already revealed

        if (field[row][col] === 'B') {
            playExplodeSound(); // Play explosion sound
            revealBombs(); // Reveal all bombs
            playLoseSound(); // Play lose sound
            setTimeout(() => {
                if (confirm("Game Over! Do you want to restart the game?")) {
                    restartGame(); // Restart the game
                }
            }, 500); // Delay before restarting the game
        } else {
            const bombCount = field[row][col];
            updateCellClass(cell, bombCount); // Update cell class based on bomb count
            playClickSound(); // Play click sound
            cell.classList.add('revealed'); // Mark the cell as revealed

            revealedCells++;
            if (bombCount === 0) flood(row, col); // Flood if the cell is empty

            if (revealedCells === nonBombCells) {
                playWinSound(); // Play win sound
                setTimeout(() => {
                    alert("Congratulations! You won!");
                    restartGame(); // Restart the game
                }, 500); // Delay before restarting the game
            }
        }
    }

    // Function to update the cell's class based on the number of adjacent bombs
    function updateCellClass(cell, count) {
        cell.classList.remove('cell'); 

        // Add class based on the number of adjacent bombs
        const className = `empty${count}`;
        cell.classList.add(className);

        // If the cell is empty, flood adjacent cells
        if (count === 0) flood(cell.dataset.row, cell.dataset.col);
    }

    // Recursive function to flood-fill empty cells
    function flood(row, col) {
        row = parseInt(row);
        col = parseInt(col);

        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                // Check if the cell is within field bounds
                if (i >= 0 && i < rows && j >= 0 && j < cols) {
                    const adjacentCell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);

                    // Check if the cell exists and hasn't been revealed
                    if (adjacentCell && !adjacentCell.classList.contains('revealed')) {
                        const bombCount = field[i][j];

                        if (bombCount === 0) {
                            // If the cell is empty, apply class and call flood recursively
                            updateCellClass(adjacentCell, 0);
                            adjacentCell.classList.add('revealed');
                            revealedCells++;
                            flood(i, j); // Recursive flood
                        }
                    }
                }
            }
        }
    }

    // Function to reveal all bombs at the end of the game
    function revealBombs() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (field[i][j] === 'B') {
                    const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                    if (cell) cell.classList.add('bomb');
                }
            }
        }
    }

    // Functions to play sound effects
    function playClickSound() {
        clickSound.play();
    }

    function playExplodeSound() {
        explodeSound.play();
    }

    function playLoseSound() {
        loseSound.play();
    }

    function playWinSound() {
        winSound.play();
    }

    // Function to restart the game
    function restartGame() {
        gameField.innerHTML = '';
        revealedCells = 0; 
        createField();
    }
});

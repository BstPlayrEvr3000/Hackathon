// Game State
let heaps = [];
let currentTurn = 'player'; // 'player' or 'bot'
let selectedHeapIndex = -1;
let selectedStonesCount = 0; // number of stones selected to remove
let difficulty = 'beatable'; // 'beatable' or 'unbeatable'

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const heapInput = document.getElementById('heap-input');
const startBtn = document.getElementById('start-btn');
const setupError = document.getElementById('setup-error');
const heapsContainer = document.getElementById('heaps-container');
const turnIndicator = document.getElementById('turn-indicator');
const controlsContainer = document.getElementById('controls-container');
const takeAmountInput = document.getElementById('take-amount-input');
const confirmBtn = document.getElementById('confirm-btn');
const selectionInfo = document.getElementById('selection-info');
const winnerText = document.getElementById('winner-text');
const winnerSubtext = document.getElementById('winner-subtext');
const restartBtn = document.getElementById('restart-btn');

// Rules Modal Elements
const rulesBtn = document.getElementById('rules-btn');
const rulesOverlay = document.getElementById('rules-overlay');
const closeRulesBtn = document.getElementById('close-rules');
const gotItBtn = document.getElementById('got-it-btn');

// Strategy Modal Elements
const strategyBtn = document.getElementById('strategy-btn');
const strategyOverlay = document.getElementById('strategy-overlay');
const closeStrategyBtn = document.getElementById('close-strategy');
const closeStrategyPrimaryBtn = document.getElementById('close-strategy-btn');

// Difficulty UI
const beatableBtn = document.getElementById('difficulty-beatable');
const unbeatableBtn = document.getElementById('difficulty-unbeatable');

// --- Initialization & Setup ---
startBtn.addEventListener('click', startGame);
confirmBtn.addEventListener('click', executePlayerMove);
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    setTimeout(() => {
        gameOverScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        setupScreen.offsetHeight; // trigger reflow
        setupScreen.classList.add('active');
        heapInput.value = '';
        heaps = []; // Clear heaps to prevent premature game over trigger
        cancelSelection();
    }, 500);
});

// Difficulty Selection Logic
beatableBtn.addEventListener('click', () => setDifficulty('beatable'));
unbeatableBtn.addEventListener('click', () => setDifficulty('unbeatable'));

function setDifficulty(level) {
    difficulty = level;
    beatableBtn.classList.toggle('active', level === 'beatable');
    unbeatableBtn.classList.toggle('active', level === 'unbeatable');
}

// Rules Modal Logic
rulesBtn.addEventListener('click', () => {
    rulesOverlay.classList.remove('hidden');
});

const closeRules = () => {
    rulesOverlay.classList.add('hidden');
};

closeRulesBtn.addEventListener('click', closeRules);
gotItBtn.addEventListener('click', closeRules);
rulesOverlay.addEventListener('click', (e) => {
    if (e.target === rulesOverlay) closeRules();
});

// Strategy Modal Logic
strategyBtn.addEventListener('click', () => {
    strategyOverlay.classList.remove('hidden');
});

const closeStrategy = () => {
    strategyOverlay.classList.add('hidden');
};

closeStrategyBtn.addEventListener('click', closeStrategy);
closeStrategyPrimaryBtn.addEventListener('click', closeStrategy);
strategyOverlay.addEventListener('click', (e) => {
    if (e.target === strategyOverlay) closeStrategy();
});

function startGame() {
    const rawInput = heapInput.value.trim();
    if (!rawInput) {
        setupError.textContent = "Please enter some numbers.";
        return;
    }

    const parts = rawInput.split(/\s+/);
    heaps = [];
    for (let p of parts) {
        const num = parseInt(p, 10);
        if (isNaN(num) || num <= 0) {
            setupError.textContent = "Invalid format. Use positive integers separated by spaces.";
            return;
        }
        heaps.push(num);
    }

    if (heaps.length === 0) {
        setupError.textContent = "Please enter at least one heap size.";
        return;
    }

    setupError.textContent = "";

    // Calculate Nim-sum to determine who goes first
    const nimSum = heaps.reduce((acc, val) => acc ^ val, 0);

    // Determine the "advantaged" player from the current position
    // (Nim-sum != 0 is a winning position for the first player)
    const startPositionIsWinning = (nimSum !== 0);

    if (difficulty === 'beatable') {
        // Player gets the advantage: goes first on winning, stays second on losing
        currentTurn = startPositionIsWinning ? 'player' : 'bot';
    } else {
        // Bot gets the advantage: stays second on winning, goes first on losing
        currentTurn = startPositionIsWinning ? 'bot' : 'player';
    }

    // Transition Screens
    setupScreen.classList.remove('active');
    setTimeout(() => {
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        // Force reflow
        gameScreen.offsetHeight;
        gameScreen.classList.add('active');
        updateBoard();
        updateTurnIndicator();

        if (currentTurn === 'bot') {
            setTimeout(botMove, 1000); // Deciding pause for bot going first
        }
    }, 1000); // 1s decide delay for transition
}

// --- Game Logic ---
function updateBoard() {
    heapsContainer.innerHTML = '';

    heaps.forEach((count, heapIndex) => {
        const heapDiv = document.createElement('div');
        heapDiv.className = 'heap';
        if (count === 0) heapDiv.style.opacity = '0.3';

        // Heap selection logic
        heapDiv.addEventListener('click', () => {
            if (currentTurn !== 'player' || count === 0) return;
            selectHeap(heapIndex);
        });

        for (let i = 0; i < count; i++) {
            const stone = document.createElement('div');
            stone.className = 'stone';
            heapDiv.appendChild(stone);
        }

        if (selectedHeapIndex === heapIndex) {
            heapDiv.classList.add('selected');
        }

        heapsContainer.appendChild(heapDiv);
    });

    updateControls();
}

function selectHeap(heapIndex) {
    if (selectedHeapIndex === heapIndex) {
        cancelSelection();
    } else {
        selectedHeapIndex = heapIndex;
        selectedStonesCount = 0; // Reset input count
        takeAmountInput.value = '';
        updateBoard();
        takeAmountInput.focus();
    }
}

// Handle numeric input validation
if (takeAmountInput) {
    takeAmountInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (selectedHeapIndex !== -1) {
            const max = heaps[selectedHeapIndex];
            if (val >= 1 && val <= max) {
                selectedStonesCount = val;
                confirmBtn.classList.remove('disabled');
                confirmBtn.disabled = false;
            } else {
                selectedStonesCount = 0;
                confirmBtn.classList.add('disabled');
                confirmBtn.disabled = true;
            }
        }
    });
}

function highlightStones(heapIndex, stoneIndex) {
    const heapsNodes = heapsContainer.children;
    const stones = heapsNodes[heapIndex].children;

    for (let i = 0; i < stones.length; i++) {
        if (i <= stoneIndex) {
            stones[i].classList.add('selected');
        } else {
            stones[i].classList.remove('selected');
        }
    }
}

function clearHighlights() {
    const heapsNodes = heapsContainer.children;
    for (const heapNode of heapsNodes) {
        for (const stone of heapNode.children) {
            stone.classList.remove('selected');
        }
    }
}

function selectStones(heapIndex, stoneIndex) {
    selectedHeapIndex = heapIndex;
    selectedStonesCount = stoneIndex + 1;
    updateBoard();
}

function cancelSelection() {
    selectedHeapIndex = -1;
    selectedStonesCount = 0;
    if (takeAmountInput) takeAmountInput.value = '';
    updateBoard();
}

function updateControls() {
    if (selectedHeapIndex !== -1) {
        controlsContainer.classList.remove('hidden');
        selectionInfo.textContent = `Heap ${selectedHeapIndex + 1} selected. How many stones?`;
        // Button state handled by input listener
    } else {
        controlsContainer.classList.add('hidden');
        confirmBtn.classList.add('disabled');
        confirmBtn.disabled = true;
    }
}

function executePlayerMove() {
    if (selectedHeapIndex === -1 || selectedStonesCount === 0) return;

    // Animate removal
    animateRemoval(selectedHeapIndex, selectedStonesCount, () => {
        heaps[selectedHeapIndex] -= selectedStonesCount;
        selectedHeapIndex = -1;
        selectedStonesCount = 0;

        if (checkGameOver()) return;

        currentTurn = 'bot';
        updateTurnIndicator();
        updateBoard();
        setTimeout(botMove, 1000); // 1s decide delay
    });
}

function animateRemoval(heapIndex, count, callback) {
    const heapNode = heapsContainer.children[heapIndex];
    // we want to remove the ones with index 0 to count-1
    // since we appended them 0 to count-1 normally, they correspond to the top
    for (let i = 0; i < count; i++) {
        if (heapNode.children[i]) {
            heapNode.children[i].classList.add('removing');
        }
    }
    setTimeout(callback, 400); // wait for animation
}

function botMove() {
    const nimSum = heaps.reduce((acc, val) => acc ^ val, 0);
    let chosenHeap = -1;
    let takeAmount = 0;

    if (nimSum !== 0) {
        // Find optimal move
        for (let i = 0; i < heaps.length; i++) {
            const targetSize = heaps[i] ^ nimSum;
            if (targetSize < heaps[i]) {
                chosenHeap = i;
                takeAmount = heaps[i] - targetSize;
                break;
            }
        }
    } else {
        // Losing position, just take 1 from the first available heap
        for (let i = 0; i < heaps.length; i++) {
            if (heaps[i] > 0) {
                chosenHeap = i;
                takeAmount = 1;
                break;
            }
        }
    }

    // Visually denote bot's choice
    selectedHeapIndex = chosenHeap;
    updateBoard();
    selectionInfo.textContent = `Bot is taking ${takeAmount} stone(s) from Heap ${chosenHeap + 1}...`;
    controlsContainer.classList.remove('hidden');

    setTimeout(() => {
        animateRemoval(chosenHeap, takeAmount, () => {
            heaps[chosenHeap] -= takeAmount;
            controlsContainer.classList.add('hidden');

            if (checkGameOver()) return;

            currentTurn = 'player';
            updateTurnIndicator();
            updateBoard();
        });
    }, 2500); // 2.5s move action delay
}

function updateTurnIndicator() {
    if (currentTurn === 'player') {
        turnIndicator.textContent = "Your Turn!";
        turnIndicator.className = 'turn-indicator turn-player';
    } else {
        turnIndicator.textContent = "Opponent is thinking...";
        turnIndicator.className = 'turn-indicator turn-bot';
    }
}

function checkGameOver() {
    const totalStones = heaps.reduce((sum, h) => sum + h, 0);
    if (totalStones === 0) {
        gameScreen.classList.remove('active');
        setTimeout(() => {
            gameScreen.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
            gameOverScreen.offsetHeight;
            gameOverScreen.classList.add('active');

            // Last player to move wins (so the turn that just happened, which means the currentTurn variable points to the loser now)
            // Wait, actually:
            // if currentTurn just executed a move, and sum is 0, they took the last stone.
            // Oh, the checkGameOver is called right after the array is mutated.
            // So if `currentTurn === 'player'`, that means the player just moved and took the last stone!
            // Wait, inside executePlayerMove(), `heaps` is mutated, then `checkGameOver()` is called *before* changing `currentTurn`.
            // So if `currentTurn === 'player'`, player just won.

            if (currentTurn === 'player') {
                winnerText.textContent = "You Win!";
                winnerText.className = 'glow-text turn-player';
                winnerSubtext.textContent = "A brilliant display of strategy.";
                strategyBtn.classList.remove('hidden');
            } else {
                winnerText.textContent = "You Lose!";
                winnerText.className = 'glow-text turn-bot';
                winnerSubtext.textContent = "The bot predicted your every move. It's rigged anyway.";
                strategyBtn.classList.remove('hidden');
            }
        }, 500);
        return true;
    }
    return false;
}

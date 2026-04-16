// Game State
let heaps = [];
let currentTurn = 'player'; // 'player' or 'bot'
let selectedHeapIndex = -1;
let selectedChipsCount = 0; // number of chips selected to remove
let difficulty = 'beatable'; // 'beatable' or 'unbeatable'
let gameMode = 'normal'; // 'normal' or 'misere'

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

// Mode UI
const modeNormalBtn = document.getElementById('mode-normal');
const modeMisereBtn = document.getElementById('mode-misere');

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

// Mode Selection Logic
modeNormalBtn.addEventListener('click', () => setMode('normal'));
modeMisereBtn.addEventListener('click', () => setMode('misere'));

function setMode(mode) {
    gameMode = mode;
    modeNormalBtn.classList.toggle('active', mode === 'normal');
    modeMisereBtn.classList.toggle('active', mode === 'misere');
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
    let startPositionIsWinning = (nimSum !== 0);

    // In Misere Nim, the winning position is the same as normal Nim 
    // EXCEPT when all piles are size 1.
    const allPilesSmall = heaps.every(h => h <= 1);
    if (gameMode === 'misere' && allPilesSmall) {
        // For all 1s: even number of piles (nimSum 0) is a winning start
        startPositionIsWinning = (nimSum === 0);
    }
    
    if (difficulty === 'beatable') {
        currentTurn = startPositionIsWinning ? 'player' : 'bot';
    } else {
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
            const chip = document.createElement('div');
            chip.className = 'chip';
            heapDiv.appendChild(chip);
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
        selectedChipsCount = 0; // Reset input count
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
                selectedChipsCount = val;
                confirmBtn.classList.remove('disabled');
                confirmBtn.disabled = false;
            } else {
                selectedChipsCount = 0;
                confirmBtn.classList.add('disabled');
                confirmBtn.disabled = true;
            }
        }
    });
}

function highlightChips(heapIndex, chipIndex) {
    const heapsNodes = heapsContainer.children;
    const chips = heapsNodes[heapIndex].children;

    for (let i = 0; i < chips.length; i++) {
        if (i <= chipIndex) {
            chips[i].classList.add('selected');
        } else {
            chips[i].classList.remove('selected');
        }
    }
}

function clearHighlights() {
    const heapsNodes = heapsContainer.children;
    for (const heapNode of heapsNodes) {
        for (const chip of heapNode.children) {
            chip.classList.remove('selected');
        }
    }
}

function selectChips(heapIndex, chipIndex) {
    selectedHeapIndex = heapIndex;
    selectedChipsCount = chipIndex + 1;
    updateBoard();
}

function cancelSelection() {
    selectedHeapIndex = -1;
    selectedChipsCount = 0;
    if (takeAmountInput) takeAmountInput.value = '';
    updateBoard();
}

function updateControls() {
    if (selectedHeapIndex !== -1) {
        controlsContainer.classList.remove('hidden');
        selectionInfo.textContent = `Heap ${selectedHeapIndex + 1} selected. How many chips?`;
        // Button state handled by input listener
    } else {
        controlsContainer.classList.add('hidden');
        confirmBtn.classList.add('disabled');
        confirmBtn.disabled = true;
    }
}

function executePlayerMove() {
    if (selectedHeapIndex === -1 || selectedChipsCount === 0) return;

    // Animate removal
    animateRemoval(selectedHeapIndex, selectedChipsCount, () => {
        heaps[selectedHeapIndex] -= selectedChipsCount;
        selectedHeapIndex = -1;
        selectedChipsCount = 0;

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

    // Misere Nim logic: Stage detection
    const heapsOverOne = heaps.filter(h => h > 1).length;

    if (gameMode === 'misere' && heapsOverOne <= 1) {
        // Misere Stage 2: Only 0 or 1 heap has more than 1 chip
        const totalPiles = heaps.filter(h => h > 0).length;
        const bigHeapIndex = heaps.findIndex(h => h > 1);
        
        if (bigHeapIndex !== -1) {
            // Case: Exactly one heap has > 1 chip. 
            // We must leave an ODD number of piles of size 1.
            const otherPilesCount = totalPiles - 1;
            const desiredPiles = (otherPilesCount % 2 === 0) ? 1 : 0;
            
            chosenHeap = bigHeapIndex;
            takeAmount = heaps[bigHeapIndex] - desiredPiles;
        } else {
            // Case: All heaps are size 1. Just take 1 from a random one.
            const availableHeaps = heaps
                .map((count, index) => count > 0 ? index : null)
                .filter(val => val !== null);
            chosenHeap = availableHeaps[Math.floor(Math.random() * availableHeaps.length)];
            takeAmount = 1;
        }
    } else if (nimSum !== 0) {
        // Standard Nim strategy (Normal Nim OR Stage 1 of Misere)
        for (let i = 0; i < heaps.length; i++) {
            const targetSize = heaps[i] ^ nimSum;
            if (targetSize < heaps[i]) {
                chosenHeap = i;
                takeAmount = heaps[i] - targetSize;
                break;
            }
        }
    } else {
        // Losing position, just take 1 from a random available heap
        const availableHeaps = heaps
            .map((count, index) => count > 0 ? index : null)
            .filter(val => val !== null);
        
        chosenHeap = availableHeaps[Math.floor(Math.random() * availableHeaps.length)];
        takeAmount = 1;
    }

    // Visually denote bot's choice
    selectedHeapIndex = chosenHeap;
    updateBoard();
    selectionInfo.textContent = `Bot is taking ${takeAmount} chip(s) from Heap ${chosenHeap + 1}...`;
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
    const totalChips = heaps.reduce((sum, h) => sum + h, 0);
    if (totalChips === 0) {
        gameScreen.classList.remove('active');
        setTimeout(() => {
            gameScreen.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
            gameOverScreen.offsetHeight;
            gameOverScreen.classList.add('active');

            // If currentTurn executed a move, and sum is 0, they took the last chip.
            const tookLastChip = (currentTurn === 'player');
            const playerWins = (gameMode === 'normal') ? tookLastChip : !tookLastChip;
            
            if (playerWins) {
                winnerText.textContent = "You Win!";
                winnerText.className = 'glow-text turn-player';
                winnerSubtext.textContent = gameMode === 'normal' 
                    ? "A brilliant display of strategy." 
                    : "You forced the bot into the last chip!";
                strategyBtn.classList.remove('hidden');
            } else {
                winnerText.textContent = "You Lose!";
                winnerText.className = 'glow-text turn-bot';
                winnerSubtext.textContent = gameMode === 'normal' 
                    ? "The bot predicted your every move. It's rigged anyway."
                    : "You were forced to take the final chip.";
                strategyBtn.classList.remove('hidden');
            }
        }, 500);
        return true;
    }
    return false;
}

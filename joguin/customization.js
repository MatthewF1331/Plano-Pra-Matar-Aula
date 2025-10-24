document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const customizationOverlay = document.getElementById('customization-overlay');
    const mainWrapper = document.querySelector('.main-wrapper');

    // Previews
    const previewHair = document.getElementById('preview-hair');
    const previewEar = document.getElementById('preview-ear');
    const previewHead = document.getElementById('preview-head');
    const previewNose = document.getElementById('preview-nose');
    const previewMouth = document.getElementById('preview-mouth');

    const optionButtons = document.querySelectorAll('.option-btn');
    const startGameButton = document.getElementById('start-customized-game-button');

    const PLAYER_CHARACTER_KEY = 'playerCharacter';

    // --- Estado Inicial ---
    let character = {
        head: 'round',
        hair: 'curly_light',
        ear: '1',
        nose: '1',
        mouth: '1'
    };

    // --- Funções ---

    function getCharacterImagePaths() {
        const { head, hair, ear, nose, mouth } = character;
        const emptyImg = 'img/customization/empty.png';
        
        return {
            hairSrc: hair === 'none' ? emptyImg : `img/customization/hair_${hair}_${head}.png`,
            earSrc: ear === 'none' ? emptyImg : `img/customization/ear${ear}_${head}.png`,
            headSrc: `img/customization/head_${head}.png`,
            noseSrc: `img/customization/nose${nose}_${head}.png`,
            mouthSrc: `img/customization/mouth${mouth}_${head}.png`
        };
    }

    function updateAllPreviews() {
        const paths = getCharacterImagePaths();
        previewHair.src = paths.hairSrc;
        previewEar.src = paths.earSrc;
        previewHead.src = paths.headSrc;
        previewNose.src = paths.noseSrc;
        previewMouth.src = paths.mouthSrc;
    }

    function updateActiveButtons() {
        optionButtons.forEach(btn => {
            const category = btn.dataset.category;
            const value = btn.dataset.value;
            btn.classList.toggle('active', character[category] === value);
        });
    }

    function saveCharacter() {
        const paths = getCharacterImagePaths();
        const characterToSave = { ...character, ...paths };
        localStorage.setItem(PLAYER_CHARACTER_KEY, JSON.stringify(characterToSave));
    }

    function handleOptionClick(event) {
        const clickedButton = event.currentTarget;
        character[clickedButton.dataset.category] = clickedButton.dataset.value;
        
        clickedButton.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;

        updateAllPreviews();
        updateActiveButtons();
    }

    function startGameFromCustomization() {
        saveCharacter();
        customizationOverlay.style.display = 'none';
        mainWrapper.style.display = 'flex';
        
        // Chama a função global do script.js
        if (typeof initializeGame === 'function') {
            initializeGame();
        } else {
            console.error("Função initializeGame() não encontrada.");
        }
    }

    function loadCharacter() {
        const savedCharacter = localStorage.getItem(PLAYER_CHARACTER_KEY);
        if (savedCharacter) {
            // Apenas carrega as seleções, não os caminhos de src
            const { head, hair, ear, nose, mouth } = JSON.parse(savedCharacter);
            character = { head, hair, ear, nose, mouth };
        }
        updateAllPreviews();
        updateActiveButtons();
    }

    // --- Execução e Event Listeners ---
    optionButtons.forEach(btn => btn.addEventListener('click', handleOptionClick));
    startGameButton.addEventListener('click', startGameFromCustomization);
    
    loadCharacter();
});
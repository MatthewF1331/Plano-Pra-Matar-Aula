// --- Seletores do DOM ---
const DOM = {
    wordInput: document.getElementById('word-input'),
    scoreDisplay: document.getElementById('score'),
    timeDisplay: document.getElementById('time'),
    livesDisplay: document.getElementById('lives'),
    startButton: document.getElementById('start-button'),
    enemySlots: document.querySelectorAll('.enemy-slot'),
    enemyArena: document.querySelector('.enemy-arena'),
    phaseLevelDisplay: document.getElementById('phase-level'),
    phaseTargetDisplay: document.getElementById('phase-target'),
    shopOverlay: document.getElementById('shop-overlay'),
    abilityCardsContainer: document.getElementById('ability-cards-container'),
    confirmAbilityButton: document.getElementById('confirm-ability-button'),
    activeAbilitiesContainer: document.getElementById('active-abilities-container'),
    phaseTitleDisplay: document.getElementById('phase-title'),
    gameContainer: document.querySelector('.game-container')
};

// --- Configuração e Constantes ---
const config = {
    maxLives: 3,
    phaseNames: ["Sala de Aula", "Biblioteca", "Corredor", "Portão"],
    bossNames: {
        aluna_exemplar: "Aluna Exemplar",
        professora_portugues: "Professora de Português",
        aluno_bagunceiro: "Aluno Bagunceiro",
        porteiro: "Porteiro"
    },
    phases: [
        { level: 1, scoreToNext: 30, startTime: 15, timeBonus: 5, timePenalty: 5, enemyCount: 1, bossTrigger: 25,  bossWords: 2 },
        { level: 2, scoreToNext: 100, startTime: 15, timeBonus: 3, timePenalty: 4, enemyCount: 2, bossTrigger: 80, bossWords: 3 },
        { level: 3, scoreToNext: 180, startTime: 15, timeBonus: 2, timePenalty: 3, enemyCount: 3, bossTrigger: 170, bossWords: 4 },
        { level: 4, scoreToNext: 260, startTime: 15, timeBonus: 1, timePenalty: 3, enemyCount: 3, bossTrigger: 240, bossWords: 5 }
    ],

    abilities: [
        {
            id: 'lapis',
            name: 'Lápis',
            description: 'Recebe o DOBRO de pontos por palavra, mas o custo é PERDER 1 vida permanentemente.',
            condition: () => gameState.lives > 1,
            apply: () => { gameState.lives--; gameState.doublePointsActive = true; } // Adiciona flag para duplicar pontos
        },
        {
            id: 'energetico',
            name: 'Energético',
            description: 'O bônus de tempo por acerto AUMENTA em 2 segundos, mas a penalidade por erro também AUMENTA em 2 segundos.',
            condition: () => true,
            apply: () => { config.phases.forEach(p => { p.timeBonus += 2; p.timePenalty += 2; }); }
        },
        {
            id: 'bola_de_papel',
            name: 'Bola de Papel',
            description: 'O bônus de tempo por acerto AUMENTA em 2 segundos, mas o custo é PERDER 1 vida.',
            condition: () => gameState.lives > 1, // Precisa ter mais de 1 vida
            apply: () => {
                gameState.lives--;
                config.phases.forEach(p => { p.timeBonus += 2; });
            }
        },
        {
            id: 'fofoca', // ID mantido, mas lógica e descrição alteradas
            name: 'Fofoca', // Nome mantido
            description: 'Ganha 1 VIDA extra (até o máximo), mas o tempo inicial das próximas fases DIMINUI em 5 segundos.',
            condition: () => gameState.lives < config.maxLives, // Precisa ter menos que o máximo de vidas
            apply: () => {
                gameState.lives++;
                config.phases.forEach(p => {
                    // Diminui o tempo inicial APENAS das fases futuras
                    if (p.level > gameState.currentPhaseIndex + 1) {
                        p.startTime = Math.max(5, p.startTime - 5); // Garante mínimo de 5s
                    }
                });
            }
        },
        {
            id: 'pesquisa',
            name: 'Pesquisa Rápida',
            description: 'Aumenta as chances de surgirem palavras fáceis. Mas custa 1 vida.',
            condition: () => gameState.lives > 1, // Precisa ter mais de 1 vida
            apply: () => {
                gameState.lives--;
                gameState.easyWordBoostActive = true; // Ativa o boost de palavras fáceis
            }
        },
        {
            id: 'pizza',
            name: 'Pizza',
            description: 'Restaura sua vida ao MÁXIMO, mas você PERDE METADE dos seus pontos atuais.',
            condition: () => gameState.lives < config.maxLives,
            apply: () => {
                gameState.lives = config.maxLives;
                gameState.score = Math.floor(gameState.score / 2);
            }
        },
        // --- NOVAS HABILIDADES ---
        {
            id: 'cafe',
            name: 'Café',
            description: 'A penalidade de tempo por erro é REDUZIDA pela metade, mas o bônus de tempo por acerto também é REDUZIDO pela metade.',
            condition: () => true,
            apply: () => {
                config.phases.forEach(p => {
                    p.timePenalty = Math.max(1, Math.ceil(p.timePenalty / 2)); // Garante penalidade mínima de 1s
                    p.timeBonus = Math.max(1, Math.ceil(p.timeBonus / 2));   // Garante bônus mínimo de 1s
                });
            }
        },
        {
            id: 'truco',
            name: 'Truco',
            description: 'Dobra a quantidade de pontos adquiridos ao acertar, mas perde uma vida.',
            condition: () => gameState.lives > 1, // Precisa ter mais de 1 vida
            apply: () => {
                gameState.lives--;
                gameState.doublePointsActive = true; // Ativa flag de pontos em dobro
            }
        },
        {
            id: 'fone',
            name: 'Fone de Ouvido',
            description: 'Caso acerte 6 palavras seguidas sem nenhum erro recebe mais uma vida (até o máximo), mas perde metade dos pontos atuais.',
            condition: () => true,
            apply: () => {
                gameState.score = Math.floor(gameState.score / 2);
                gameState.streakLifeBonusActive = true; // Ativa flag do bônus por sequência
            }
        }
    ],
    words: {
        easy: [
            'casa', 'gato', 'sol', 'lua', 'água', 'fogo', 'rei', 'paz', 'luz', 'flor',
            'pão', 'mar', 'céu', 'cor', 'som', 'ler', 'ver', 'ir', 'ser', 'ter',
            'azul', 'verde', 'mesa', 'livro', 'doce', 'hoje', 'tarde', 'noite', 'café', 'lápis'
        ],
        medium: [
            'janela', 'castelo', 'floresta', 'montanha', 'universo', 'planeta', 'estrela', 'amigo', 'escola', 'estudo',
            'trabalho', 'viagem', 'família', 'música', 'pintura', 'jardim', 'prateleira', 'computador', 'telefone', 'lanterna',
            'mochila', 'caderno', 'caneta', 'esquilo', 'baleia', 'golfinho', 'natureza', 'cidade', 'chuva', 'nuvem'
        ],
        hard: [
            'tecnologia', 'biblioteca', 'conhecimento', 'paradigma', 'filosofia', 'psicologia', 'aventura', 'horizonte', 'descoberta', 'curiosidade',
            'importante', 'necessário', 'complexidade', 'simplicidade', 'elegância', 'harmonia', 'silêncio', 'inspiração', 'criatividade', 'experiência',
            'arquitetura', 'engenharia', 'matemática', 'português', 'geografia', 'história', 'química', 'biologia', 'astronomia', 'sociologia'
        ],
        boss: [
                'procrastinar', 'idiossincrasia', 'vicissitudes', 'pernóstico', 'paralelepípedo', 'efemeridade', 'magnânimo', 'obsequioso', 'concupiscência', 'inexorável',
                'inefável', 'prolixo', 'recíproco', 'sorumbático', 'resiliência', 'quimera', 'ubiquidade', 'peremptório', 'idiossincrático', 'concomitante', // Removido espaço antes de idiossincrático
                'efetivamente', 'peculiaridade', 'significativo', 'substancial', 'fundamental', 'primordial', 'essencial', 'transcendental', 'consequência', 'perspectiva'
            ]
    },
    imagePaths: {
        enemy: {
            professor: { idle: 'img/professor_idle.png', hit: ['img/professor_hit1.png', 'img/professor_hit2.png'], defeated: 'img/professor_defeated.png' },
            aluno: { idle: 'img/aluno_idle.png', hit: ['img/aluno_hit.png'], defeated: 'img/aluno_defeated.png' }
        },
        boss: {
            aluna_exemplar: { idle: 'img/aluna_exemplar_idle.png', hit: ['img/aluna_exemplar_hit1.png', 'img/aluna_exemplar_hit2.png'], defeated: 'img/aluna_exemplar_defeated.png' },
            professora_portugues: { idle: 'img/professora_portugues_idle.png', hit: ['img/professora_portugues_hit1.png', 'img/professora_portugues_hit2.png'], defeated: 'img/professora_portugues_defeated.png' },
            aluno_bagunceiro: { idle: 'img/aluna_exemplar_idle.png', hit: ['img/aluna_exemplar_hit1.png', 'img/aluna_exemplar_hit2.png'], defeated: 'img/aluna_exemplar_defeated.png' },
            porteiro: { idle: 'img/porteiro_idle.png', hit: ['img/porteiro_hit1.png', 'img/porteiro_hit2.png'], defeated: 'img/porteiro_defeated.png' }
        },
        hitEffect: 'img/hit_effect.png'
    }
};

// --- Estado do Jogo ---
let gameState = {
    score: 0,
    time: 0,
    lives: 0,
    isPlaying: false,
    timeInterval: null,
    activeEnemies: [],
    lastCorrectInput: "",
    currentPhaseIndex: 0,
    isBossActive: false,
    totalTypedWords: 0,
    totalErrors: 0,
    gameStartTime: 0,
    isBossPending: false,
    timeCarryOver: 0,
    availableAbilities: [],
    chosenAbilities: new Set(),
    selectedAbilityId: null,

    doublePointsActive: false,  
    easyWordBoostActive: false,  
    streakLifeBonusActive: false, 
    correctStreak: 0              
};

// --- Funções Principais ---

function initializeGame() {
    DOM.startButton.style.display = 'none';

    // Reseta o estado do jogo
    gameState = {
        score: 0,
        lives: config.maxLives,
        isPlaying: true,
        currentPhaseIndex: 0,
        isBossActive: false,
        isBossPending: false,
        activeEnemies: [],
        chosenAbilities: new Set(),
        availableAbilities: [...config.abilities],
        timeCarryOver: 0,
        totalTypedWords: 0,
        totalErrors: 0,
        gameStartTime: Date.now(),
        lastCorrectInput: "",
        // --- RESET DAS NOVAS PROPRIEDADES ---
        doublePointsActive: false,
        easyWordBoostActive: false,
        streakLifeBonusActive: false,
        correctStreak: 0
    };
    
    DOM.activeAbilitiesContainer.innerHTML = '';
    
    setupNewPhase();
    
    DOM.wordInput.value = '';
    DOM.wordInput.disabled = false;
    DOM.wordInput.focus();
    
    clearInterval(gameState.timeInterval);
    gameState.timeInterval = setInterval(updateTimer, 1000);
}

function updateUI() {
    DOM.scoreDisplay.textContent = gameState.score;
    DOM.timeDisplay.textContent = gameState.time;
    updateLivesDisplay();
}

function updateLivesDisplay() {
    DOM.livesDisplay.innerHTML = '';
    if (gameState.lives > 0) {
        const lifeSprite = document.createElement('img');
        lifeSprite.src = `img/life${gameState.lives}.png`;
        lifeSprite.alt = `Vidas restantes: ${gameState.lives}`;
        lifeSprite.classList.add('life-sprite');
        DOM.livesDisplay.appendChild(lifeSprite);
    }
}

function updateTimer() {
    if (!gameState.isPlaying) return;

    if (gameState.time > 0) {
        gameState.time--;
    } else {
        gameState.lives--;
        if (gameState.lives <= 0) {
            endGame('Fim de Jogo: Sem Vidas!');
        } else {
            gameState.time = 10; // Tempo de recuperação
            showOnomatopeia('tempo.png');
        }
    }
    updateUI();
}

function setupNewPhase() {
    const phase = config.phases[gameState.currentPhaseIndex];
    DOM.phaseTitleDisplay.textContent = config.phaseNames[gameState.currentPhaseIndex];
    DOM.enemyArena.className = `enemy-arena arena-fase-${phase.level}`;
    
    gameState.time = phase.startTime + gameState.timeCarryOver;
    gameState.timeCarryOver = 0;
    gameState.isBossActive = false;
    gameState.isBossPending = false;
    gameState.lastCorrectInput = "";
    gameState.activeEnemies = [];
    
    DOM.enemySlots.forEach(slot => slot.innerHTML = '');
    DOM.phaseLevelDisplay.textContent = phase.level;
    DOM.phaseTargetDisplay.textContent = phase.scoreToNext;
    
    applyRandomRotation(DOM.timeDisplay);
    applyRandomRotation(DOM.scoreDisplay);
    showOnomatopeia(`fase${phase.level}.png`);
    
    updateUI();
    spawnEnemies();
    
    gameState.isPlaying = true;
    DOM.wordInput.disabled = false;
    DOM.wordInput.focus();
    
    clearInterval(gameState.timeInterval);
    gameState.timeInterval = setInterval(updateTimer, 1000);
}

function advancePhase() {
    gameState.currentPhaseIndex++;
    if (gameState.currentPhaseIndex >= config.phases.length) {
        endGame('Você Venceu o Jogo!');
        return;
    }
    setupNewPhase();
}

function handleInput() {
    // Se o jogo não estiver rodando, não faz nada
    if (!gameState.isPlaying) return;

    // Pega o valor digitado e a fase atual
    const typedValue = DOM.wordInput.value;
    const phase = config.phases[gameState.currentPhaseIndex];

    // Tenta encontrar um inimigo cuja palavra comece com o valor digitado
    const targetEnemy = gameState.activeEnemies.find(enemy => enemy.word.startsWith(typedValue));

    // SE encontrou um inimigo correspondente (acerto parcial ou completo)
    if (targetEnemy) {
        // Reseta a sequência de acertos se o jogador começou a digitar uma nova palavra
        // antes de terminar a anterior (ex: digitou 'ca' de 'casa', apagou e digitou 's' de 'sol')
        if (typedValue.length === 1 && gameState.lastCorrectInput.length > 0 && !targetEnemy.word.startsWith(gameState.lastCorrectInput)) {
             gameState.correctStreak = 0;
        }

        // Atualiza o último input correto e anima o hit no inimigo
        gameState.lastCorrectInput = typedValue;
        animateHit(targetEnemy); //

        // SE o valor digitado é EXATAMENTE a palavra do inimigo
        if (typedValue === targetEnemy.word) {
            // Limpa o timeout de voltar para idle (animação de hit)
            clearTimeout(targetEnemy.hitTimeoutId); //

            // Adiciona pontos (considerando bônus de 'Lápis'/'Truco')
            gameState.score += targetEnemy.currentPoints; //
            // Adiciona bônus de tempo (considerando bônus/redução de 'Energético'/'Café'/'Bola de Papel')
            gameState.time += phase.timeBonus; //

            // Limpa o campo de input e reseta o último input correto
            DOM.wordInput.value = ''; //
            gameState.lastCorrectInput = ""; //
            gameState.totalTypedWords++; //

            // --- Lógica para 'Fone de Ouvido' ---
            gameState.correctStreak++; // Incrementa contador de acertos seguidos //
            // Se a habilidade está ativa e o jogador atingiu 6 acertos seguidos
            if (gameState.streakLifeBonusActive && gameState.correctStreak >= 6) { //
                // Se não estiver com vidas no máximo
                if (gameState.lives < config.maxLives) { //
                    gameState.lives++; // Ganha uma vida //
                    showOnomatopeia('vidaextra.png'); // Mostra efeito visual (opcional) //
                }
                gameState.correctStreak = 0; // Reseta a contagem após ganhar a vida //
            }
            // --- FIM Lógica 'Fone de Ouvido' ---

            // Lógica específica se for um Boss
            if (targetEnemy.isBoss) { //
                targetEnemy.wordList.shift(); // Remove a palavra atual da lista do boss //
                // Se ainda houver palavras na lista do boss
                if (targetEnemy.wordList.length > 0) { //
                    targetEnemy.word = targetEnemy.wordList[0]; // Define a próxima palavra //
                    updateEnemyWord(targetEnemy); // Atualiza a exibição da palavra //
                } else {
                    // Boss derrotado
                    defeatEnemy(targetEnemy); //
                    showOnomatopeia('fase-limpa.png'); //
                    // Espera um pouco antes de ir para a loja ou fim do jogo
                    setTimeout(() => {
                        // Se for a última fase, avança (fim do jogo)
                        if (gameState.currentPhaseIndex === config.phases.length - 1) { //
                            advancePhase(); //
                        } else {
                            // Senão, mostra a loja de habilidades
                            showShop(); //
                        }
                    }, 1200);
                }
            } else { // Lógica se for um inimigo normal
                defeatEnemy(targetEnemy); //
                // Espera um pouco antes de decidir o próximo passo
                setTimeout(() => {
                    if (!gameState.isPlaying) return; // Checa se o jogo ainda está ativo
                    // Verifica se atingiu a pontuação para o Boss E se o boss ainda não apareceu
                    if (gameState.score >= phase.bossTrigger && !gameState.isBossActive && !gameState.isBossPending) { //
                        gameState.isBossPending = true; // Marca que o boss deve aparecer //
                        showOnomatopeia('prepare.png'); //
                    }
                    // Se não há mais inimigos na tela
                    if (gameState.activeEnemies.length === 0) { //
                        // Se o boss está pendente para aparecer
                        if (gameState.isBossPending) { //
                            spawnBoss(); // Chama o boss //
                        // Se atingiu a pontuação para a próxima fase E não é a última fase
                        } else if (gameState.score >= phase.scoreToNext && gameState.currentPhaseIndex < config.phases.length - 1) { //
                            showShop(); // Mostra a loja //
                        } else {
                            // Senão, apenas spawna mais inimigos normais
                            spawnEnemies(); //
                        }
                    }
                }, 1200);
            }
            updateUI(); // Atualiza a interface (pontos, tempo, vidas) //
        }
    // SE NÃO encontrou inimigo correspondente E algo foi digitado (erro)
    } else if (typedValue.length > 0) {
        // Encontra o inimigo que estava sendo digitado (se houver)
        const enemyBeingTyped = gameState.activeEnemies.find(e => e.word.startsWith(gameState.lastCorrectInput)); //
        // Se encontrou, diminui os pontos que ele vale (penalidade por erro)
        if (enemyBeingTyped) { //
            enemyBeingTyped.currentPoints = Math.max(1, enemyBeingTyped.currentPoints - 1); //
        }

        // Calcula a penalidade de tempo (maior se for boss)
        let penalty = gameState.isBossActive ? phase.timePenalty + 1 : phase.timePenalty; //
        // Aplica a penalidade (garante que não fique negativo)
        gameState.time = Math.max(0, gameState.time - penalty); //

        // Mostra feedback visual de erro no input
        DOM.wordInput.classList.add('error'); //
        // Volta o valor do input para o último acerto válido
        DOM.wordInput.value = gameState.lastCorrectInput; //
        // Remove a classe de erro após animação
        setTimeout(() => DOM.wordInput.classList.remove('error'), 300); //

        gameState.totalErrors++; // Incrementa contador de erros //

        // --- Reseta streak no erro ---
        gameState.correctStreak = 0; //
        // --- Fim ---

        updateUI(); // Atualiza a interface //
    }
}

// --- Funções de Inimigos e Chefes ---
/*
function calculatePoints(word) {
    let basePoints = Math.ceil(word.length / 2);
    if (gameState.chosenAbilities.has('fofoca')) { basePoints += 5; }
    if (gameState.chosenAbilities.has('lapis')) { basePoints *= 2; }
    return basePoints;
}*/
function calculatePoints(word) {
    let basePoints = Math.ceil(word.length / 2);

    if (gameState.doublePointsActive) {
        basePoints *= 2;
    }
    return basePoints;
}

function createMisspelledWord(word) {
    if (word.length < 4) return word;
    let chars = word.split('');
    const misspellType = Math.floor(Math.random() * 3);
    switch (misspellType) {
        case 0:
            const swapIndex = Math.floor(Math.random() * (chars.length - 1));
            [chars[swapIndex], chars[swapIndex + 1]] = [chars[swapIndex + 1], chars[swapIndex]];
            break;
        case 1:
            const doubleIndex = Math.floor(Math.random() * chars.length);
            chars.splice(doubleIndex, 0, chars[doubleIndex]);
            break;
        case 2:
            const vowels = "aeiou";
            const vowelIndices = chars.map((c, i) => vowels.includes(c) ? i : -1).filter(i => i !== -1);
            if (vowelIndices.length > 0) {
                const charIndexToChange = vowelIndices[Math.floor(Math.random() * vowelIndices.length)];
                let newVowel = vowels[Math.floor(Math.random() * vowels.length)];
                while (newVowel === chars[charIndexToChange]) {
                    newVowel = vowels[Math.floor(Math.random() * vowels.length)];
                }
                chars[charIndexToChange] = newVowel;
            }
            break;
    }
    return chars.join('');
}

// EM script.js, SUBSTITUA A FUNÇÃO spawnEnemies

function spawnEnemies() {
    if (gameState.isBossActive) return;
    const phase = config.phases[gameState.currentPhaseIndex];

    // --- LÓGICA DE SELEÇÃO DE PALAVRAS (para 'Pesquisa Rápida') ---
    let wordPool;
    const easyWords = config.words.easy;
    const mediumWords = config.words.medium;
    const hardWords = config.words.hard;

    // Define a dificuldade padrão da fase
    let currentDifficultyWords = phase.level === 1 ? easyWords :
                                 phase.level === 2 ? mediumWords :
                                 hardWords;

    // Se 'Pesquisa Rápida' está ativa E não estamos na fase 1 (onde já são fáceis)
    if (gameState.easyWordBoostActive && phase.level > 1) {
        // Aumenta a chance de pegar palavras fáceis
        // Ex: 50% de chance de palavra fácil, 50% da dificuldade normal da fase
        if (Math.random() < 0.5) {
            wordPool = easyWords;
        } else {
            wordPool = currentDifficultyWords;
        }
    } else {
        // Usa a dificuldade normal da fase
        wordPool = currentDifficultyWords;
    }
    // --- FIM DA LÓGICA DE SELEÇÃO ---

    for (let i = 0; i < phase.enemyCount; i++) {
        let availableSlot;
        if (phase.enemyCount === 1) {
            availableSlot = 1; // Slot central para inimigo único
        } else {
            availableSlot = findAvailableSlot();
        }
        if (availableSlot === null) break; // Sem slots livres

        // Pega uma palavra aleatória do pool selecionado
        const newWord = wordPool[Math.floor(Math.random() * wordPool.length)];
        const points = calculatePoints(newWord); // Usa a função atualizada
        const enemyType = Math.random() < 0.5 ? 'professor' : 'aluno'; // Escolhe tipo aleatório

        const enemyData = {
            word: newWord,
            slot: availableSlot,
            isBoss: false,
            enemyType: enemyType,
            hitTimeoutId: null,
            basePoints: points, // Pontos base calculados
            currentPoints: points, // Pontos atuais (podem diminuir com erros)
            currentHitFrame: 0
        };
        gameState.activeEnemies.push(enemyData);
        renderEnemy(enemyData);
    }
}

function spawnBoss() {
    gameState.isBossActive = true;
    gameState.isBossPending = false;
    gameState.activeEnemies = [];
    DOM.enemySlots.forEach(slot => slot.innerHTML = '');
    showOnomatopeia('boss.png');

    const phase = config.phases[gameState.currentPhaseIndex];
    let bossType;
    switch (phase.level) {
        case 1: bossType = 'aluna_exemplar'; break;
        case 2: bossType = 'professora_portugues'; break;
        case 3: bossType = 'aluno_bagunceiro'; break;
        case 4: bossType = 'porteiro'; break;
        default: bossType = 'aluna_exemplar';
    }
    
    const bossName = config.bossNames[bossType] || "Chefe Misterioso";
    DOM.phaseTitleDisplay.textContent = `${config.phaseNames[gameState.currentPhaseIndex]} - ${bossName}`;

    const wordsNeeded = phase.bossWords;
    const bossWordList = [];
    const availableBossWords = [...config.words.hard, ...config.words.boss];
    
    for (let i = 0; i < wordsNeeded; i++) {
        if (availableBossWords.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availableBossWords.length);
        let newWord = availableBossWords.splice(randomIndex, 1)[0];
        if (phase.level === 3) {
            newWord = createMisspelledWord(newWord);
        }
        bossWordList.push(newWord);
    }
    
    const points = calculatePoints(bossWordList[0]);
    const bossData = {
        word: bossWordList[0],
        wordList: bossWordList,
        slot: 1,
        isBoss: true,
        enemyType: bossType,
        basePoints: points,
        currentPoints: points,
        currentHitFrame: 0
    };
    gameState.activeEnemies.push(bossData);
    renderEnemy(bossData);
}

// --- Funções da Loja ---
function showShop() {
    gameState.timeCarryOver = gameState.time;
    gameState.isPlaying = false;
    clearInterval(gameState.timeInterval);
    DOM.wordInput.disabled = true;
    gameState.selectedAbilityId = null;
    DOM.confirmAbilityButton.disabled = true;
    DOM.abilityCardsContainer.innerHTML = '';
    
    const postitImages = ['postit1.png', 'postit2.png', 'postit3.png'];
    const rotationClasses = ['rotate-left', '', 'rotate-right'];
    
    const abilitiesToShow = [];
    const unchosenAbilities = gameState.availableAbilities.filter(ability => !gameState.chosenAbilities.has(ability.id));
    const selectableAbilities = unchosenAbilities.filter(ability => ability.condition());
    
    while (abilitiesToShow.length < 3 && selectableAbilities.length > 0) {
        const randomIndex = Math.floor(Math.random() * selectableAbilities.length);
        abilitiesToShow.push(selectableAbilities.splice(randomIndex, 1)[0]);
    }
    
    abilitiesToShow.forEach(ability => {
        const card = document.createElement('div');
        card.classList.add('ability-card');
        card.dataset.id = ability.id;
        card.innerHTML = `<h3>${ability.name}</h3><p>${ability.description}</p>`;
        
        const randomImage = postitImages[Math.floor(Math.random() * postitImages.length)];
        card.style.backgroundImage = `url('img/${randomImage}')`;
        
        const randomRotation = rotationClasses[Math.floor(Math.random() * rotationClasses.length)];
        if (randomRotation) {
            card.classList.add(randomRotation);
        }
        
        if (!ability.condition()) {
            card.classList.add('disabled');
        } else {
            card.addEventListener('click', () => {
                selectAbility(ability.id);
            });
        }
        DOM.abilityCardsContainer.appendChild(card);
    });
    DOM.shopOverlay.style.display = 'flex';
}

function selectAbility(abilityId) {
    gameState.selectedAbilityId = abilityId;
    const cards = document.querySelectorAll('.ability-card');
    cards.forEach(card => { card.classList.toggle('selected', card.dataset.id === abilityId); });
    DOM.confirmAbilityButton.disabled = false;
}

function confirmAbilityChoice() {
    if (!gameState.selectedAbilityId) return;
    const ability = config.abilities.find(a => a.id === gameState.selectedAbilityId);
    if (ability) {
        ability.apply();
        gameState.chosenAbilities.add(ability.id);
        
        const stickerImg = document.createElement('img');
        stickerImg.src = `img/stickers/${ability.id}.png`;
        stickerImg.classList.add('ability-sticker');
        stickerImg.title = ability.description;
        DOM.activeAbilitiesContainer.appendChild(stickerImg);
    }
    
    DOM.shopOverlay.style.display = 'none';
    updateUI(); // Atualiza UI caso a habilidade mude vidas/pontos
    advancePhase();
}

// --- Funções de Animação e Utilidades ---
function defeatEnemy(enemyData) {
    const entityImagePaths = enemyData.isBoss ? config.imagePaths.boss[enemyData.enemyType] : config.imagePaths.enemy[enemyData.enemyType];
    const enemyInstance = document.getElementById(`enemy-instance-slot-${enemyData.slot}`);
    const enemyImg = document.getElementById(`enemy-img-slot-${enemyData.slot}`);
    
    if (enemyInstance && enemyImg) {
        clearTimeout(enemyData.hitTimeoutId);
        enemyImg.src = entityImagePaths.defeated;
        gameState.activeEnemies = gameState.activeEnemies.filter(e => e.slot !== enemyData.slot);
        
        setTimeout(() => {
            enemyInstance.style.transition = 'opacity 0.3s, transform 0.3s';
            enemyInstance.style.opacity = '0';
            enemyInstance.style.transform = 'scale(0.8)';
            setTimeout(() => enemyInstance.remove(), 300);
        }, enemyData.isBoss ? 3000 : 1000);
    }
}

function renderEnemy(enemyData) {
    const entityImagePaths = enemyData.isBoss ? config.imagePaths.boss[enemyData.enemyType] : config.imagePaths.enemy[enemyData.enemyType];
    const slotElement = DOM.enemySlots[enemyData.slot];
    const instanceClass = enemyData.isBoss ? 'boss-instance' : '';
    const typeClass = enemyData.isBoss ? `boss-${enemyData.enemyType}` : `enemy-${enemyData.enemyType}`;
    
    slotElement.innerHTML = `
        <div class="enemy-instance ${instanceClass} ${typeClass}" id="enemy-instance-slot-${enemyData.slot}">
            <img src="${entityImagePaths.idle}" alt="Inimigo" class="enemy-img" id="enemy-img-slot-${enemyData.slot}">
            <div class="enemy-word" id="word-display-slot-${enemyData.slot}">${enemyData.word}</div>
        </div>`;
}

function updateEnemyWord(enemyData) {
    const wordDisplay = document.getElementById(`word-display-slot-${enemyData.slot}`);
    if (wordDisplay) {
        const newPoints = calculatePoints(enemyData.word);
        enemyData.basePoints = newPoints;
        enemyData.currentPoints = newPoints;
        wordDisplay.textContent = enemyData.word;
        wordDisplay.classList.add('word-flash');
        setTimeout(() => wordDisplay.classList.remove('word-flash'), 400);
    }
}

function animateHit(targetEnemy) {
    const entityImagePaths = targetEnemy.isBoss ? config.imagePaths.boss[targetEnemy.enemyType] : config.imagePaths.enemy[targetEnemy.enemyType];
    const enemyImg = document.getElementById(`enemy-img-slot-${targetEnemy.slot}`);
    const enemySlot = DOM.enemySlots[targetEnemy.slot];
    if (!enemyImg || !enemySlot) return;
    
    createHitEffect(enemySlot);
    targetEnemy.currentHitFrame = (targetEnemy.currentHitFrame + 1) % entityImagePaths.hit.length;
    enemyImg.src = entityImagePaths.hit[targetEnemy.currentHitFrame];
    
    clearTimeout(targetEnemy.hitTimeoutId);
    targetEnemy.hitTimeoutId = setTimeout(() => {
        if (document.getElementById(`enemy-img-slot-${targetEnemy.slot}`)) {
            enemyImg.src = entityImagePaths.idle;
        }
    }, 300);
}

function createHitEffect(targetSlot) {
    const hitEffect = document.createElement('img');
    hitEffect.src = config.imagePaths.hitEffect;
    hitEffect.classList.add('hit-effect');
    const randomX = Math.floor(Math.random() * 80) - 40;
    const randomY = Math.floor(Math.random() * 80) - 120;
    hitEffect.style.left = `calc(50% + ${randomX}px)`;
    hitEffect.style.top = `calc(50% + ${randomY}px)`;
    targetSlot.appendChild(hitEffect);
    hitEffect.addEventListener('animationend', () => hitEffect.remove());
}

function findAvailableSlot() {
    const occupiedSlots = gameState.activeEnemies.map(e => e.slot);
    for (let i = 0; i < DOM.enemySlots.length; i++) {
        if (!occupiedSlots.includes(i)) return i;
    }
    return null;
}

// EM script.js, SUBSTITUA A FUNÇÃO endGame INTEIRA POR ESTA:

async function endGame(message) {
    gameState.isPlaying = false;
    clearInterval(gameState.timeInterval);
    DOM.wordInput.disabled = true;

    // Garante que os displays tenham texto simples para a tela de resumo
    DOM.scoreDisplay.textContent = gameState.score;
    DOM.timeDisplay.textContent = gameState.time;
    DOM.livesDisplay.textContent = gameState.lives;

    const didWin = message.includes('Venceu');
    showOnomatopeia(didWin ? 'vitoria.png' : 'gameover.png');

    const gameDurationMinutes = (Date.now() - gameState.gameStartTime) / 60000;
    const wpm = gameDurationMinutes > 0 ? Math.round(gameState.totalTypedWords / gameDurationMinutes) : 0;

    const finalData = {
        score: gameState.score,
        phase: gameState.currentPhaseIndex + 1,
        lives: gameState.lives,
        time: gameState.time,
        wpm: wpm,
        errors: gameState.totalErrors,
        win: didWin
    };

    const grade = calculateGrade(finalData);
    const rarity = determineRarityByGrade(grade, finalData);
    const rarityVariations = { c: 10, i: 8, r: 6, l: 4 };
    const maxVariation = rarityVariations[rarity.toLowerCase()];
    const frameVariation = Math.floor(Math.random() * maxVariation);

    // --- INÍCIO DA CORREÇÃO ---
    // Corrigido para usar "_" nos nomes dos arquivos de background
    const backgroundPools = {
        c: ['img/card_backgrounds/bg_1.png'], // Adicionado _
        i: ['img/card_backgrounds/bg_2.png'], // Adicionado _
        r: ['img/card_backgrounds/bg_3.png'], // Adicionado _
        l: ['img/card_backgrounds/bg_4.png']  // Adicionado _
    };

    // Pega o pool de backgrounds correto (c, i, r, ou l)
    const currentPool = backgroundPools[rarity.toLowerCase()];
    // Seleciona um background aleatório desse pool
    const randomBackground = currentPool[Math.floor(Math.random() * currentPool.length)];
    // --- FIM DA CORREÇÃO ---


    const cardLayers = {
        frame: `img/card_frames/rarity_${rarity.toLowerCase()}_${frameVariation}.png`,
        background: randomBackground // Usa o caminho corrigido
    };

    setTimeout(() => {
        showSummaryScreen(finalData, grade, cardLayers, Array.from(gameState.chosenAbilities));
    }, 1200);
}


function calculateGrade(finalData) {
    const { score, lives, errors, phase, win } = finalData; // 'win' adicionado para clareza

    // A+ : Conclusão perfeita ou quase perfeita
    if (win && score >= 170 && errors <= 2 && lives === 3) return 'a+'; // Precisa vencer, pontuação alta, poucos erros, vidas máximas

    // A : Conclusão excelente ou desempenho excepcional na fase 3
    if (win && score >= 150 && errors <= 5 && lives >= 2) return 'a'; // Venceu, boa pontuação, erros moderados, boas vidas
    if (phase === 4 && score >= 160 && errors <= 4 && lives >= 1) return 'a'; // Chegou ao chefe da fase final, pontuação/erros excelentes
    if (phase === 3 && score >= 170 && errors <= 3 && lives >= 2) return 'a'; // Não terminou, mas desempenho estelar na fase 3

    // B+ : Conclusão sólida ou desempenho muito bom na fase 3
    if (win && score >= 120 && errors <= 8 && lives >= 1) return 'b+'; // Venceu, pontuação decente, permite mais erros
    if (phase === 4 && score >= 130 && errors <= 7) return 'b+';       // Chegou ao chefe da fase final, boa pontuação
    if (phase === 3 && score >= 140 && errors <= 6 && lives >= 1) return 'b+'; // Desempenho muito bom na fase 3

    // B : Concluiu bem a maior parte do jogo, ou bom desempenho na fase 2
    if (phase === 3 && score >= 110 && errors <= 10) return 'b';      // Chegou ao chefe da fase 3, boa pontuação
    if (phase === 2 && score >= 120 && errors <= 8 && lives >= 1) return 'b'; // Bom desempenho na fase 2

    // C+ : Chegou na metade com uma pontuação decente
    if (phase === 2 && score >= 90 && errors <= 12) return 'c+';

    // C : Chegou na metade do jogo
    if (phase === 2 && score >= 70) return 'c';

    // D+ : Fez um bom progresso na primeira fase
    if (phase === 1 && score >= 50 && errors <= 10) return 'd+';

    // D : Fez algum progresso na primeira fase
    if (phase === 1 && score >= 30) return 'd';

    // F : Não atendeu aos requisitos mínimos
    return 'f';
}

function determineRarityByGrade(grade, finalData) {
    const gradeUpper = grade.toUpperCase();
    if (['F', 'D', 'D+'].includes(gradeUpper)) {
        return Math.random() < 0.5 ? 'C' : 'I';
    } else if (['A', 'A+'].includes(gradeUpper)) {
        return Math.random() < 0.25 ? 'L' : determineRarity(finalData);
    } else {
        return determineRarity(finalData);
    }
}

function determineRarity(finalData) {
    const { score, wpm, win } = finalData;
    if (win && score > 140 && wpm > 40) return 'L';
    if (score > 100 && wpm > 30) return 'R';
    if (score > 50 || wpm > 25) return 'I';
    return 'C';
}

function showOnomatopeia(imageName) {
    const onomatopeiaImg = document.createElement('img');
    onomatopeiaImg.src = `img/onomatopeias/${imageName}`;
    onomatopeiaImg.classList.add('onomatopeia-effect');
    DOM.gameContainer.appendChild(onomatopeiaImg);
    setTimeout(() => {
        onomatopeiaImg.remove();
    }, 1500);
}

function applyRandomRotation(element) {
    const rotationClasses = ['rotate-text-left', '', 'rotate-text-right'];
    element.classList.remove('rotate-text-left', 'rotate-text-right');
    const randomRotation = rotationClasses[Math.floor(Math.random() * rotationClasses.length)];
    if (randomRotation) {
        element.classList.add(randomRotation);
    }
}

// --- Event Listeners ---
DOM.startButton.addEventListener('click', initializeGame);
DOM.confirmAbilityButton.addEventListener('click', confirmAbilityChoice);
DOM.wordInput.addEventListener('input', handleInput);
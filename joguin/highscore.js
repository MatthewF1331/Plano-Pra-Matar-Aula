// highscore.js

// --- Elementos do DOM ---
const highscoreList = document.getElementById('highscore-list');
const nameInputOverlay = document.getElementById('name-input-overlay');
const playerNameInput = document.getElementById('player-name-input');
const submitScoreButton = document.getElementById('submit-score-button');
const shareCardButton = document.getElementById('share-card-button');

// --- Elementos do QR Code ---
const qrCodeOverlay = document.getElementById('qr-code-overlay');
const qrCodeContainer = document.getElementById('qr-code-container');
const closeQrButton = document.getElementById('close-qr-button');

const HIGHSCORE_KEY = 'typingGameHighscores';

// --- Variáveis para guardar dados do resumo ---
let summaryData = {};

// --- Funções do Highscore ---

function loadHighscores() {
    const scoresJSON = localStorage.getItem(HIGHSCORE_KEY);
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

function saveHighscores(scores) {
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(top10));
}

function displayHighscores() {
    const scores = loadHighscores();
    highscoreList.innerHTML = '';
    if (scores.length === 0) {
        highscoreList.innerHTML = '<li>Ainda não há pontuações!</li>';
        return;
    }
    scores.forEach((scoreEntry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}.</span> <span class="player-name">${scoreEntry.name}</span> <span class="player-score">${scoreEntry.score}</span>`;
        highscoreList.appendChild(li);
    });
}

function addHighscore(name, score) {
    const scores = loadHighscores();
    const existingPlayerIndex = scores.findIndex(entry => entry.name.toLowerCase() === name.toLowerCase());

    if (existingPlayerIndex !== -1) {
        if (score > scores[existingPlayerIndex].score) {
            scores[existingPlayerIndex].score = score;
        }
    } else {
        scores.push({ name, score });
    }
    
    saveHighscores(scores);
    displayHighscores();
}

// --- Função da Tela de Resumo ---

// EM highscore.js, SUBSTITUA A FUNÇÃO showSummaryScreen POR ESTA:

function showSummaryScreen(finalData, grade, cardLayers, acquiredAbilities) {
    // 1. Armazena os dados para o QR code
    summaryData = { finalData, grade, cardLayers };

    // 2. Exibir a nota
    const gradeDisplay = document.getElementById('grade-display');
    gradeDisplay.innerHTML = `<img id="grade-image" src="img/grades/${grade}.png" alt="Sua nota: ${grade.toUpperCase()}">`;

    // 3. Preencher estatísticas
    document.getElementById('final-score').textContent = finalData.score;
    document.getElementById('final-phase').textContent = finalData.phase;
    document.getElementById('final-lives').textContent = finalData.lives;
    document.getElementById('final-time').textContent = finalData.time;
    document.getElementById('final-wpm').textContent = finalData.wpm;
    document.getElementById('final-errors').textContent = finalData.errors;

    // 4. Exibir habilidades
    const abilitiesContainer = document.getElementById('final-abilities-container');
    abilitiesContainer.innerHTML = '';
    if (acquiredAbilities && acquiredAbilities.length > 0) {
        acquiredAbilities.forEach(abilityId => {
            const stickerImg = document.createElement('img');
            stickerImg.src = `img/stickers/${abilityId}.png`;
            stickerImg.classList.add('ability-sticker');
            stickerImg.style.height = '40px';
            abilitiesContainer.appendChild(stickerImg);
        });
    } else {
        abilitiesContainer.innerHTML = '<p style="font-size: 0.9rem; color: #7f8c8d;">Nenhuma.</p>';
    }

    document.getElementById('summary-title').textContent = finalData.win ? 'Vitória!' : 'Fim de Jogo!';
    
    // 5. Montar a carta
    const bgLayer = document.getElementById('card-layer-bg');
    const frameLayer = document.getElementById('card-layer-frame');
    const characterLayer = document.getElementById('card-layer-character');

    // Define os sources corretos
    bgLayer.src = cardLayers.background;
    frameLayer.src = cardLayers.frame;

    // Verifica se o FRAME é lendário
    const isLegendary = cardLayers.frame.includes('rarity_l');

    // --- CORREÇÃO AQUI ---
    // Aplica display:none APENAS ao characterLayer se for lendário.
    // O bgLayer NUNCA deve ser escondido aqui.
    bgLayer.style.display = 'block'; // Garante que o fundo esteja sempre visível
    characterLayer.style.display = isLegendary ? 'none' : 'block';
    // --- FIM DA CORREÇÃO ---


    if (!isLegendary) {
        const characterData = JSON.parse(localStorage.getItem('playerCharacter'));
        if (characterData) {
            document.getElementById('char-layer-hair').src = characterData.hairSrc || 'img/customization/empty.png';
            document.getElementById('char-layer-ear').src = characterData.earSrc || 'img/customization/empty.png';
            document.getElementById('char-layer-head').src = characterData.headSrc || 'img/customization/empty.png';
            document.getElementById('char-layer-nose').src = characterData.noseSrc || 'img/customization/empty.png';
            document.getElementById('char-layer-mouth').src = characterData.mouthSrc || 'img/customization/empty.png';
        }
    }

    // 6. Exibir a tela
    nameInputOverlay.style.display = 'flex';
    playerNameInput.focus();
    submitScoreButton.disabled = false;
    shareCardButton.disabled = false;
    shareCardButton.textContent = 'Compartilhar Carta';
}

// --- Manipuladores de Eventos ---

function handleContinue() {
    const playerName = playerNameInput.value.trim();
    const finalScore = parseInt(document.getElementById('final-score').textContent, 10);

    if (playerName) {
        if (playerName.toLowerCase() === 'apaguetudo') {
            localStorage.removeItem(HIGHSCORE_KEY);
            displayHighscores();
        } else if (finalScore > 0) {
            addHighscore(playerName, finalScore);
        }
    }
    
    submitScoreButton.disabled = true;
    shareCardButton.disabled = true;

    setTimeout(() => {
        window.location.href = 'menu.html';
    }, 400);
}

/**
 * NOVA LÓGICA DE COMPARTILHAMENTO: Gerar URL e mostrar QR Code.
 */
function handleShare() {
    shareCardButton.textContent = 'Gerando...';
    shareCardButton.disabled = true;
    
    try {
        const { finalData, grade, cardLayers } = summaryData;
        const character = JSON.parse(localStorage.getItem('playerCharacter'));

        // 1. Constrói o caminho base (Ex: http://192.168.100.6/joguin-1)
        // Isso usa o IP/hostname que você usou para acessar a página
        const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

        // 2. Coleta todos os dados para a URL
        const params = new URLSearchParams();
        params.append('score', finalData.score);
        params.append('wpm', finalData.wpm);
        params.append('grade', grade);
        params.append('phase', finalData.phase);
        params.append('playerName', playerNameInput.value.trim() || '???');

        // Passa os caminhos das imagens
        // O PHP vai receber "img/card_frames/rarity_r_2.png"
        params.append('frameSrc', cardLayers.frame);
        params.append('bgSrc', cardLayers.background);

        // Passa as IDs do personagem para o PHP reconstruir os caminhos
        params.append('head', character.head || 'round');
        params.append('hair', character.hair || 'none');
        params.append('ear', character.ear || 'none');
        params.append('nose', character.nose || '1');
        params.append('mouth', character.mouth || '1');

        // 3. Monta a URL final
        const shareUrl = `${baseUrl}/share.php?${params.toString()}`;

        // 4. Gera o QR Code
        qrCodeContainer.innerHTML = ''; // Limpa o anterior
        new QRCode(qrCodeContainer, {
            text: shareUrl,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // 5. Exibe o overlay
        qrCodeOverlay.style.display = 'flex';

    } catch (error) {
        console.error("Erro ao gerar URL para QR Code:", error);
    } finally {
        shareCardButton.textContent = 'Compartilhar Carta';
        shareCardButton.disabled = false;
    }
}

function closeQrOverlay() {
    qrCodeOverlay.style.display = 'none';
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', displayHighscores);
submitScoreButton.addEventListener('click', handleContinue);
shareCardButton.addEventListener('click', handleShare);
closeQrButton.addEventListener('click', closeQrOverlay);
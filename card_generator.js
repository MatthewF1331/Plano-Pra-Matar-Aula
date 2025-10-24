// --- BIBLIOTECA DE DADOS PARA A CARTA ---
const cardDataPools = {
    icons: ['img/card_icons/icon1.png', 'img/card_icons/icon2.png', 'img/card_icons/icon3.png'],
    backgrounds: {
        C: ['img/card_backgrounds/bg1.png'],
        I: ['img/card_backgrounds/bg2.png'],
        R: ['img/card_backgrounds/bg3.png'],
        L: ['img/card_backgrounds/bg4.png']
    },
    titles: ["O Escriba Veloz", "Mestre das Teclas", "O Poeta Digital"],
    flavorTexts: [
        "Nascido na era do dial-up, forjado no fogo do chat online.",
        "Cada erro é apenas uma tecla em busca de sua verdadeira palavra.",
        "Mais rápido que um e-mail de spam, mais preciso que um corretor."
    ]
};


// --- FUNÇÕES DE LÓGICA DA CARTA ---
function determineRarity(finalData) {
    const { score, wpm, win } = finalData;
    if (win && score > 150 && wpm > 40) return 'L';
    if (score > 100 && wpm > 30) return 'R';
    if (score > 50 || wpm > 25) return 'I';
    return 'C';
}

function getNewCardId() {
    let currentId = parseInt(localStorage.getItem('lastCardId'), 10) || 0;
    currentId++;
    localStorage.setItem('lastCardId', currentId);
    return currentId;
}

/**
 * Função principal que constrói e compila a carta.
 * @param {object} finalData - Dados da partida (score, wpm, etc).
 * @param {object} characterData - Dados do personagem customizado.
 * @param {string} playerName - Nome digitado pelo jogador.
 * @param {object} options - Opções como { download: boolean }.
 * @returns {Promise<string|void>} Retorna a URL da imagem da carta se o download não for solicitado.
 */
async function generateCard(finalData, characterData, playerName, options = { download: false }) {
    const stage = document.getElementById('card-creation-stage');
    
    // 1. Determinar dados da carta
    const rarity = determineRarity(finalData);
    const cardId = getNewCardId();
    const topNumber = Math.floor(Math.random() * 10);
    const randomIcon = cardDataPools.icons[Math.floor(Math.random() * cardDataPools.icons.length)];
    const randomTitle = cardDataPools.titles[Math.floor(Math.random() * cardDataPools.titles.length)];
    const randomFlavor = cardDataPools.flavorTexts[Math.floor(Math.random() * cardDataPools.flavorTexts.length)];
    const randomBackground = cardDataPools.backgrounds[rarity][Math.floor(Math.random() * cardDataPools.backgrounds[rarity].length)];
    const cardFrameUrl = `img/card_frames/rarity_${rarity.toLowerCase()}.png`;

    // 2. Construir o HTML da carta no "palco" escondido
    stage.innerHTML = `
        <div id="card-builder-wrapper">
            <img id="card-bg-layer" src="${randomBackground}">
            <div id="card-char-layer" style="position: absolute; width: 100%; height: 100%; z-index: 2;">
                <img src="${characterData.hairSrc}" style="position: absolute; width: 100%; height: 100%; z-index: 4;">
                <img src="${characterData.earSrc}" style="position: absolute; width: 100%; height: 100%; z-index: 5;">
                <img src="${characterData.headSrc}" style="position: absolute; width: 100%; height: 100%; z-index: 3;">


                <img src="${characterData.noseSrc}" style="position: absolute; width: 100%; height: 100%; z-index: 6;">
                <img src="${characterData.mouthSrc}" style="position: absolute; width: 100%; height: 100%; z-index: 7;">
            </div>
            <img id="card-frame-layer" src="${cardFrameUrl}">
            <div class="card-content" style="position: absolute; z-index: 4; box-sizing: border-box; width: 100%; height: 100%;">
                <div id="card-top-number" style="position: absolute; top: 25px; left: 30px; font-size: 50px; font-weight: bold;">${topNumber}</div>
                <img id="card-top-icon" src="${randomIcon}" style="position: absolute; top: 120px; left: 30px; width: 40px; height: 40px;">
                <div id="card-name" style="position: absolute; top: 60px; left: 100px; font-size: 24px;">${playerName || "???"}</div>
                <div id="card-title-box" style="position: absolute; top: 400px; left: 30px; right: 30px;">
                    <h3 style="margin: 0; font-size: 20px;">${randomTitle}</h3>
                    <p style="margin: 5px 0 0; font-size: 14px; line-height: 1.4;">
                        ${randomFlavor}<br>---<br>
                        <i>${finalData.wpm} Palavras/Minuto, ${finalData.score} Pontos</i>
                    </p>
                </div>
                <div id="card-footer" style="position: absolute; bottom: 20px; left: 30px; right: 30px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span>${cardId} &nbsp;&nbsp; ${rarity} &nbsp;&nbsp; ACW • PT</span>
                    <span>Matthew F.</span>
                </div>
            </div>
        </div>
    `;

    // 3. Usar html2canvas para gerar a imagem
    try {
        const canvas = await html2canvas(document.getElementById('card-builder-wrapper'), {
            backgroundColor: null,
            useCORS: true 
        });
        
        const cardImageURL = canvas.toDataURL("image/png");

        if (options.download) {
            // Se a opção for download, cria o link e clica
            const link = document.createElement('a');
            link.download = `guerreiro-da-digitacao-carta-${cardId}.png`;
            link.href = cardImageURL;
            link.click();
        } else {
            // Senão, apenas retorna a URL da imagem gerada
            return cardImageURL;
        }

    } catch (error) {
        console.error("Erro ao gerar a carta:", error);
    } finally {
        stage.innerHTML = ''; // Limpa o palco
    }
}
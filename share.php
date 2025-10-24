<?php
    // --- 1. Coletar dados da URL (com segurança) ---
    $playerName = htmlspecialchars($_GET['playerName'] ?? '???');
    
    $frameSrc = htmlspecialchars($_GET['frameSrc'] ?? 'img/card_frames/rarity_c_0.png');
    $bgSrc = htmlspecialchars($_GET['bgSrc'] ?? 'img/card_backgrounds/bg1.png'); // Usa bg1 como padrão
    
    // --- 2. Reconstruir caminhos do personagem ---
    $head = htmlspecialchars($_GET['head'] ?? 'round');
    $hair = htmlspecialchars($_GET['hair'] ?? 'none');
    $ear = htmlspecialchars($_GET['ear'] ?? 'none');
    $nose = htmlspecialchars($_GET['nose'] ?? '1');
    $mouth = htmlspecialchars($_GET['mouth'] ?? '1');
    
    $emptyImg = 'img/customization/empty.png';
    
    $hairSrc = ($hair == 'none') ? $emptyImg : "img/customization/hair_{$hair}_{$head}.png";
    $earSrc = ($ear == 'none') ? $emptyImg : "img/customization/ear{$ear}_{$head}.png";
    $headSrc = "img/customization/head_{$head}.png";
    $noseSrc = "img/customization/nose{$nose}_{$head}.png";
    $mouthSrc = "img/customization/mouth{$mouth}_{$head}.png";

    // Detecta se é lendária (para esconder APENAS o personagem)
    $isLegendary = strpos($frameSrc, 'rarity_l') !== false;
    $charDisplay = $isLegendary ? 'display: none;' : '';
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sua Carta de Digitação</title>
    <link rel="stylesheet" href="style.css">
    
    <style>
        body {
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }
    </style>
</head>
<body class="share-page">

    <div id="card-display-wrapper">
        <img id="card-display-bg" src="<?php echo $bgSrc; ?>" alt="Fundo da Carta">
        
        <div id="card-display-character" style="<?php echo $charDisplay; ?>">
            <img id="char-display-hair" src="<?php echo $hairSrc; ?>">
            <img id="char-display-ear" src="<?php echo $earSrc; ?>">
            <img id="char-display-head" src="<?php echo $headSrc; ?>">
            <img id="char-display-nose" src="<?php echo $noseSrc; ?>">
            <img id="char-display-mouth" src="<?php echo $mouthSrc; ?>">
        </div>
        
        <img id="card-display-frame" src="<?php echo $frameSrc; ?>" alt="Moldura da Carta">

        <div class="card-content" style="position: absolute; z-index: 10; padding: 30px; box-sizing: border-box; width: 100%; height: 100%; font-family: 'Roboto Mono', monospace;">
        </div>
    </div>

    <button id="download-card-button">Baixar Carta (PNG)</button>

    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <script src="share.js" defer></script>

</body>
</html>
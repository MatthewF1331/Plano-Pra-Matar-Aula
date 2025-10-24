// share.js

document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.getElementById('download-card-button');
    const cardWrapper = document.getElementById('card-display-wrapper');

    downloadButton.addEventListener('click', async () => {
        downloadButton.textContent = 'Gerando PNG...';
        downloadButton.disabled = true;

        try {
            const canvas = await html2canvas(cardWrapper, {
                backgroundColor: null, // Mantém transparência
                useCORS: true,
                scale: 2 // Dobra a resolução
            });
            
            const cardImageURL = canvas.toDataURL("image/png");
            
            // Cria o link de download
            const link = document.createElement('a');
            link.download = `minha-carta-guerreiro-digitacao.png`;
            link.href = cardImageURL;
            link.click();

        } catch (error) {
            console.error("Erro ao gerar PNG da carta:", error);
            alert("Não foi possível gerar a imagem.");
        } finally {
            downloadButton.textContent = 'Baixar Carta (PNG)';
            downloadButton.disabled = false;
        }
    });
});
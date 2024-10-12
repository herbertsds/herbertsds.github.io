// Função para carregar o JSON de músicas
async function loadMusicas() {
    const response = await fetch('musicas.json');
    const musicas = await response.json();
    return musicas;
}

// Função para salvar o estado dos checkboxes no localStorage
function saveCheckboxState(musica, isChecked) {
    let checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    checkboxStates[musica] = isChecked;
    localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
}

// Função para carregar o estado dos checkboxes do localStorage
function loadCheckboxState(musica) {
    let checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    return checkboxStates[musica] || false;
}

// Função para sortear uma música aleatoriamente
function escolherMusicaAleatoria(musicas) {
    const musicasNaoVistas = musicas.filter(musica => !loadCheckboxState(musica.musica));
    if (musicasNaoVistas.length === 0) {
        alert('Todas as músicas já foram vistas!');
        return;
    }

    const indiceAleatorio = Math.floor(Math.random() * musicasNaoVistas.length);
    const musicaEscolhida = musicasNaoVistas[indiceAleatorio];

    // Armazena a música e o artista selecionados no localStorage
    localStorage.setItem('songLyrics', musicaEscolhida.letra);
    localStorage.setItem('songTitle', musicaEscolhida.musica);
    localStorage.setItem('songArtist', musicaEscolhida.artista);

    // Redireciona diretamente para song.html
    window.location.href = 'song.html';
}

// Função para exibir a lista de músicas com checkbox
function exibirListaMusicas(musicas) {
    const musicasList = document.getElementById('musicasList');
    musicasList.innerHTML = '';
    musicas.forEach(musica => {
        const divMusica = document.createElement('div');
        divMusica.classList.add('musica-item');
        
        // Cria um span para o nome da música e artista
        const musicaSpan = document.createElement('span');
        musicaSpan.textContent = `${musica.musica} - ${musica.artista}`;
        musicaSpan.classList.add('musica-text');
        musicaSpan.addEventListener('click', () => {
            // Armazena a letra, título e artista no localStorage
            localStorage.setItem('songLyrics', musica.letra);
            localStorage.setItem('songTitle', musica.musica);
            localStorage.setItem('songArtist', musica.artista);

            // Redireciona para song.html
            window.location.href = 'song.html';
        });
        
        // Cria um checkbox para marcar se a música foi vista
        const checkboxContainer = document.createElement('div');
        checkboxContainer.classList.add('musica-checkbox');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = loadCheckboxState(musica.musica);
        checkbox.addEventListener('change', () => {
            saveCheckboxState(musica.musica, checkbox.checked);
        });
        
        checkboxContainer.appendChild(checkbox);
        
        // Adiciona o texto da música e o checkbox à linha
        divMusica.appendChild(musicaSpan);
        divMusica.appendChild(checkboxContainer);

        musicasList.appendChild(divMusica);
    });
}

// Botões do menu principal
document.getElementById('pasteLyrics').addEventListener('click', function () {
    localStorage.removeItem('songTitle'); // Remover para evitar que exiba o título
    localStorage.removeItem('songArtist'); // Remover para evitar que exiba o artista
    document.getElementById('musicasContainer').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('texto').style.display = 'block';
    document.getElementById('startButton').style.display = 'block';
});

document.getElementById('viewMusicas').addEventListener('click', async function () {
    const musicas = await loadMusicas();
    exibirListaMusicas(musicas);
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('musicasContainer').style.display = 'flex';
});

// Botão de voltar ao menu principal
document.getElementById('voltarMenu').addEventListener('click', function () {
    document.getElementById('musicasContainer').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('texto').style.display = 'none';
    document.getElementById('startButton').style.display = 'none';
});

// Botão Start que inicia o processo de enviar a letra para outra página
document.getElementById('startButton').addEventListener('click', function () {
    const text = document.getElementById('texto').value;
    localStorage.setItem('songLyrics', text); // Armazena a letra no localStorage
    window.location.href = 'song.html'; // Redireciona para a página song.html
});

// Botão para escolher uma música aleatória
document.getElementById('randomMusicButton').addEventListener('click', async function () {
    const musicas = await loadMusicas();
    escolherMusicaAleatoria(musicas);
});

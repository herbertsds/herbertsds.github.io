

function atualizarComboboxAudio(imagemAtual) {
    var opcoes = audioMappings[imagemAtual];
    var combobox = document.getElementById('audioSelect');
    combobox.innerHTML = ""; // Limpar opções existentes
    opcoes.forEach(function (audio) {
        var opcao = document.createElement("option");
        opcao.value = audio;
        opcao.text = audio;
        combobox.appendChild(opcao);
    });
}

$(document).ready(function () {
    
    var audioPlayer = document.getElementById('audioPlayer');
    var audioSource = document.getElementById('audioSource');
    var audioSelect = document.getElementById('audioSelect');
    
    audioSource.src = "./audio/" + "Introduction" + ".mp3";
    audioPlayer.load();
    
    audioSelect.onchange = function () {
        audioSource.src = "./audio/" + this.value + ".mp3";
        audioPlayer.load();
    };
    
    $('#carouselExampleIndicators').on('slid.bs.carousel', function () {
        var currentIndex = $('.carousel-item.active').index();
        localStorage.setItem('carouselIndex', currentIndex);
    });
});
document.addEventListener("DOMContentLoaded", function () {

    var folder = "adjusted_merged_pages";
    var prefix = "adjusted_merged_page_";
    var count = 34;

    for (var i = 1; i <= count; i++) {
        var imgPath = folder + "/" + prefix + i + ".jpg";
        var itemDiv = document.createElement("div");
        itemDiv.className = "carousel-item" + (i === 1 ? " active" : "");

        var img = document.createElement("img");
        img.src = imgPath;
        img.className = "d-block";

        itemDiv.appendChild(img);
        document.querySelector(".carousel-inner").appendChild(itemDiv);
    }

    var startX, endX;
    var carousel = document.getElementById('carouselExampleIndicators');

    carousel.addEventListener('mousedown', function (e) {
        startX = e.clientX;
        e.preventDefault();
    });

    carousel.addEventListener('mouseup', function (e) {
        endX = e.clientX;

        if (startX > endX + 155) {
            $('.carousel').carousel('next');
        } else if (startX < endX - 155) {
            $('.carousel').carousel('prev');
        }

    });

    window.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') {
            $('.carousel').carousel('next');
        } else if (e.key === 'ArrowLeft') {
            $('.carousel').carousel('prev');
        }
    });

    $('#carouselExampleIndicators').on('slide.bs.carousel', function (e) {
        var proximaImagem = e.relatedTarget.getElementsByTagName('img')[0].src;
        var nomeArquivoComExtensao = proximaImagem.split('/').pop();
        var nomeArquivo = nomeArquivoComExtensao.split('.')[0];


        // Após atualizar o combobox, atualiza o áudio para a primeira track selecionável
        var firstTrack = audioMappings[nomeArquivo][0];
        audioSource.src = "./audio/" + firstTrack + ".mp3";
        audioPlayer.load();

        atualizarComboboxAudio(nomeArquivo);
    });

    var carouselIndex = localStorage.getItem('carouselIndex');
    if (carouselIndex) {
        $('#carouselExampleIndicators').carousel(parseInt(carouselIndex));
    }

});
document.getElementById('imgWidthSlider').addEventListener('input', function() {
    var width = this.value + '%';
    var images = document.querySelectorAll('.carousel-item img');
    images.forEach(function(img) {
        img.style.width = width;
    });
});
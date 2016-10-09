window.onload = function () {
    // resize container to 16:9
    var frame = document.getElementById('frame');
    frame.style.width = frame.clientHeight / 16 * 9 + 'px';

    // place background image
    var bg = document.createElement('div');
    bg.className = 'bg';
    var container = document.getElementById('container');
    container.appendChild(bg);

    var img = new Image();
    img.src = 'img/bg.png';
    img.onload = function() {
        bg.style.height = container.clientWidth / img.width * img.height + 'px';
    }

    var title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = 'Chip the Chinchilla';
    container.appendChild(title);
};

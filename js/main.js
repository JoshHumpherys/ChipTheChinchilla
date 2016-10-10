var NUM_HIGH_SCORES = 5;

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

    // var hsList = getHighScoreStrings();
    // if(Object.keys(hsList).length > 0) {
    //     var hs = document.createElement('div');
    //     hs.className = 'hs';
    //     hs.innerHTML = 'Best Climbs:<br /><br />'+hsList.join('<br />');
    //     container.appendChild(hs);
    // }
    var hsList = getHighScoreObjects();
    if(hsList.length > 0) {
        var hs = document.createElement('div');
        hs.className = 'hs';
        var hsHeading = document.createElement('div');
        hsHeading.innerHTML = 'Best Climbs:';
        hsHeading.style.position = 'relative';
        var createCol = function (id) {
            var col = document.createElement('div');
            col.id = id;
            col.innerHTML = '<br />';
            col.style.position = 'relative';
            return col;
        }
        var placeCol = createCol('placeCol');
        var nameCol = createCol('nameCol');
        var scoreCol = createCol('scoreCol');
        for(var i = 0; i < hsList.length; i++) {
            placeCol.innerHTML += i + 1 + ') <br />';
            nameCol.innerHTML += hsList[i].name + '<br />';
            scoreCol.innerHTML += hsList[i].value + 'm<br />';
        }
        var colContainer = document.createElement('div');
        colContainer.id = 'hsList';
        colContainer.style.position = 'relative';
        var createFiller = function () {
            var filler = document.createElement('div');
            filler.className = 'filler';
            filler.style.position = 'relative';
            return filler;
        }
        colContainer.appendChild(createFiller());
        colContainer.appendChild(placeCol);
        colContainer.appendChild(nameCol);
        colContainer.appendChild(scoreCol);
        colContainer.appendChild(createFiller());
        hs.appendChild(hsHeading);
        hs.appendChild(colContainer);
        container.appendChild(hs);

        document.getElementById('placeCol').style.minWidth = scoreCol.clientWidth + 'px';
    }
};

var requestName = function () {
    return prompt("Enter name:");
};

var setHighScore = function (name, value, index) {
    setCookie('hs' + index + 'Name', name);
    setCookie('hs' + index + 'Value', value);
};

var setPotentialHighScore = function (score) {
    var objects = getHighScoreObjects();
    for(var i = 0; i < NUM_HIGH_SCORES; i++) {
        if(i >= objects.length || score >= objects[i].value) {
            var name = requestName();
            for(var j = objects.length - (objects.length < NUM_HIGH_SCORES ? 0 : 1); j > i; j--) {
                setHighScore(objects[j - 1].name, objects[j - 1].value, j);
            }
            setHighScore(name, score, i);
            break;
        }
    }
};

var getHighScoreStrings = function () {
    var objects = getHighScoreObjects();
    for(var i = 0; i < objects.length; i++) {
        objects[i] = i + 1 + ') ' + objects[i].name + ' ' + objects[i].value + 'm';
    }
    return objects;
};

var getHighScoreObjects = function () {
    var hs = [];
    for(var i = 0; i < NUM_HIGH_SCORES; i++) {
        var name = getCookie('hs' + i + 'Name');
        if(name === '') {
            break;
        }
        var value = getCookie('hs' + i + 'Value');
        hs[i] = {
            name: name,
            value: value
        };
    }
    return hs;
};

var setCookie = function(name, value) {
    var expDate = new Date();
    expDate.setYear(expDate.getFullYear() + 10);
    document.cookie = name+'='+value+'; expires='+expDate.toUTCString();
};

var getCookie = function(name) {
    name += '=';
    array = document.cookie.split(';');
    for(var i = 0; i < array.length; i++) {
        var current = array[i];
        while(current.charAt(0) == ' ') {
            current = current.substring(1);
        }
        if(current.indexOf(name) == 0) {
            return current.substring(name.length, current.length);
        }
    }
    return '';
};

var eraseCookie = function(name) {
    document.cookie = name+'=;expires=Thu, 01 Jan 1970 00:00:00 UTC';
}

var eraseAllCookies = function() {
    array = document.cookie.split(';');
    for(var i = 0; i < array.length; i++) {
        eraseCookie(array[i].substring(0, array[i].indexOf('=')));
    }
}

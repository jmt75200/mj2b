
    function doKeyDown(e) {
      // asdf = 97 115 100 102
      // jkl; = 106 107 108 59
      // space = 32

      //alert( e.keyCode )

      keycounts[e.keyCode] = keycounts[e.keyCode] ? keycounts[e.keyCode]+1 : 1;

    }

    function updateCounts() {
      for(i=97; i < 97+26; i++) {
        // console.log(String.fromCharCode(i));
        foo = document.getElementById('count-'+String.fromCharCode(i));
        if (foo) {
          var val;

          val = keycount_history[i].reduce(function(p,c) {
            return p + c;
          }, 0)

          foo.innerHTML = val; // keycounts[i].toString();
        }
      }
    }

    function makeScale(id) {
      return '<input id="' + id + '" type="range" min="0" max="10" value="1"/>';
    }

    function initArray(size) {
      return Array.apply(null, Array(size)).map(Number.prototype.valueOf,0);
    }

    window.addEventListener( "keypress", doKeyDown, false )

    keycounts = initArray(256);

    keycount_history = new Array();
    for(i=0; i < 256; i++) {
      keycount_history[i] = initArray(100);
    }

    function tickUpdate() {
      for(i=0; i < 256; i++) {
        keycount_history[i].push(keycounts[i]);
        keycount_history[i].shift();
        keycounts[i] = 0;
      }

      updateCounts();
    }

    window.setInterval(function() {
      tickUpdate();
      // updateCounts();
    }, 10);


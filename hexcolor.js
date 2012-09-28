var fly = {};
fly.color = {};

fly.color.limit = function (col) {
    // limit col between 0 and 255
    // color is any int
    return col = Math.min(Math.max(col, 0),255);
}

fly.color.split = function (hexCol) {
    // split a hex color to work with rgb
    //assumes hex color w/ leading #
    var col = hexCol.slice(1);
    
    var col = parseInt(col,16);
    var r = (col >> 16);
    var g = ((col >> 8) & 0x00FF);
    var b = (col & 0x0000FF);
    return([r,g,b]);
}

fly.color.splice = function (cola) {
    // cola is a color array [r,g,b], are all int
    var r = cola[0],
        g = cola[1],
        b = cola[2];
    var splice = ((r << 16) | (g << 8) | b ).toString(16);
    // if r < 10, pad with a zero in front
    while (splice.length < 6) {
        splice = "0" + splice
    }
    splice = "#" + splice;
    return splice;    
}

fly.color.value = function (col,amt) {
    // darkens or lightens r,g,b by amount  
    // takes a hex color string and amount (-256 to 256)
    var cola = fly.color.split(col);
    for (var i=0; i < cola.length; i++) {
        cola[i] += amt;
        cola[i] = fly.color.limit(cola[i]);
    };
    return fly.color.splice(cola);
}

fly.color.mix = function (col1,col2,amt) {
    // mixes 2 hex colors together, amt (0 to 1) determines ratio
    // amt = 0 returns col1, amt = 1 returns col2
    // amt defaults to .5
    
    var amt = amt !== undefined ? amt : 0.5; 
    var col1a = fly.color.split(col1),
        col2a = fly.color.split(col2);
    for (var i=0; i < col1a.length; i++) {
        col1a[i] = (col1a[i]*(1-amt)) + (col2a[i]*(amt));
    };
    return fly.color.splice(col1a);
}

fly.color.spectrum = function (col1,col2,seg) {
    // takes two colors, returns array of seg sements
    // sent colors are first and last of the array
	var seg = seg !== undefined ? seg : 5;
    if (seg < 3) {
        return [col1,col2];
    };
    var spec = [col1];
    for (var i=1; i < seg-1; i++) {
        spec.push(fly.color.mix(col1,col2,i/(seg-1)))
    };
    spec.push(col2);
    return spec;
}

fly.color.flyspec = function (col1,col2,col3) {
	// takes three hex colors and creates a 9 segment spectrum
	// made for bringing saturated colors to light and dark
	// standard use: (lightest, saturated, darkest)
	// sent colors are first, middle, and last of the array
	
	var lights = fly.color.spectrum(col1,col2),
		darks = fly.color.spectrum(col2,col3);
		// remove duplicate color in middle and merge
		lights.pop();
		spec = lights.concat(darks);	
}

var spectest = fly.color.flyspec('#000000','#00FF00','#FFFFFF');
for (var i=0; i < spectest.length; i++) {
	document.write(spectest[i] + '</br>');
};

var testTable = [
'#000000',
'#000002',
'#000020',
'#000200',
'#002000',
'#020000',
'#020408',
'#080808',
'#888888',
'#000000',
'#FFFFFF'
];

var valTable = [-255,10,-1,0,1,10,255];


// for (var i=0; i < testTable.length; i++) {
//     for (var j=0; j < valTable.length; j++) {
//         var col1 = testTable[i],
//             col2 = testTable[i+1];
//         var val = fly.color.mix(col1,col2,.5);
//         document.write(testTable[i] + " + " + testTable[i+1] + " = " + val + "</br>");
//     };
// };


​
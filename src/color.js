/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/*
 * ## Color
 * color maintains an palette of colors
 * defined by the colorPalette. It is reinitialized
 * and repopulated every time the colorPalette is reset.
 * When a color is defined in a palette (ex. 'blue'),
 * its colors are accesible as an array via color.
 * ex:
 * fly.color.blue[5]
 *
 * Initial color object is only used to test for
 * a palette of "not yet defined", after init by
 * the colorPalette, color is granted info.
*/

fly.color = {
    name: "color",
    palette : "not yet defined"
};


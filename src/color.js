/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/**
 *
 * The [Color Palette]{@link colorPalette} initializes fly.color
 * during {@link fly.init}
 * After initialization by the [color Palette]{@link fly.colorPalette},
 * color is [granted info]{@link Grant Info}.
 *
 * @example
 * fly.color.blue[4]
 * // returns # '#0000FF' with the default palette
 *
 * @class
 * @classDesc
 * Color maintains a palette of colors defined by the
 * [Color Palette]{@link fly.colorPalette}.
 * It is reinitialized and repopulated every time the
 * [Color Palette]{@link fly.colorPalette} is reset.
 * When a color is defined in a palette (ex. 'blue'),
 * its colors are accessible as an array via fly.color.
 *
*/

fly.color = {

    name: "color",
    _paletteName: "not yet defined"

};


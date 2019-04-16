const fs = require('fs')
const zeros = require('zeros');
const savePixels = require('save-pixels')
const getPixels = require('get-pixels')
const adaptiveThreshold = require('adaptive-threshold')

var contours = [];
var visited;

var currentContourNumber = -1;
function searchAdjacent(pixels, i, j) {

    if (visited.get(i, j) != 0 || pixels.get(i, j) == 0)
        return;


    if (pixels.get(i, j) == 255) {
        contours[currentContourNumber].push([i, j]);

        visited.set(i, j, 1);
        searchAdjacent(pixels, i, j + 1);
        searchAdjacent(pixels, i, j - 1);
        searchAdjacent(pixels, i - 1, j);
        searchAdjacent(pixels, i + 1, j);
    }

    visited.set(i, j, 1);

}

function checkOpenness(pixels, x, y) {

    if (pixels.get(x, y) == 255) return false;

    var i, j;

    for (i = x; i >= 0; i--) {
        if (pixels.get(i, y) == 255)
            break;
    }

    if (i == -1) return false;

    for (i = x; i < pixels.shape[0]; i++) {
        if (pixels.get(i, y) == 255)
            break;
    }

    if (i == pixels.shape[0]) return false;

    for (j = y; j >= 0; j--) {
        if (pixels.get(x, j) == 255)
            break;
    }

    if (j == -1) return false;

    for (j = y; j < pixels.shape[1]; j++) {
        if (pixels.get(x, j) == 255)
            break;
    }

    if (j == pixels.shape[1]) return false;

    return true;
}

var filename = 'a.jpg';

getPixels('./inputs/' + filename, (err, pixels) => {
    if (err) {
        console.error(err)
        return
    }
    let thresholded = adaptiveThreshold(pixels, { size: 100, compensation: 5 })

    savePixels(thresholded, 'png').pipe(fs.createWriteStream('./output/' + filename.split('.')[0] + '.threshold.png'))


    var rows = thresholded.shape[0];
    var cols = thresholded.shape[1];

    visited = zeros(thresholded.shape);

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {

            if (visited.get(i, j) == 0 && thresholded.get(i, j) == 255) {

                currentContourNumber++;
                contours[currentContourNumber] = contours[currentContourNumber] || [];
                contours[currentContourNumber].push([i, j]);

                visited.set(i, j, 1);

                searchAdjacent(thresholded, i, j + 1);
                searchAdjacent(thresholded, i, j - 1);
                searchAdjacent(thresholded, i - 1, j);
                searchAdjacent(thresholded, i + 1, j);
            }

            visited.set(i, j, 1);

        }
    }

    var max = 0;

    for (var key in contours) {
        if (contours[key].length > contours[max].length) {
            max = key;
        }
    }

    var newImage = zeros(thresholded.shape);

    for (var key in contours[max]) {
        newImage.set(contours[max][key][0], contours[max][key][1], 255);
    }

    savePixels(newImage, 'png').pipe(fs.createWriteStream('./output/' + filename.split('.')[0] + '.largest.png'));

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (checkOpenness(newImage, i, j)) {
                newImage.set(i, j, 255);
            }
        }
    }

    savePixels(newImage, 'png').pipe(fs.createWriteStream('./output/' + filename.split('.')[0] + '.mask.png'))

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if(newImage.get(i,j)!=255){
                pixels.set(i,j,0,255);
                pixels.set(i,j,1,255);
                pixels.set(i,j,2,255);
                pixels.set(i,j,3,255);
            }
        }
    }

    console.log(pixels.shape,thresholded.shape);

    savePixels(pixels, 'png').pipe(fs.createWriteStream('./output/' + filename.split('.')[0] + '.segment.png'))
})
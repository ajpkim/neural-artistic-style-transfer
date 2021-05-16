const model = new mi.ArbitraryStyleTransferNetwork();
const contentImg = document.getElementById('content');
const styleImg = document.getElementById('style');
const styleImg2 = document.getElementById('style2');
const styleImg3 = document.getElementById('style3');
const stylizedCanvas = document.getElementById('stylized');


// async function getStyleParameters(images) {
//     if (model.initialized === false) { await model.initialize() }
//     let styles = images.map(image => model.predictStyleParameters(image));
//     return styles
// }

// function getStyleParameters(images) {
// 	  return images.map(image => model.predictStyleParameters(image));
// }

// function combineStyles(styles, styleWeights) {
//     // Normalize the weights and then combine the style representations into a weighted average
//     let weightSum = styleWeights.reduce((a, b) => { return a + b; });	  
//     styleWeights = styleWeights.map(weight => weight  / weightSum );

//     weightedStyles = styles.map(
//     Need to only work with the predicted ones for some reason
//     let styleRep = tf.zeros([1,1,1,100]);
//     for (let [style, weight] of styles.map((a,b) => [a, styleWeights[b]])) {
// 	styleRep = styleRep.add(style.mul(weight));
//     })
//     return styleRep
// }

// async function getStyle(images, styleWeights) {
//     let styles = await getStyleParameters(images);
//     // Recreate the style tensors to fix the issues with operating on the tensors received from network...
//     styles = styles.map(style => tf.tensor(style.dataSync()).reshape([1,1,1,100]));
//     let style = combineStyles(styles, styleWeights)
//     return style
// }

// async function stylize(contentImg, style) {
//     console.log('starting');
    
//     // Something wrong here...
//     let stylized = model.produceStylized(contentImg, style);
//     console.log('here')
//     return tf.browser.toPixels(stylized)
// 	.then((bytes) => new ImageData(bytes, stylized.shape[1], stylized.shape[0]))
// }



//////////////////////////////////////////////////
// Test data
model.initialize();
let styleWeights = [3,2,1];
let styleImages = [styleImg, styleImg2, styleImg3];

function drawImage(imageData) {
    console.log('drawImage');
    stylizedCanvas.getContext('2d').putImageData(imageData, 0, 0);
}

function getStyle(styleImages, styleWeights) {
    console.log('getStyle');
    let styles = styleImages.map(image => model.predictStyleParameters(image));
    let weightSum = styleWeights.reduce((a, b) => { return a + b; });	  
    styleWeights = styleWeights.map(weight => weight  / weightSum );
    let weightedStyles = styles.map((style, i) => style.mul(styleWeights[i]));
    let style = weightedStyles.reduce((a,b) => a.add(b));
    return style
}

function getStyledImageData(contentImg, style) {
    console.log('getStyledImageData')
    let stylized = model.produceStylized(contentImg, style);
    return tf.browser.toPixels(stylized)  // // tf.browser.toPixels returns a Promise
	.then((bytes) => new ImageData(bytes, stylized.shape[1], stylized.shape[0]));
}

function stylize(contentImg, styleImages, styleWeight) {
    let style = getStyle(styleImages, styleWeights);
    getStyledImageData(contentImg, style)
	.then(drawImage)
}

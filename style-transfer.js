const model = new mi.ArbitraryStyleTransferNetwork();

let contentImg = document.getElementById('content');
let styleImg = document.getElementById('style');
let styleImg2 = document.getElementById('style2');
let styleImg3 = document.getElementById('style3');

const stylizedCanvas = document.getElementById('stylized');
const addStyleImageBtn = document.getElementById('add-style-image-btn');
const selectStyleList = document.getElementById('style-select');
const selectContentList = document.getElementById('content-select');
const styleTransferBtn = document.getElementById('style-transfer-btn');

let contentFileUploader = document.getElementById('content-file-upload');
let styleFileUploader = document.getElementById('style-file-upload');
let fileUploader = document.getElementById('file-upload');

//////////////////////////////////////////////////////////////////////
// Document Management

addStyleImageBtn.addEventListener('click', () => {
    console.log('yooo');
});

addStyleImageBtn.addEventListener('click', () => {

});


styleTransferBtn.addEventListener('click', () => {
    stylize(contentImg, styleImages, styleWeights);
});

//////////////////////////////////////////////////
// Handling with separate chains of logic for style/content
// contentFileUploader.addEventListener('change', () => {
//     contentImg.src = URL.createObjectURL(contentFileUploader.files[0]);
// });

// styleFileUploader.addEventListener('change', () => {
//     processImageUpload(styleFileUploader.files[0])
// });


// selectContentList.addEventListener('change', () => {
//     let choice = selectContentList.value;
//     if (choice === 'file-upload') {
// 	contentFileUploader.click();  // Selection triggers image processing chain 
//     } else {
	
// 	contentImg.src = 'images/' + choice + '.jpg';
//     }
// });

// selectStyleList.addEventListener('change', () => {
//     let choice = selectStyleList.value;
//     if (choice === 'file-upload') {
// 	styleFileUploader.click();  // Selection triggers image processing chain 
//     } else {
// 	styleImg.src = 'images/' + choice + '.jpg';
//     }
// });

//////////////////////////////////////////////////
// Handling with single pipeline and style/content flag

// @type is 'content' or 'style'
selectStyleList.addEventListener('change', () => {
    uploadImage(selectStyleList, 'style');
});

selectContentList.addEventListener('change', () => {
    uploadImage(selectContentList, 'content');
});

function uploadImage(listSelect, type) {
    let choice = listSelect.value;
    fileUploader.recent = type;
    if (choice === 'file-upload') {
	fileUploader.click();  // Selection triggers image processing chain 
    } else if (type === 'content') {
	contentImg.src = 'images/' + choice + '.jpg';
    } else {
	styleImg.src = 'images/' + choice + '.jpg';
    }
}

fileUploader.addEventListener('change', () => {
      if (fileUploader.recent === 'content') {
	contentImg.src = URL.createObjectURL(fileUploader.files[0]);
    } else {
	processImageUpload(fileUploader.files[0])
    }
});

function processImageUpload(filepath) {
    let img = new Image();
    img.onload = () => drawImage(img);
    img.src = URL.createObjectURL(filepath);
}

//////////////////////////////////////////////////////////////////////
// Test data

let styleWeights = [3,2,1];
let styleImages = [styleImg, styleImg2, styleImg3];

//////////////////////////////////////////////////////////////////////
// Style Transfer Functions 
function drawImage(image) {
    if (Object.prototype.toString.call(image) === '[object ImageData]') {
	stylizedCanvas.getContext('2d').putImageData(image, 0, 0);
    } else if (Object.prototype.toString.call(image) === '[object HTMLImageElement]') {
	stylizedCanvas.getContext('2d').drawImage(image, 0, 0);
    }
}

function getStyle(styleImages, styleWeights) {
    let styles = styleImages.map(image => model.predictStyleParameters(image));
    let weightSum = styleWeights.reduce((a, b) => { return a + b; });	  
    styleWeights = styleWeights.map(weight => weight  / weightSum );
    let weightedStyles = styles.map((style, i) => style.mul(styleWeights[i]));
    let style = weightedStyles.reduce((a,b) => a.add(b));
    return style
}

function getStyledImageData(contentImg, style) {
    let stylized = model.produceStylized(contentImg, style);
    return tf.browser.toPixels(stylized)
	.then((bytes) => new ImageData(bytes, stylized.shape[1], stylized.shape[0]));
}

async function stylize(contentImg, styleImages, styleWeight) {
    if (model.initialized === false) await model.initialize();
    let style = getStyle(styleImages, styleWeights);
    getStyledImageData(contentImg, style)
	.then(drawImage)
}

const model = new mi.ArbitraryStyleTransferNetwork();

let contentImage = document.getElementById('content-image');
let styleImage = document.getElementsByClassName('style-image')[0];

const stylizedCanvas = document.getElementById('stylized');
const addStyleImageBtn = document.getElementById('add-style-image-btn');
const styleTransferBtn = document.getElementById('style-transfer-btn');

const fileUploader = document.getElementById('file-upload');
const styleImageDiv = document.getElementById('style-images');
const styleImageBlock = document.getElementById('style-image-block-1');
const selectStyleList = document.getElementsByClassName('style-select')[0];
const selectContentList = document.getElementById('content-select');

let styleImageCount = 1

//////////////////////////////////////////////////////////////////////
// Document Management


selectStyleList.addEventListener('change', () => {
	uploadImage(selectStyleList, 'style');
    });

addStyleImageBtn.addEventListener('click', () => {
    addNewStyleBlock();
});

styleTransferBtn.addEventListener('click', () => {
    stylize();
});


selectContentList.addEventListener('change', () => {
    uploadImage(selectContentList, 'content');
});

function getStyleImages() {
    return Array.from(document.getElementsByClassName('style-image'));
}

function getStyleWeights() {
    let styleWeights = document.getElementsByClassName('style-slider');
    return Array.from(styleWeights).map(slider => Number(slider.value));
}

function getContentStyleRatio(styleWeights) {
    let total = styleWeights.length * 10;
    return 1 - (styleWeights.reduce((a, b) => a + b) / total)
}

function addNewStyleBlock() {
    let block = styleImageBlock.cloneNode(true);
    styleImageCount += 1;
    block.id = `style-image-block-${styleImageCount}`;
    let img = block.querySelector('.style-image');
    img.id = `style-image-${styleImageCount}`;
    let styleSelectionList = block.querySelector('.style-select');    
    styleSelectionList.addEventListener('change', () => {
	uploadImage(styleSelectionList, 'style', img);
    });
    let removeBtn = block.querySelector('.remove-style-btn');
    removeBtn.id = `remove-style-btn-${styleImageCount}`;
    removeBtn.addEventListener('click', () => block.remove());
    styleImageDiv.appendChild(block);
}

function uploadImage(selectionList, styleOrContent, styleImg=styleImage) {
    let choice = selectionList.value;
    fileUploader.styleOrContent = styleOrContent;
    if (choice === 'file-upload') {
	fileUploader.click();  // Selection triggers image processing chain
    } else if (styleOrContent === 'content') {
	contentImage.src = 'images/' + choice + '.jpg';
    } else {
	styleImg.src = 'images/' + choice + '.jpg';
    }
}

fileUploader.addEventListener('change', () => {
    if (fileUploader.styleOrContent === 'content') {
	contentImage.src = URL.createObjectURL(fileUploader.files[0]);
    } else {
	styleImage.src = URL.createObjectURL(fileUploader.files[0]);
    }
});

//////////////////////////////////////////////////////////////////////
// Style Transfer Functions
function drawImage(image) {
    if (Object.prototype.toString.call(image) === '[object ImageData]') {
	stylizedCanvas.getContext('2d').putImageData(image, 0, 0);
    } else if (Object.prototype.toString.call(image) === '[object HTMLImageElement]') {
	stylizedCanvas.getContext('2d').drawImage(image, 0, 0);
    }
}

function getStyle(styleImages, styleWeights, contentStyleRatio) {
    let styles = styleImages.map(image => model.predictStyleParameters(image));
    let weightSum = styleWeights.reduce((a, b) => { return a + b; });
    styleWeights = styleWeights.map(weight => weight  / weightSum );
    let weightedStyles = styles.map((style, i) => style.mul(styleWeights[i]));
    let style = weightedStyles.reduce((a,b) => a.add(b));
    
    // Blend the style/content based on stylization strength prescribed by styleWeights
    let contentStyle = model.predictStyleParameters(contentImage).mul(contentStyleRatio);
    style = style.mul(1 - contentStyleRatio).add(contentStyle);

    return style
}

function getStyledImageData(contentImage, style) {
    let stylized = model.produceStylized(contentImage, style);
    return tf.browser.toPixels(stylized)
	.then((bytes) => new ImageData(bytes, stylized.shape[1], stylized.shape[0]));
}

async function stylize() {
    if (model.initialized === false) await model.initialize();
    console.log('Styling...');
    let styleImages = getStyleImages();
    let styleWeights = getStyleWeights();
    let contentStyleRatio = getContentStyleRatio(styleWeights);
    let style = getStyle(styleImages, styleWeights, contentStyleRatio);
    getStyledImageData(contentImage, style)
	.then(drawImage)
    // model.dispose();  // Clean up model children tensors
}

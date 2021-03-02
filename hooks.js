const replaceImage = (domImage, transformFn) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    let ctx = canvas.getContext("2d");
    domImage.crossOrigin = "anonymous";  // This enables CORS
    let isLoaded = false;
		domImage.addEventListener('load', function() {
			if (!isLoaded) {
				const displayedWidth = domImage.getBoundingClientRect().width;
				const displayedHeight = domImage.getBoundingClientRect().height;
				
				canvas.width = displayedWidth;
				canvas.height = displayedHeight;

				if (typeof transformFn === 'function') {
					ctx = transformFn(ctx, domImage, displayedWidth, displayedHeight);
				} else {
					ctx.drawImage(domImage, 0, 0, displayedWidth, displayedHeight);
				}
				domImage.src = canvas.toDataURL();
				resolve(domImage);
				isLoaded = true;
			}
			
    })
    
    domImage.addEventListener('error', reject);
  })
}
const parseImages = (transformFn) => {
	const images = document.querySelectorAll('img');

  Promise.all(
		[...images].map(
			img => replaceImage(img, transformFn)
		)
	)
	.then(() => {
		console.log('toutes les images ont été transformées')
	})
}

const blackAndWhite = (ctx, image, displayedWidth, displayedHeight) => {
  ctx.drawImage(image, 0, 0, displayedWidth, displayedHeight);
  ctx.globalCompositeOperation='color';
  ctx.fillStyle = "white";
  ctx.globalAlpha = 1;  // alpha 0 = no effect 1 = full effect
  ctx.fillRect(0, 0, displayedWidth, displayedHeight);
  return ctx;
}
const applyBlendMode = mode => (ctx, image, displayedWidth, displayedHeight) => {
	const prev = image.parentNode;
	const background = window.getComputedStyle(prev, null).getPropertyValue('background-color');
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(image, 0, 0, displayedWidth, displayedHeight);
	ctx.globalCompositeOperation = mode;
	ctx.fillStyle = background;
	ctx.fillRect(0, 0, displayedWidth, displayedHeight);
	ctx.globalCompositeOperation = 'overlay';
	ctx.drawImage(image, 0, 0, displayedWidth, displayedHeight);

  return ctx;
}
class MyHandler extends Paged.Handler {
		constructor(chunker, polisher, caller) {
			super(chunker, polisher, caller);
		}

		afterRendered(_pages) {
			parseImages(applyBlendMode('multiply'));
			// parseImages(blackAndWhite);
		}
	}
	Paged.registerHandlers(MyHandler);
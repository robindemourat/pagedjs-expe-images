
const replaceImage = (domImage, screenCanvas, transformFn) => {
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
					ctx = transformFn(ctx, screenCanvas, domImage, displayedWidth, displayedHeight);
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
const parseImages = (selector = 'img', transformFn) => {
	const images = document.querySelectorAll(selector);
	// console.log('images', selector, images)
	return new Promise((resolve, reject) => {
		html2canvas(document.body).then(function(canvas) {
			Promise.all(
				[...images].map(
					img => replaceImage(img, canvas, transformFn)
				)
			)
			.then(() => {
				console.log(`toutes les images ${selector} ont été transformées`)
				resolve();
			})
			.catch(reject)
		})
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
const applyBlendMode = mode => (ctx, screenCanvas, image, displayedWidth, displayedHeight) => {
	const prev = image.parentNode;
	const background = window.getComputedStyle(prev, null).getPropertyValue('background-color');
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(image, 0, 0, displayedWidth, displayedHeight);
	ctx.fillStyle = background;
	ctx.globalCompositeOperation = mode;
	ctx.fillRect(0, 0, displayedWidth, displayedHeight);
	ctx.globalCompositeOperation = 'overlay';
	ctx.drawImage(image, 0, 0, displayedWidth, displayedHeight);
  
	// const imagePosition = image.getBoundingClientRect();
	// ctx.globalCompositeOperation = 'source-over';
	// // ctx.drawImage(image, 0, 0, displayedWidth, displayedHeight);
	// ctx.drawImage(screenCanvas, imagePosition.x, imagePosition.y, displayedWidth, displayedHeight);
	// ctx.globalCompositeOperation = mode;	
	// ctx.drawImage(screenCanvas, imagePosition.x, imagePosition.y, displayedWidth, displayedHeight);
	// ctx.globalAlpha = .5;
	// // ctx.globalCompositeOperation = "overlay";
	// ctx.drawImage(image, 0, 0, displayedWidth, displayedHeight);
	
	return ctx;
}
class MyHandler extends Paged.Handler {
		constructor(chunker, polisher, caller) {
			super(chunker, polisher, caller);
			this.blendInstructions = new Map();
		}

		afterRendered(_pages) {
			Array.from(this.blendInstructions).reduce((cur, [selector, mode]) => {
				return cur.then(() => parseImages(selector, applyBlendMode(mode)))
			}, Promise.resolve())
			// parseImages(applyBlendMode('multiply'));
		}
		onDeclaration(declaration, dItem, dList, rule) {
			if (declaration.property === "mix-blend-mode") {
					let selector = csstree.generate(rule.ruleNode.prelude);
					const val = declaration.value.children.first().name;
					if (val !== 'normal') {
						dList.remove(dItem);
						this.blendInstructions.set(selector, val);
					}
			}
		}
	}
	Paged.registerHandlers(MyHandler);
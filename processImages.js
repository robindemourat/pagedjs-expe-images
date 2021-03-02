const replaceImage = (domImage, resolution = 300) => {
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

				ctx.drawImage(domImage, 0, 0, displayedWidth, displayedHeight);
				domImage.src = canvas.toDataURL();
				resolve(domImage);
				isLoaded = true;
			}
			
    })
    
    domImage.addEventListener('error', reject);
  })
}
const parseImages = (resolution) => {
	const images = document.querySelectorAll('img');

  Promise.all(
		[...images].map(
			img => replaceImage(img, resolution)
		)
	)
	.then(() => {
		console.log('toutes les images ont été transformées')
	})
}
class MyHandler extends Paged.Handler {
		constructor(chunker, polisher, caller) {
			super(chunker, polisher, caller);
		}

		afterRendered(_pages) {
			parseImages(300);
		}
	}
	Paged.registerHandlers(MyHandler);

  window.Paged.config = {
    imagesResolution: 300
  }
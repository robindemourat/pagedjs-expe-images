

const replaceImage = (domImage, transformFn) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    let ctx = canvas.getContext("2d");
    domImage.crossOrigin = "anonymous";  // This enables CORS
    domImage.addEventListener('load', function() {
      const width = this.width;
      const height = this.height;
      canvas.width = width;
      canvas.height = height;

      if (typeof transformFn === 'function') {
        ctx = transformFn(ctx, domImage, width, height);
      } else {
        ctx.drawImage(domImage, 0, 0, width, height, width, height);
      }
      domImage.src = canvas.toDataURL();
      resolve(domImage);
    })
    
    domImage.addEventListener('error', reject);
  })
}
const parseImages = (transformFn) => {
  Promise.all([...document.querySelectorAll('img')].map(img => replaceImage(img, transformFn)))
}

const blackAndWhite = (ctx, image, width, height) => {
  ctx.drawImage(image, 0, 0, width, height, 0, 0, width, height);
  ctx.globalCompositeOperation='color';
  ctx.fillStyle = "white";
  ctx.globalAlpha = 1;  // alpha 0 = no effect 1 = full effect
  ctx.fillRect(0, 0, width, height);
  return ctx;
}

parseImages(blackAndWhite);
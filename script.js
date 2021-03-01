

const replaceImage = (domImage, transformFn) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    domImage.addEventListener('load', function() {
      const width = this.width;
      const height = this.height;
      ctx.drawImage(domImage, 0, 0, width, height, width, height);
      if (typeof transformFn === 'function') {
        transformImge(ctx, domImage, width, height);
      }
      domImage.src = canvas.toDataURL();
      resolve(domImage);
    })
    domImage.addEventListener('error', reject);
  })
}
const parseImages = (transformFn) => {
  Promise.all([...document.querySelectorAll('img')], img => replaceImage(img, transformFn))
}

parseImages();
export class Drawing {
  public promise: Promise<ImageData>;
  constructor(promise: Promise<ImageData>) {
    this.promise = promise;
  }

  public get imageData() {
    return this.promise.then(imageData => imageData);
  }

  public pixelate(size: number) {
    return new Drawing(this.promise.then(imageData => pixelateImage(imageData, size)));
  }

  public mirror() {
    return new Drawing(this.promise.then(imageData => mirrorImage(imageData)));
  }

  public join(joinDrawing: Drawing) {
    const promise = Promise.all([this.promise, joinDrawing.promise]).then(x => {
      return joinImage(x[0], x[1]);
    });
    return new Drawing(promise);
  }

  public toRed() {
    return new Drawing(this.promise.then(imageData => toRed(imageData)));
  }

  public area(x: number, y: number, width: number, height: number) {
    return new Drawing(this.promise.then(imageData => areaImage(imageData, x, y, width, height)));
  }

  public fade() {
    return new Drawing(this.promise.then(imageData => fadeImage(imageData)));
  }

  public boxBlur(radius: number) {
    return new Drawing(this.promise.then(imageData => boxBlurImage(imageData, radius)));
  }

  public gaussianBlur(radius: number) {
    return new Drawing(this.promise.then(imageData => gaussianBlurImage(imageData, radius)));
  }

  public generic(fns: Array<(sourceData: ImageData, destData: ImageData, index: number) => void>) {
    return new Drawing(this.promise.then(imageData => generic(imageData, fns)));
  }

  public grayscale() {
    return new Drawing(this.promise.then(imageData => grayscaleImage(imageData)));
  }

  public drawToCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
    this.promise.then(imageData => drawToCanvas(canvasRef, imageData));
  }
}

export function drawToCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, imageData: ImageData) {
  const canvas = canvasRef.current;
  if (canvas) {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    return true;
  }
  return false;
}

export function getImageData(imageSrc: string) {
  const promise = new Promise<ImageData>((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const self = this as HTMLImageElement;
      const canvas = document.createElement('canvas') as any;
      const context = canvas.getContext('2d');
      canvas.width = self.naturalWidth;
      canvas.height = self.naturalHeight;
      context.drawImage(img, 0, 0);
      const imgData = context.getImageData(0, 0, self.naturalWidth, self.naturalHeight) as ImageData;
      resolve(imgData);
    }
    img.src = imageSrc;
  });
  return new Drawing(promise);
}

export function toRed(sourceData: ImageData) {
  const destData = new ImageData(sourceData.width, sourceData.height);
  for (let i = 0; i < sourceData.data.length; i += 4) {
    toRedFn(sourceData, destData, i);
  }
  return destData;
}

export const toRedFn = (sourceData: ImageData, destData: ImageData, index: number) => {
  destData.data[index] = sourceData.data[index];
  destData.data[index + 1] = 0;
  destData.data[index + 2] = 0;
  destData.data[index + 3] = sourceData.data[index + 3];
};

export function joinImage(sourceData1: ImageData, sourceData2: ImageData) {
  const sData1 = sourceData1.data;
  const w1 = sourceData1.width;
  const h1 = sourceData1.height;
  const sData2 = sourceData2.data;
  const w2 = sourceData2.width;
  const h2 = sourceData2.height;
  const destData = new ImageData(w1, h1 + h2);
  const dData = destData.data;
  const total = [0, 0, 0, 0];
  for (let y = 0; y < h1; y++) {
    for (let x = 0; x < w1; x++) {
      const o = 4 * (y * w1 + x);
      total.forEach((t, i) => dData[o + i] = sData1[o + i]);
    }
  }

  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      const o1 = 4 * (y * w2 + x);
      const o2 = o1 + sData1.length;
      total.forEach((t, i) => dData[o2 + i] = sData2[o1 + i]);
    }
  }
  return destData;
}

export function generic(sourceData: ImageData, fns: Array<(sourceData: ImageData, destData: ImageData, index: number) => void>) {
  const w = sourceData.width;
  const h = sourceData.height;
  const destData = new ImageData(w, h);
  for (let i = 0; i < sourceData.data.length; i += 4) {
    fns.forEach(fn => fn(sourceData, destData, i));
  }
  return destData;
}

export function fadeImage(sourceData: ImageData) {
  const sData = sourceData.data;
  const w = sourceData.width;
  const h = sourceData.height;
  const destData = new ImageData(w, h);
  const dData = destData.data;
  const total = [0, 0, 0];

  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const o = 4 * (y1 * w + x1);
      total.forEach((t, i) => dData[o + i] = sData[o + i]);
      let p = (h - y1) / (h * 1);
      // p = Math.pow(p, 2);
      p = 1 - Math.pow(1 - p, 2);
      const alpha = Math.ceil(p * sData[o + 3]);
      dData[o + 3] = alpha;
    }
  }
  return destData;
}

export function areaImage(sourceData: ImageData, x: number, y: number, width: number, height: number) {
  const sData = sourceData.data;
  const w = sourceData.width;
  const h = sourceData.height;
  const destData = new ImageData(width, height);
  const dData = destData.data;
  const total = [0, 0, 0, 0];

  for (let y1 = 0; y1 < height; y1++) {
    for (let x1 = 0; x1 < width; x1++) {
      const o1 = 4 * ((y1 + y) * w + (x1 + x));
      const o2 = 4 * (y1 * width + x1);
      total.forEach((t, i) => dData[o2 + i] = sData[o1 + i]);
    }
  }
  return destData;
}

export function rotateImage(sourceData: ImageData, point: any, angle: number) {
  const destData = new ImageData(sourceData.width, sourceData.height);
  for (let y1 = 0; y1 < sourceData.height; y1++) {
    for (let x1 = 0; x1 < sourceData.width; x1++) {

    }
  }
}

export function mirrorImage(sourceData: ImageData) {
  const sData = sourceData.data;
  const w = sourceData.width;
  const h = sourceData.height;
  const destData = new ImageData(w, h);
  const dData = destData.data;
  const total = [0, 0, 0, 0];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o1 = 4 * (y * w + x);
      const o2 = 4 * ((h - y) * w + x);
      total.forEach((t, i) => dData[o2 + i] = sData[o1 + i]);
    }
  }
  return destData;
}

export const grayscaleImageFn = (sourceData: ImageData, destData: ImageData, index: number) => {
  const avg = Math.ceil((sourceData.data[index] + sourceData.data[index + 1] + sourceData.data[index + 2]) / 3);
  destData.data[index] = avg;
  destData.data[index + 1] = avg;
  destData.data[index + 2] = avg;
  destData.data[index + 3] = sourceData.data[index + 3];
};

export function grayscaleImage(sourceData: ImageData) {
  const sData = sourceData.data;
  const w = sourceData.width;
  const h = sourceData.height;
  const destData = new ImageData(w, h);
  const dData = destData.data;
  for (let i = 0; i < sData.length; i += 4) {
    grayscaleImageFn(sourceData, destData, i);
  }
  return destData;
}

function gaussianBlurImage(sourceData: ImageData, radius: number) {
  const n = 3;
  const wIdeal = Math.sqrt((12 * radius * radius / n) + 1);
  let wl = Math.floor(wIdeal);
  wl = wl % 2 === 0 ? wl - 1 : wl;
  const wu = wl + 2;
  const mIdeal = (12 * radius * radius - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4);
  const m = Math.round(mIdeal);
  const sizes = new Array(n).fill(0).map((x, i) => i < m ? wl : wu);
  let destData = boxBlurImage(sourceData, sizes[0]);
  destData = boxBlurImage(destData, sizes[1]);
  destData = boxBlurImage(destData, sizes[2]);
  return destData;
}

function horizontalBlurImage(sourceData: ImageData, radius: number) {
  radius = radius % 2 === 0 ? radius + 1 : radius;
  const destData = new ImageData(sourceData.width, sourceData.height);
  const avg = 1 / radius;
  const t = [0, 0, 0, 0];

  for (let y1 = 0; y1 < sourceData.height; y1++) {
    const hSum = [0, 0, 0, 0];
    const iAvg = [0, 0, 0, 0];

    for (let x1 = 0; x1 < radius; x1++) {
      const o = 4 * (y1 * sourceData.width + x1);
      t.forEach((x, i) => hSum[i] += sourceData.data[o + i]);
    }
    t.forEach((x, i) => iAvg[i] = hSum[i] * avg);

    for (let x1 = 0; x1 < sourceData.width; x1++) {
      if (x1 - Math.floor(radius / 2) >= 0 && x1 + 1 + Math.floor(radius / 2) < sourceData.width) {
        const o1 = 4 * ((y1 * sourceData.width) + (x1 - Math.floor(radius / 2)));
        const o2 = 4 * ((y1 * sourceData.width) + (x1 + 1 + Math.floor(radius / 2)));
        t.forEach((x, i) => hSum[i] = hSum[i] - sourceData.data[o1 + i] + sourceData.data[o2 + i]);
        t.forEach((x, i) => iAvg[i] = hSum[i] * avg);
      }
      const o = 4 * (y1 * sourceData.width + x1);
      t.forEach((x, i) => destData.data[o + i] = Math.floor(iAvg[i]));
    }
  }
  return destData;
}

function verticalBlurImage(sourceData: ImageData, radius: number) {
  radius = radius % 2 === 0 ? radius + 1 : radius;
  const destData = new ImageData(sourceData.width, sourceData.height);
  const avg = 1 / radius;
  const t = [0, 0, 0, 0];
  
  for (let x1 = 0; x1 < sourceData.width; x1++) {
    const tSum = [0, 0, 0, 0];
    const iAvg = [0, 0, 0, 0];

    for (let y = 0; y < radius; y++) {
      const o = 4 * (y * sourceData.width + x1);
      t.forEach((x, i) => tSum[i] += sourceData.data[o + i]);
    }
    t.forEach((x, i) => iAvg[i] = tSum[i] * avg);

    for (let y2 = 0; y2 < sourceData.height; y2++) {
      if (y2 - Math.floor(radius / 2) >= 0 && y2 + 1 + Math.floor(radius / 2) < sourceData.height) {
        const o1 = 4 * (((y2 - Math.floor(radius / 2)) * sourceData.width) + x1);
        const o2 = 4 * (((y2 + 1 + Math.floor(radius / 2)) * sourceData.width) + x1);
        t.forEach((x, i) => tSum[i] += sourceData.data[o2 + i] - sourceData.data[o1 + i]);
        t.forEach((x, i) => iAvg[i] = tSum[i] * avg);
      }
      const o = 4 * (y2 * sourceData.width + x1);
      t.forEach((x, i) => destData.data[o + i] = Math.floor(iAvg[i]));
    }
  }
  return destData;
}

// Should pass odd numbers as radius
function boxBlurImage(sourceData: ImageData, radius: number) {
  // const destData = horizontalBlurImage(sourceData, radius);
  const destData = verticalBlurImage(sourceData, radius);
  return destData;
}

export function pixelateImage(sourceData: ImageData, size: number) {
  const sData = sourceData.data;
  const w = sourceData.width;
  const h = sourceData.height;
  const destData = new ImageData(w, h);
  const dData = destData.data;
  let total = [0, 0, 0, 0];

  for (let y1 = 0; y1 < Math.floor(h / size); ++y1) {
    for (let x1 = 0; x1 < Math.floor(w / size); ++x1) {
      total = [0, 0, 0, 0];
      for (let y2 = 0; y2 < size; ++y2) {
        for (let x2 = 0; x2 < size; ++x2) {
          const o = 4 * ((x2 + x1 * size) + w * (y2 + y1 * size));
          total.forEach((x, i) => total[i] += sData[o + i]);
        }
      }
      total.forEach((x, i) => total[i] /= size * size);

      for (let y2 = 0; y2 < size; ++y2) {
        for (let x2 = 0; x2 < size; ++x2) {
          const o = 4 * ((x2 + x1 * size) + w * (y2 + y1 * size));
          total.forEach((x, i) => dData[o + i] = total[i]);
        }
      }
    }

    if (w % size !== 0) {
      total = [0, 0, 0, 0];
      for (let y2 = 0; y2 < size; ++y2) {
        for (let x2 = 0; x2 < w % size; ++x2) {
          const o = 4 * ((x2 + Math.floor(w / size) * size) + w * (y2 + y1 * size));
          total.forEach((x, i) => total[i] += sData[o + i]);
        }
      }
      total.forEach((x, i) => total[i] /= (w % size) * size);

      for (let y2 = 0; y2 < size; ++y2) {
        for (let x2 = 0; x2 < w % size; ++x2) {
          const o = 4 * ((x2 + Math.floor(w / size) * size) + w * (y2 + y1 * size));
          total.forEach((x, i) => dData[o + i] = total[i]);
        }
      }
    }
  }

  for (let x1 = 0; x1 < Math.floor(w / size); ++x1) {
    total = [0, 0, 0, 0];
    for (let y2 = 0; y2 < h % size; ++y2) {
      for (let x2 = 0; x2 < size; ++x2) {
        const o = 4 * ((x2 + x1 * size) + w * (y2 + Math.floor(h / size) * size));
        total.forEach((x, i) => total[i] += sData[o + i]);
      }
    }
    total.forEach((x, i) => total[i] /= size * (h % size));

    for (let y2 = 0; y2 < h % size; ++y2) {
      for (let x2 = 0; x2 < size; ++x2) {
        const o = 4 * ((x2 + x1 * size) + w * (y2 + Math.floor(h / size) * size));
        total.forEach((x, i) => dData[o + i] = total[i]);
      }
    }
  }

  total = [0, 0, 0, 0];
  for (let y2 = 0; y2 < h % size; ++y2) {
    for (let x2 = 0; x2 < w % size; ++x2) {
      const o = 4 * ((x2 + Math.floor(w / size) * size) + w * (y2 + Math.floor(h / size) * size));
      total.forEach((x, i) => total[i] += sData[o + i]);
    }
  }
  total.forEach((x, i) => total[i] /= (w % size) * (h % size));

  for (let y2 = 0; y2 < h % size; ++y2) {
    for (let x2 = 0; x2 < w % size; ++x2) {
      const o = 4 * ((x2 + Math.floor(w / size) * size) + w * (y2 + Math.floor(h / size) * size));
      total.forEach((x, i) => dData[o + i] = total[i]);
    }
  }
  return destData;
}

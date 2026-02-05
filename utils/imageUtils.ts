/**
 * Processes a base64 image to make its background transparent.
 * Assumes the background is relatively uniform (white/light or consistent color).
 * Uses a corner pixel flood/similarity check.
 */
export const removeBackground = (base64Image: string, tolerance: number = 20): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Get background color from top-left pixel
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Euclidean distance for color difference
        const distance = Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        );
        
        if (distance <= tolerance) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = base64Image;
  });
};

/**
 * Analyzes the image alpha channel and centers the non-transparent content
 * within the canvas. This ensures animations pivot correctly around the center.
 */
export const centerSprite = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error("No context")); return; }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
      let found = false;

      // Scan for non-transparent pixels
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const alphaIndex = (y * canvas.width + x) * 4 + 3;
          const alpha = data[alphaIndex];
          if (alpha > 10) { // Threshold to ignore semi-transparent artifacts
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            found = true;
          }
        }
      }

      if (!found) {
        resolve(base64Image); // Return original if empty
        return;
      }

      const contentWidth = maxX - minX + 1;
      const contentHeight = maxY - minY + 1;

      // Calculate centering offsets
      // We center primarily horizontally for game sprites. 
      // Vertically, we often want feet to be somewhat consistent, but centering is safer for general generation.
      const targetX = Math.floor((canvas.width - contentWidth) / 2);
      const targetY = Math.floor((canvas.height - contentHeight) / 2);

      // Create new clean canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) { resolve(base64Image); return; }

      // Draw the cropped content into the center
      tempCtx.drawImage(
        canvas, 
        minX, minY, contentWidth, contentHeight, 
        targetX, targetY, contentWidth, contentHeight
      );
      
      resolve(tempCanvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = base64Image;
  });
};

export const generateSpriteSheet = (frames: string[], columns: number = 4): Promise<string> => {
  if (frames.length === 0) return Promise.resolve('');

  return new Promise((resolve, reject) => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    // Load all images first to get dimensions
    frames.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frames.length) {
          renderSheet();
        }
      };
      img.onerror = reject;
      img.src = src;
      images.push(img);
    });

    const renderSheet = () => {
      if (images.length === 0) return;
      
      // Assume all frames are same size as the first one for grid calculation
      const frameWidth = images[0].width;
      const frameHeight = images[0].height;
      
      const rows = Math.ceil(images.length / columns);
      
      const canvas = document.createElement('canvas');
      canvas.width = frameWidth * columns;
      canvas.height = frameHeight * rows;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      images.forEach((img, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        ctx.drawImage(img, col * frameWidth, row * frameHeight);
      });
      
      resolve(canvas.toDataURL('image/png'));
    };
  });
};
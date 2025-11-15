import m from "mithril";
import styles from "../onboarding.module.css";

const ImageCropper = {
  oninit: (vnode) => {
    vnode.state.canvas = null;
    vnode.state.ctx = null;
    vnode.state.image = null;
    vnode.state.isDragging = false;
    vnode.state.dragStart = { x: 0, y: 0 };
    vnode.state.imageOffset = { x: 0, y: 0 };
    vnode.state.scale = 1;
    vnode.state.minScale = 0.1;
    vnode.state.maxScale = 3;
  },

  oncreate: (vnode) => {
    vnode.state.canvas = vnode.dom.querySelector('canvas');
    vnode.state.ctx = vnode.state.canvas.getContext('2d');
    
    if (vnode.attrs.imageData) {
      ImageCropper.loadImage(vnode, vnode.attrs.imageData);
    }
  },

  onupdate: (vnode) => {
    if (vnode.attrs.imageData && vnode.attrs.imageData !== vnode.state.lastImageData) {
      ImageCropper.loadImage(vnode, vnode.attrs.imageData);
      vnode.state.lastImageData = vnode.attrs.imageData;
    }
  },

  loadImage: (vnode, dataUrl) => {
    const img = new Image();
    img.onload = () => {
      vnode.state.image = img;
      
      // Calculate initial scale to fit image
      const canvasSize = 300;
      const scale = Math.max(canvasSize / img.width, canvasSize / img.height);
      vnode.state.scale = scale;
      vnode.state.minScale = scale * 0.5;
      
      // Center image with bounds checking
      const centerX = (canvasSize - img.width * scale) / 2;
      const centerY = (canvasSize - img.height * scale) / 2;
      vnode.state.imageOffset = ImageCropper.constrainOffset(vnode, centerX, centerY);
      
      ImageCropper.draw(vnode);
      m.redraw();
    };
    img.src = dataUrl;
  },

  draw: (vnode) => {
    const { canvas, ctx, image, imageOffset, scale } = vnode.state;
    if (!canvas || !ctx || !image) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(
      image,
      imageOffset.x,
      imageOffset.y,
      image.width * scale,
      image.height * scale
    );

    // Draw crop overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw corner guides
    const cornerSize = 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - cornerSize, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, cornerSize);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - cornerSize);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(cornerSize, canvas.height);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - cornerSize, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, canvas.height - cornerSize);
    ctx.stroke();
  },

  handleMouseDown: (vnode, e) => {
    vnode.state.isDragging = true;
    vnode.state.dragStart = {
      x: e.offsetX - vnode.state.imageOffset.x,
      y: e.offsetY - vnode.state.imageOffset.y
    };
  },

  handleMouseMove: (vnode, e) => {
    if (!vnode.state.isDragging) return;
    
    const newX = e.offsetX - vnode.state.dragStart.x;
    const newY = e.offsetY - vnode.state.dragStart.y;
    
    vnode.state.imageOffset = ImageCropper.constrainOffset(vnode, newX, newY);
    
    ImageCropper.draw(vnode);
  },

  constrainOffset: (vnode, x, y) => {
    const { canvas, image, scale } = vnode.state;
    if (!canvas || !image) return { x, y };

    const canvasSize = canvas.width;
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    // Calculate bounds - image edges must not go inside the canvas
    const minX = canvasSize - scaledWidth;
    const maxX = 0;
    const minY = canvasSize - scaledHeight;
    const maxY = 0;

    // Constrain x and y to bounds
    const constrainedX = Math.max(minX, Math.min(maxX, x));
    const constrainedY = Math.max(minY, Math.min(maxY, y));

    return { x: constrainedX, y: constrainedY };
  },

  handleMouseUp: (vnode) => {
    vnode.state.isDragging = false;
  },

  handleWheel: (vnode, e) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(vnode.state.scale * delta, vnode.state.minScale), vnode.state.maxScale);
    
    if (newScale !== vnode.state.scale) {
      // Zoom towards mouse position
      const rect = vnode.state.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleDiff = newScale - vnode.state.scale;
      const newX = vnode.state.imageOffset.x - (mouseX - vnode.state.imageOffset.x) * scaleDiff / vnode.state.scale;
      const newY = vnode.state.imageOffset.y - (mouseY - vnode.state.imageOffset.y) * scaleDiff / vnode.state.scale;
      
      vnode.state.scale = newScale;
      vnode.state.imageOffset = ImageCropper.constrainOffset(vnode, newX, newY);
      
      ImageCropper.draw(vnode);
    }
  },

  getCroppedImage: (state) => {
    const { canvas } = state;
    if (!canvas) return null;
    
    return canvas.toDataURL('image/png');
  },

  view: (vnode) => {
    return (
      <div class={styles.imageCropper}>
        <canvas
          width="300"
          height="300"
          onmousedown={(e) => ImageCropper.handleMouseDown(vnode, e)}
          onmousemove={(e) => ImageCropper.handleMouseMove(vnode, e)}
          onmouseup={() => ImageCropper.handleMouseUp(vnode)}
          onmouseleave={() => ImageCropper.handleMouseUp(vnode)}
          onwheel={(e) => ImageCropper.handleWheel(vnode, e)}
          class={styles.cropperCanvas}
        />
        <div class={styles.cropperInstructions}>
          <small>Drag to move • Scroll to zoom</small>
        </div>
      </div>
    );
  }
};

export default ImageCropper;

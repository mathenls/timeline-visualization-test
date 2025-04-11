import * as C from '../constants';

// Draw a rounded rectangle
export const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

// Draw drag handles for timeline items
export const drawDragHandles = (ctx, x, y, width, height) => {
  // Draw left handle dots
  ctx.fillStyle = C.COLOR_DRAG_HANDLE_DOTS;
  const dotY = y + height / 2;
  
  // Left handle dots
  for (let i = 0; i < C.DRAG_HANDLE_NUM_DOTS; i++) {
    ctx.beginPath();
    ctx.arc(
      x + C.DRAG_HANDLE_EDGE_PADDING, 
      dotY - ((C.DRAG_HANDLE_NUM_DOTS - 1) / 2 * C.DRAG_HANDLE_DOT_SPACING) + (i * C.DRAG_HANDLE_DOT_SPACING), 
      C.DRAG_HANDLE_DOT_SIZE, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Right handle dots
  for (let i = 0; i < C.DRAG_HANDLE_NUM_DOTS; i++) {
    ctx.beginPath();
    ctx.arc(
      x + width - C.DRAG_HANDLE_EDGE_PADDING, 
      dotY - ((C.DRAG_HANDLE_NUM_DOTS - 1) / 2 * C.DRAG_HANDLE_DOT_SPACING) + (i * C.DRAG_HANDLE_DOT_SPACING), 
      C.DRAG_HANDLE_DOT_SIZE, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
};

// Draw the text inside a timeline item
export const drawItemText = (ctx, item, x, y, width, height) => {
  ctx.fillStyle = C.COLOR_ITEM_TEXT;
  ctx.font = "13px Arial";
  ctx.textBaseline = "middle";
  
  // Truncate text if it doesn't fit
  const maxTextWidth = width - (C.ITEM_TEXT_PADDING * 2);
  const text = item.name;
  const textWidth = ctx.measureText(text).width;
  
  if (textWidth <= maxTextWidth) {
    ctx.fillText(text, x + C.ITEM_TEXT_PADDING, y + height / 2);
  } else {
    // Truncate and add ellipsis
    let truncatedText = text;
    let ellipsis = "...";
    let ellipsisWidth = ctx.measureText(ellipsis).width;
    
    while (ctx.measureText(truncatedText + ellipsis).width > maxTextWidth && truncatedText.length > 0) {
      truncatedText = truncatedText.slice(0, -1);
    }
    
    ctx.fillText(truncatedText + ellipsis, x + C.ITEM_TEXT_PADDING, y + height / 2);
  }
};

// Draw a common background for timeline elements
export const drawElementBackground = (ctx, x, y, width, height, fillColor, strokeColor) => {
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, width, height);
  
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }
};

export default {
  drawRoundedRect,
  drawDragHandles,
  drawItemText,
  drawElementBackground
}; 
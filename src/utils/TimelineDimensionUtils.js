import * as C from '../constants';

// Calculate content width based on container width and zoom level
export const calculateContentWidth = (containerWidth, zoomLevel) => {
  const baseContentWidth = containerWidth - (C.TIMELINE_PADDING * 2);
  return zoomLevel <= 1 ? baseContentWidth : baseContentWidth * zoomLevel;
};

// Setup canvas dimensions with proper scaling for high DPI displays
export const setupCanvasDimensions = (canvas, containerWidth, canvasHeight, contentWidth, zoomLevel) => {
  const pixelRatio = window.devicePixelRatio || 1;
  const drawWidth = zoomLevel > 1 ? (contentWidth + C.TIMELINE_PADDING * 2) : containerWidth;

  canvas.width = drawWidth * pixelRatio;
  canvas.height = canvasHeight * pixelRatio;
  canvas.style.width = `${drawWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  const ctx = canvas.getContext("2d");
  ctx.scale(pixelRatio, pixelRatio);
  return ctx;
};

// Calculate item position and dimensions
export const calculateItemPosition = (item, minDate, maxDate, contentWidth) => {
  const totalDays = (maxDate - minDate) / C.MS_PER_DAY;
  const itemStartDays = (new Date(item.start) - minDate) / C.MS_PER_DAY;
  const itemEndDays = (new Date(item.end) - minDate) / C.MS_PER_DAY;
  
  const x = C.TIMELINE_PADDING + (itemStartDays / totalDays) * contentWidth;
  const width = Math.max(((itemEndDays - itemStartDays) / totalDays) * contentWidth, C.ITEM_DEFAULT_MIN_WIDTH);
  
  return { x, width };
};

// Get color for timeline item
export const getItemColor = (item) => {
  const colorIndex = (parseInt(item.id) - 1) % C.ITEM_COLORS.length;
  return C.ITEM_COLORS[colorIndex];
};

export default {
  calculateContentWidth,
  setupCanvasDimensions,
  calculateItemPosition,
  getItemColor
}; 
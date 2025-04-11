import React from 'react';
import * as C from '../constants';
import TimelineUtils from './TimelineUtils';
import CanvasDrawingUtils from '../utils/CanvasDrawingUtils';

// Component for rendering the timeline header
const TimelineHeader = ({ ctx, minDate, maxDate, horizontalPadding, headerHeight, contentWidth, canvasHeight, zoomLevel }) => {
  
  // Draw header background and border
  CanvasDrawingUtils.drawElementBackground(
    ctx,
    0,
    0,
    contentWidth + horizontalPadding * 2,
    headerHeight,
    C.COLOR_BG,
    C.COLOR_BORDER
  );

  // Draw main title
  ctx.fillStyle = C.COLOR_HEADER_TEXT;
  ctx.font = "bold 16px Arial";
  ctx.fillText(`Timeline`, horizontalPadding, 25);
  
  // Draw secondary information (Zoom level, Date range)
  const zoomText = `Zoom: ${Math.round(zoomLevel * 100)}%`;
  const rangeText = `Range: ${Math.round((maxDate - minDate) / C.MS_PER_DAY)} days`;
  const dateRangeText = `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
  
  ctx.fillStyle = C.COLOR_SUB_HEADER_TEXT;
  ctx.font = "12px Arial";
  
  // Right-align zoom and range info
  const zoomTextWidth = ctx.measureText(zoomText).width;
  ctx.fillText(zoomText, contentWidth + horizontalPadding - zoomTextWidth - 10, 25);
  const rangeTextWidth = ctx.measureText(rangeText).width;
  ctx.fillText(rangeText, contentWidth + horizontalPadding - rangeTextWidth - 10, 42);
  
  // Position date range below title
  ctx.fillText(dateRangeText, horizontalPadding, 42);
  
  // Generate month markers
  const months = [];
  const currentDate = new Date(minDate);
  currentDate.setDate(1);
  
  const totalMonths = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                      (maxDate.getMonth() - minDate.getMonth());
  
  let monthStep = 1;
  if (totalMonths > 24) {
    monthStep = Math.max(1, Math.floor(totalMonths / 24));
  }
  
  let monthCount = 0;
  while (currentDate <= maxDate) {
    if (monthCount % monthStep === 0) {
      months.push(new Date(currentDate));
    }
    currentDate.setMonth(currentDate.getMonth() + 1);
    monthCount++;
  }
  
  // Draw month grid backgrounds
  ctx.fillStyle = C.COLOR_MONTH_GRID_BG;
  months.forEach((month, index) => {
    const x = TimelineUtils.getXPosition(month, minDate, maxDate, contentWidth, horizontalPadding);
    
    if (month.getMonth() % 2 === 0) {
      let nextX = contentWidth + horizontalPadding;
      if (index < months.length - 1) {
        nextX = TimelineUtils.getXPosition(months[index + 1], minDate, maxDate, contentWidth, horizontalPadding);
      }
      ctx.fillRect(x, headerHeight, nextX - x, canvasHeight - headerHeight);
    }
  });
  
  // Draw month labels
  ctx.font = "bold 13px Arial";
  months.forEach((month) => {
    const x = TimelineUtils.getXPosition(month, minDate, maxDate, contentWidth, horizontalPadding);
    const monthFormat = { month: 'short', year: 'numeric' };
    const monthLabel = month.toLocaleDateString(undefined, monthFormat);
    const labelWidth = ctx.measureText(monthLabel).width + 10;
    
    // Label background
    ctx.fillStyle = C.COLOR_MONTH_GRID_BG;
    ctx.fillRect(x, headerHeight - 30, labelWidth, 20);
    ctx.strokeStyle = C.COLOR_BORDER;
    ctx.strokeRect(x, headerHeight - 30, labelWidth, 20);
    
    // Label text
    ctx.fillStyle = C.COLOR_HEADER_TEXT;
    ctx.fillText(monthLabel, x + 5, headerHeight - 15);
  });
  
  // Draw vertical month lines
  ctx.strokeStyle = C.COLOR_GRID_LINES;
  ctx.setLineDash([4, 2]);
  months.forEach(month => {
    const x = TimelineUtils.getXPosition(month, minDate, maxDate, contentWidth, horizontalPadding);
    ctx.beginPath();
    ctx.moveTo(x, headerHeight);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  
  return months;
};

export default TimelineHeader; 
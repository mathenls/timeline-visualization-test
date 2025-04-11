import * as C from '../constants';
import CanvasDrawingUtils from '../utils/CanvasDrawingUtils';
import DateUtils from '../utils/DateUtils';
import TimelineDimensionUtils from '../utils/TimelineDimensionUtils';

// Utility functions for the timeline
const TimelineUtils = {
  // Calculate X position based on date
  getXPosition: DateUtils.getXPosition,
  
  // Draw a timeline item
  drawTimelineItem: (ctx, item, minDate, maxDate, contentWidth, laneHeight, laneY, horizontalPadding = C.TIMELINE_PADDING, zoomLevel = 1) => {
    const { x, width } = TimelineDimensionUtils.calculateItemPosition(item, minDate, maxDate, contentWidth);
    const height = laneHeight - C.ITEM_VERTICAL_PADDING * 2;
    const itemColor = TimelineDimensionUtils.getItemColor(item);
    
    // Draw item background
    ctx.fillStyle = itemColor;
    CanvasDrawingUtils.drawRoundedRect(ctx, x, laneY + C.ITEM_VERTICAL_PADDING, width, height, C.ITEM_BORDER_RADIUS);
    
    // Draw drag handles
    CanvasDrawingUtils.drawDragHandles(ctx, x, laneY + C.ITEM_VERTICAL_PADDING, width, height);
    
    // Draw item text
    CanvasDrawingUtils.drawItemText(ctx, item, x, laneY + C.ITEM_VERTICAL_PADDING, width, height);
    
    // Return the item's coordinates for hover detection
    return {
      id: item.id,
      name: item.name,
      start: item.start,
      end: item.end,
      x,
      y: laneY + C.ITEM_VERTICAL_PADDING,
      width,
      height,
      color: itemColor
    };
  },
  
  // Convert date to string in YYYY-MM-DD format
  formatDateForStorage: DateUtils.formatDateForStorage
};

export default TimelineUtils; 
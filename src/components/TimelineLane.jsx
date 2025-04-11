import React from 'react';
import * as C from '../constants';
import TimelineUtils from './TimelineUtils';
import CanvasDrawingUtils from '../utils/CanvasDrawingUtils';

// Component for rendering a lane
const TimelineLane = ({ ctx, lane, laneIndex, laneY, laneHeight, minDate, maxDate, contentWidth, horizontalPadding, itemPositionsRef, zoomLevel }) => {
  // Draw lane background
  CanvasDrawingUtils.drawElementBackground(
    ctx,
    horizontalPadding,
    laneY,
    contentWidth + horizontalPadding * 2,
    laneHeight - 5,
    C.COLOR_BG,
    C.COLOR_BORDER
  );
  
  // Draw lane items
  lane.forEach(item => {
    const itemPosition = TimelineUtils.drawTimelineItem(
      ctx, 
      item, 
      minDate, 
      maxDate, 
      contentWidth,
      laneHeight, 
      laneY,
      horizontalPadding,
      zoomLevel
    );
    
    itemPositionsRef.current.push(itemPosition);
  });
};

export default TimelineLane; 
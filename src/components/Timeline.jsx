import React, { useEffect, useRef, useState, useCallback } from 'react';
import { assignLanes } from '../assignLanes';
import TimelineHeader from './TimelineHeader'; 
import TimelineLane from './TimelineLane';   
import * as C from '../constants';
import DateUtils from '../utils/DateUtils';
import TooltipUtils from '../utils/TooltipUtils';
import TimelineDimensionUtils from '../utils/TimelineDimensionUtils';

// --- Helper Functions ---

const formatDateForDisplay = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatDateForDisplayWithYear = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const createHoverTooltipHTML = (itemData) => {
  const duration = Math.ceil((new Date(itemData.end) - new Date(itemData.start)) / C.MS_PER_DAY);
  return `
    <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${itemData.name}</div>
    <div class="tooltip-line"><b>Start:</b> ${formatDateForDisplayWithYear(itemData.start)}</div>
    <div class="tooltip-line"><b>End:</b> ${formatDateForDisplayWithYear(itemData.end)}</div>
    <div class="tooltip-line"><b>Duration:</b> ${duration} day${duration !== 1 ? 's' : ''}</div>
    <div class="tooltip-line"><b>ID:</b> ${itemData.id}</div>
    <div style="font-style: italic; margin-top: 5px; font-size: 11px;">Drag edges to resize, middle to move</div>
  `;
};

const createDragTooltipHTML = (dragType, itemData, newDate) => {
  let content = '';
  if (dragType === 'start') {
    const endDate = new Date(itemData.end);
    if (newDate < endDate) {
      const duration = Math.ceil((endDate - newDate) / C.MS_PER_DAY);
      content = `
        <div style="font-weight: bold;">${itemData.name}</div>
        <div class="tooltip-line">New Start: ${formatDateForDisplay(newDate)}</div>
        <div class="tooltip-line">End: ${formatDateForDisplay(endDate)}</div>
        <div class="tooltip-line">New Duration: ${duration} day${duration !== 1 ? 's' : ''}</div>
      `;
    }
  } else if (dragType === 'end') {
    const startDate = new Date(itemData.start);
    if (newDate > startDate) {
      const duration = Math.ceil((newDate - startDate) / C.MS_PER_DAY);
      content = `
        <div style="font-weight: bold;">${itemData.name}</div>
        <div class="tooltip-line">Start: ${formatDateForDisplay(startDate)}</div>
        <div class="tooltip-line">New End: ${formatDateForDisplay(newDate)}</div>
        <div class="tooltip-line">New Duration: ${duration} day${duration !== 1 ? 's' : ''}</div>
      `;
    }
  } else if (dragType === 'move') {
    const originalDuration = itemData.originalEnd - itemData.originalStart;
    const newStart = newDate;
    const newEnd = new Date(newStart.getTime() + originalDuration);
    content = `
      <div style="font-weight: bold; margin-bottom: 4px;">${itemData.name}</div>
      <div class="tooltip-line">Start: ${formatDateForDisplay(newStart)}</div>
      <div class="tooltip-line">End: ${formatDateForDisplay(newEnd)}</div>
      <div class="tooltip-line">Duration: ${Math.ceil(originalDuration / C.MS_PER_DAY)} days</div>
    `;
  }
  return content;
};

const calculateDateRange = (items, zoomLevel) => {
  let itemsMinDate = new Date(items[0].start);
  let itemsMaxDate = new Date(items[0].end);

  items.forEach(item => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);
    if (startDate < itemsMinDate) itemsMinDate = startDate;
    if (endDate > itemsMaxDate) itemsMaxDate = endDate;
  });

  const baseTotalDays = Math.max(1, (itemsMaxDate - itemsMinDate) / C.MS_PER_DAY);
  const basePaddingDays = Math.ceil(baseTotalDays * C.DATE_PADDING_FACTOR);

  const minDate = new Date(itemsMinDate);
  minDate.setDate(minDate.getDate() - basePaddingDays);

  let maxDate;
  if (zoomLevel < 1) {
    const extensionFactor = (1 / zoomLevel) - 1 + C.DATE_PADDING_FACTOR;
    const extensionDays = Math.ceil(baseTotalDays * extensionFactor);
    maxDate = new Date(itemsMaxDate);
    maxDate.setDate(maxDate.getDate() + extensionDays);
  } else {
    maxDate = new Date(itemsMaxDate);
    maxDate.setDate(maxDate.getDate() + basePaddingDays);
  }

  return { minDate, maxDate };
};

const calculateContentWidth = (containerWidth, zoomLevel) => {
  const baseContentWidth = containerWidth - (C.TIMELINE_PADDING * 2);
  return zoomLevel <= 1 ? baseContentWidth : baseContentWidth * zoomLevel;
};

const setupCanvasDimensions = (canvas, containerWidth, canvasHeight, contentWidth, zoomLevel) => {
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

const calculateDragUpdate = (dragType, dragItem, newDate) => {
  let newStartStr = dragItem.start;
  let newEndStr = dragItem.end;
  let shouldUpdate = false;

  if (dragType === 'start') {
    const endDate = new Date(dragItem.end);
    if (newDate < endDate) {
      newStartStr = newDate.toISOString().split('T')[0];
      shouldUpdate = true;
    }
  } else if (dragType === 'end') {
    const startDate = new Date(dragItem.start);
    if (newDate > startDate) {
      newEndStr = newDate.toISOString().split('T')[0];
      shouldUpdate = true;
    }
  } else if (dragType === 'move') {
    const originalDuration = dragItem.originalEnd - dragItem.originalStart;
    const newStart = newDate;
    const newEnd = new Date(newStart.getTime() + originalDuration);
    newStartStr = newStart.toISOString().split('T')[0];
    newEndStr = newEnd.toISOString().split('T')[0];
    shouldUpdate = true;
  }

  return { newStartStr, newEndStr, shouldUpdate };
};

// --- Component ---

const Timeline = ({ timelineItems: initialTimelineItems }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [timelineItems, setTimelineItems] = useState(initialTimelineItems);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0, color: '' });
  const itemPositionsRef = useRef([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const [dragType, setDragType] = useState(null); 
  const [editingItem, setEditingItem] = useState(null);
  const [lanes, setLanes] = useState([]);
  const [dragTooltip, setDragTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  const redrawTimeline = useCallback(() => {
    if (!canvasRef.current || !containerRef.current || timelineItems.length === 0) return;
    
    const canvas = canvasRef.current;
    const containerWidth = containerRef.current.clientWidth;
    
    const newLanes = assignLanes(timelineItems);
    setLanes(newLanes);
    
    const canvasHeight = newLanes.length * C.LANE_HEIGHT + C.HEADER_HEIGHT;
    const { minDate, maxDate } = DateUtils.getDateRange(timelineItems, zoomLevel);
    const contentWidth = TimelineDimensionUtils.calculateContentWidth(containerWidth, zoomLevel);
    const ctx = TimelineDimensionUtils.setupCanvasDimensions(canvas, containerWidth, canvasHeight, contentWidth, zoomLevel);
    const drawWidth = canvas.width / (window.devicePixelRatio || 1);

    ctx.fillStyle = C.COLOR_BG;
    ctx.fillRect(0, 0, drawWidth, canvasHeight);
    
    ctx.strokeStyle = C.COLOR_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, drawWidth, canvasHeight);
    
    TimelineHeader({ 
      ctx, minDate, maxDate, 
      horizontalPadding: C.TIMELINE_PADDING, 
      headerHeight: C.HEADER_HEIGHT, 
      contentWidth, canvasHeight, zoomLevel
    });
    
    itemPositionsRef.current = [];
    
    newLanes.forEach((lane, laneIndex) => {
      const laneY = C.HEADER_HEIGHT + laneIndex * C.LANE_HEIGHT;
      TimelineLane({
        ctx, lane, laneIndex, laneY,
        laneHeight: C.LANE_HEIGHT,
        minDate, maxDate, contentWidth,
        horizontalPadding: C.TIMELINE_PADDING,
        itemPositionsRef, zoomLevel
      });
    });
  }, [timelineItems, zoomLevel]);
  
  useEffect(() => {
    redrawTimeline();
  }, [redrawTimeline]);
  
  useEffect(() => {
    const handleResize = () => redrawTimeline();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawTimeline]);
  
  const dateFromPosition = useCallback((x, minDate, maxDate, contentWidth, horizontalPadding) => {
    return DateUtils.dateFromPosition(x, minDate, maxDate, contentWidth, horizontalPadding);
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (editingItem) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    for (const item of itemPositionsRef.current) {
      if (mouseX >= item.x && mouseX <= item.x + item.width && mouseY >= item.y && mouseY <= item.y + item.height) {
        let currentDragType = 'move';
        let cursorStyle = 'move';
        
        if (Math.abs(mouseX - (item.x + C.DRAG_HANDLE_EDGE_PADDING)) <= C.DRAG_HANDLE_INTERACTION_ZONE) {
          currentDragType = 'start';
          cursorStyle = 'w-resize';
        } else if (Math.abs(mouseX - (item.x + item.width - C.DRAG_HANDLE_EDGE_PADDING)) <= C.DRAG_HANDLE_INTERACTION_ZONE) {
          currentDragType = 'end';
          cursorStyle = 'e-resize';
        }
        
        setDragType(currentDragType);
        document.body.style.cursor = cursorStyle;
        setIsDragging(true);
        setDragItem({...item, originalStart: new Date(item.start), originalEnd: new Date(item.end)});
        return;
      }
    }
  }, [editingItem]);
  
  const handleMouseMove = useCallback((e) => {
    if (editingItem) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (isDragging && dragItem) {
      const containerWidth = containerRef.current.clientWidth;
      const { minDate, maxDate } = DateUtils.getDateRange(timelineItems, zoomLevel);
      const contentWidth = TimelineDimensionUtils.calculateContentWidth(containerWidth, zoomLevel);
      const newDate = dateFromPosition(mouseX, minDate, maxDate, contentWidth, C.TIMELINE_PADDING);
      
      const { newStartStr, newEndStr, shouldUpdate } = calculateDragUpdate(dragType, dragItem, newDate);
      const tooltipContent = createDragTooltipHTML(dragType, dragItem, newDate);
      
      setDragTooltip({
        visible: tooltipContent !== '',
        content: tooltipContent,
        x: mouseX,
        y: mouseY - 30 
      });
      
      if (shouldUpdate) {
        updateItemDates(dragItem.id, newStartStr, newEndStr);
      }
      return;
    } else {
      setDragTooltip({ visible: false, content: '', x: 0, y: 0 });
    }
    
    let hoveredItem = null;
    for (const item of itemPositionsRef.current) {
      if (mouseX >= item.x && mouseX <= item.x + item.width && mouseY >= item.y && mouseY <= item.y + item.height) {
        hoveredItem = item;
        break;
      }
    }
    
    if (hoveredItem) {
      let cursorStyle = 'move';
      if (Math.abs(mouseX - (hoveredItem.x + C.DRAG_HANDLE_EDGE_PADDING)) <= C.DRAG_HANDLE_INTERACTION_ZONE) {
        cursorStyle = 'w-resize';
      } else if (Math.abs(mouseX - (hoveredItem.x + hoveredItem.width - C.DRAG_HANDLE_EDGE_PADDING)) <= C.DRAG_HANDLE_INTERACTION_ZONE) {
        cursorStyle = 'e-resize';
      }
      document.body.style.cursor = cursorStyle;
      
      const tooltipContent = createHoverTooltipHTML(hoveredItem);
      
      setTooltip({
        visible: true,
        content: tooltipContent,
        x: mouseX,
        y: mouseY,
        color: hoveredItem.color
      });
    } else {
      document.body.style.cursor = 'default';
      setTooltip({ visible: false, content: '', x: 0, y: 0, color: '' });
    }
  }, [isDragging, dragItem, dragType, timelineItems, redrawTimeline, dateFromPosition, editingItem, zoomLevel, updateItemDates]);
  
  const handleMouseUp = useCallback((e) => {
    if (isDragging && dragItem && dragType) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const containerWidth = containerRef.current.clientWidth;
      
      const { minDate, maxDate } = DateUtils.getDateRange(timelineItems, zoomLevel);
      const contentWidth = TimelineDimensionUtils.calculateContentWidth(containerWidth, zoomLevel);
      
      let newDate;
      
      if (dragType === 'move') {
        const adjustedX = mouseX - (dragItem.clickOffsetX || 0);
        newDate = dateFromPosition(adjustedX, minDate, maxDate, contentWidth, C.TIMELINE_PADDING);
      } else {
        newDate = dateFromPosition(mouseX, minDate, maxDate, contentWidth, C.TIMELINE_PADDING);
      }
      
      // Calculate the updated item dates
      const { newStartStr, newEndStr, shouldUpdate } = calculateDragUpdate(dragType, dragItem, newDate);
      
      if (shouldUpdate) {
        updateItemDates(dragItem.id, newStartStr, newEndStr);
      }
    }
    
    setIsDragging(false);
    setDragItem(null);
    setDragType(null);
    setDragTooltip({ visible: false, content: '', x: 0, y: 0 });
    
    document.body.style.cursor = 'default';
  }, [isDragging, dragItem, dragType, timelineItems, zoomLevel, dateFromPosition, updateItemDates]);
  
  const handleDoubleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    for (const item of itemPositionsRef.current) {
      if (mouseX >= item.x && mouseX <= item.x + item.width && mouseY >= item.y && mouseY <= item.y + item.height) {
        setEditingItem(item);
        return;
      }
    }
  }, []);
  
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -C.ZOOM_STEP_WHEEL_OUT : C.ZOOM_STEP_WHEEL_IN;
    setZoomLevel(prev => Math.max(C.MIN_ZOOM, Math.min(C.MAX_ZOOM, prev + delta)));
  }, []);
  
  const handleEditChange = (e) => {
    const value = e.target.value;
    setEditingItem(prev => ({...prev, name: value}));
  };
  
  const handleEditSave = () => {
    if (!editingItem) return;
    updateItemName(editingItem.id, editingItem.name);
  };
  
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    }
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleDoubleClick, handleWheel]);
  
  const updateItemDates = (itemId, newStartStr, newEndStr) => {
    setTimelineItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, start: newStartStr, end: newEndStr } : item
      )
    );
    
    // Show toast notification when dates are updated
    if (dragType === 'start') {
      showToast('Start date updated successfully');
    } else if (dragType === 'end') {
      showToast('End date updated successfully');
    } else if (dragType === 'move') {
      showToast('Item moved successfully');
    }
  };

  const updateItemName = (itemId, newName) => {
    setTimelineItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, name: newName } : item
      )
    );
    setEditingItem(null);
    showToast('Item name updated successfully');
  };
  
  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 3000);
  };
  
  // Calculate tooltip style
  const getTooltipStyle = () => {
    if (!tooltip.visible) return { display: 'none' };
    
    return {
      position: 'fixed',
      left: `${tooltip.x}px`,
      top: `${tooltip.y}px`,
      backgroundColor: C.COLOR_TOOLTIP_BG,
      color: C.COLOR_TOOLTIP_TEXT,
      padding: '8px 10px',
      borderRadius: '4px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      fontSize: '12px',
      zIndex: 1000,
      borderLeft: `3px solid ${tooltip.color}`,
      maxWidth: '280px',
      pointerEvents: 'none'
    };
  };
  
  // Calculate dragTooltip style
  const getDragTooltipStyle = () => {
    if (!dragTooltip.visible) return { display: 'none' };
    
    return {
      position: 'fixed',
      left: `${dragTooltip.x}px`,
      top: `${dragTooltip.y}px`,
      backgroundColor: C.COLOR_DRAG_TOOLTIP_BG,
      color: C.COLOR_DRAG_TOOLTIP_TEXT,
      padding: '8px',
      borderRadius: '3px',
      fontSize: '12px',
      zIndex: 1000,
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    };
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(C.MIN_ZOOM, prev - C.ZOOM_STEP_BUTTON));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(C.MAX_ZOOM, prev + C.ZOOM_STEP_BUTTON));
  };
  
  // Handle mouse out to cancel drag operations
  const handleMouseOut = useCallback(() => {
    setTooltip({ visible: false, content: '', x: 0, y: 0, color: '' });
    
    if (!isDragging) {
      document.body.style.cursor = 'default';
    }
  }, [isDragging]);
  
  return (
    <div className="timeline-container" ref={containerRef} style={{ position: 'relative', overflow: 'auto', height: '100%' }}>
      {/* Visible zoom controls */}
      <div className="zoom-controls" style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 900, 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '5px 10px',
        borderRadius: '20px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <button 
          onClick={handleZoomOut} 
          style={{ 
            padding: '5px 10px',
            borderRadius: '4px', 
            border: 'none', 
            background: '#4285F4', 
            color: 'white', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: 'bold',
            margin: '0 5px'
          }}
        >Zoom Out</button>
        <button 
          onClick={handleZoomReset} 
          style={{ 
            padding: '5px 10px',
            borderRadius: '4px', 
            border: 'none', 
            background: '#4285F4', 
            color: 'white', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: 'bold',
            margin: '0 5px'
          }}
        >Reset Zoom</button>
        <button 
          onClick={handleZoomIn} 
          style={{ 
            padding: '5px 10px',
            borderRadius: '4px', 
            border: 'none', 
            background: '#4285F4', 
            color: 'white', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: 'bold',
            margin: '0 5px'
          }}
        >Zoom In</button>
        <span style={{ fontSize: '14px', margin: '0 10px' }}>Zoom: {Math.round(zoomLevel * 100)}%</span>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        onDoubleClick={handleDoubleClick}
        style={{ display: 'block' }}
      />
      
      {editingItem && (
        <div style={{
          position: 'absolute',
          left: `${editingItem.x}px`,
          top: `${editingItem.y}px`,
          width: `${editingItem.width}px`,
          height: `${editingItem.height}px`,
          backgroundColor: editingItem.color,
          border: '2px solid #fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          borderRadius: `${C.ITEM_BORDER_RADIUS}px`,
          padding: '5px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          animation: 'pulse 1.5s infinite'
        }}>
          <input
            type="text"
            value={editingItem.name}
            onChange={handleEditChange}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditSave}
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              color: 'white',
              fontSize: '13px',
              fontWeight: 'bold',
              padding: '0 8px',
              outline: 'none'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            whiteSpace: 'nowrap'
          }}>
            Editing - Press Enter to save
          </div>
        </div>
      )}
      
      <div 
        className="tooltip"
        dangerouslySetInnerHTML={{ __html: tooltip.content }}
        style={getTooltipStyle()}
      />
      
      <div 
        className="drag-tooltip"
        dangerouslySetInnerHTML={{ __html: dragTooltip.content }}
        style={getDragTooltipStyle()}
      />
      
      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#4CAF50' : '#F44336',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}
      
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}
      </style>
    </div>
  );
};

export default Timeline; 
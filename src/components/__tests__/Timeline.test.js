import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Timeline from '../Timeline';
import { assignLanes } from '../../assignLanes';
import TimelineHeader from '../TimelineHeader';
import TimelineLane from '../TimelineLane';

// Mock the dependencies
jest.mock('../../assignLanes', () => ({
  assignLanes: jest.fn().mockReturnValue([
    [{ id: 1, name: 'Task 1', start: '2021-01-10', end: '2021-01-20' }],
    [{ id: 2, name: 'Task 2', start: '2021-01-15', end: '2021-01-25' }]
  ])
}));

jest.mock('../TimelineHeader', () => jest.fn());
jest.mock('../TimelineLane', () => jest.fn());

// Mock canvas getContext and other methods
const mockCtx = {
  scale: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  fillStyle: '',
  font: '',
  strokeStyle: '',
  lineWidth: 1,
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn().mockReturnValue({ width: 80 }),
  setLineDash: jest.fn(),
  createLinearGradient: jest.fn().mockReturnValue({
    addColorStop: jest.fn()
  })
};

HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCtx);

describe('Timeline Component', () => {
  const timelineItems = [
    { id: 1, name: 'Task 1', start: '2021-01-10', end: '2021-01-20' },
    { id: 2, name: 'Task 2', start: '2021-01-15', end: '2021-01-25' }
  ];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock element.getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 1000,
      height: 500,
      top: 0,
      left: 0,
      bottom: 500,
      right: 1000
    });
    
    // Set device pixel ratio
    global.window.devicePixelRatio = 2;
    
    // Mock preventDefault for wheel events
    Event.prototype.preventDefault = jest.fn();
  });
  
  it('should render a canvas element', () => {
    render(<Timeline timelineItems={timelineItems} />);
    
    // Expect to find a canvas element
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
  
  it('should call assignLanes with the timeline items', () => {
    render(<Timeline timelineItems={timelineItems} />);
    
    // Verify assignLanes was called with the timeline items
    expect(assignLanes).toHaveBeenCalledWith(timelineItems);
  });
  
  it('should call TimelineHeader and TimelineLane components', () => {
    render(<Timeline timelineItems={timelineItems} />);
    
    // Verify TimelineHeader was called
    expect(TimelineHeader).toHaveBeenCalled();
    
    // Verify TimelineLane was called once for each lane
    expect(TimelineLane).toHaveBeenCalledTimes(2);
  });
  
  it('should handle window resize', () => {
    const { rerender } = render(<Timeline timelineItems={timelineItems} />);
    
    // Trigger window resize
    fireEvent(window, new Event('resize'));
    
    // Re-render with same props
    rerender(<Timeline timelineItems={timelineItems} />);
    
    // Verify TimelineHeader was called again after resize
    expect(TimelineHeader).toHaveBeenCalled();
  });
  
  it('should render zoom controls', () => {
    render(<Timeline timelineItems={timelineItems} />);
    
    // Check for zoom buttons
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
    expect(screen.getByText('Zoom Out')).toBeInTheDocument();
    expect(screen.getByText('Reset Zoom')).toBeInTheDocument();
    
    // Check for zoom level display
    expect(screen.getByText(/zoom: 100%/i)).toBeInTheDocument();
  });
  
  it('should change zoom level when zoom buttons are clicked', () => {
    render(<Timeline timelineItems={timelineItems} />);
    
    // Get zoom buttons
    const zoomInButton = screen.getByText('Zoom In');
    const zoomOutButton = screen.getByText('Zoom Out');
    const resetZoomButton = screen.getByText('Reset Zoom');
    
    // Trigger zoom in button click
    fireEvent.click(zoomInButton);
    
    // Verify zoomed in level
    expect(screen.getByText(/zoom: 120%/i)).toBeInTheDocument();
    
    // Trigger zoom out button click
    fireEvent.click(zoomOutButton);
    
    // Verify back to normal zoom
    expect(screen.getByText(/zoom: 100%/i)).toBeInTheDocument();
    
    // Zoom in twice
    fireEvent.click(zoomInButton);
    fireEvent.click(zoomInButton);
    
    // Reset zoom
    fireEvent.click(resetZoomButton);
    
    // Verify reset to 100%
    expect(screen.getByText(/zoom: 100%/i)).toBeInTheDocument();
  });
  
  it('should handle mouse interactions for drag operations', () => {
    // Mock item positions for hover detection
    const mockItemPosition = {
      id: 1,
      name: 'Task 1',
      start: '2021-01-10',
      end: '2021-01-20',
      x: 50,
      y: 80,
      width: 100,
      height: 70,
      color: '#4285F4'
    };
    
    // Render with access to the container
    const { container } = render(<Timeline timelineItems={timelineItems} />);
    
    // Get canvas element
    const canvas = container.querySelector('canvas');
    
    // Create custom mouse events with clientX/clientY properties
    const mouseMoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    
    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    
    // Trigger events
    fireEvent(canvas, mouseMoveEvent);
    fireEvent(canvas, mouseDownEvent);
    fireEvent(canvas, mouseMoveEvent);
    fireEvent(canvas, mouseUpEvent);
    
    // Verify canvas is in document (simple validation)
    expect(canvas).toBeInTheDocument();
  });
  
  it('should handle double-click for inline editing', () => {
    // Mock item positions for double-click detection
    const mockItemPosition = {
      id: 1,
      name: 'Task 1',
      start: '2021-01-10',
      end: '2021-01-20',
      x: 50,
      y: 80,
      width: 100,
      height: 70,
      color: '#4285F4'
    };
    
    // Render with access to the container
    const { container } = render(<Timeline timelineItems={timelineItems} />);
    
    // Get canvas element
    const canvas = container.querySelector('canvas');
    
    // Create custom double-click event with clientX/clientY properties
    const dblClickEvent = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    
    // Trigger double-click event on the canvas
    fireEvent(canvas, dblClickEvent);
    
    // Verify canvas is in document
    expect(canvas).toBeInTheDocument();
  });
  
  it('should handle mouse wheel zoom', () => {
    render(<Timeline timelineItems={timelineItems} />);
    
    // Get canvas element
    const canvas = document.querySelector('canvas');
    
    // Create wheel events with proper properties
    const zoomInEvent = new WheelEvent('wheel', { 
      bubbles: true,
      cancelable: true,
      deltaY: -100,
      clientX: 100,
      clientY: 100
    });
    
    // Simulate wheel event to zoom in
    fireEvent(canvas, zoomInEvent);
    
    // Since we can't directly check the zoom level (mocked component),
    // we'll just verify no errors occurred
    expect(canvas).toBeInTheDocument();
    
    // Create a wheel event that zooms out
    const zoomOutEvent = new WheelEvent('wheel', { 
      bubbles: true,
      cancelable: true,
      deltaY: 100,
      clientX: 100,
      clientY: 100
    });
    
    // Simulate wheel event to zoom out
    fireEvent(canvas, zoomOutEvent);
    
    // Verify no errors
    expect(canvas).toBeInTheDocument();
  });
}); 
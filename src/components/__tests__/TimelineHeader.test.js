import TimelineHeader from '../TimelineHeader';
import TimelineUtils from '../TimelineUtils';

// Mock dependencies
jest.mock('../TimelineUtils', () => ({
  getXPosition: jest.fn().mockReturnValue(100)
}));

describe('TimelineHeader', () => {
  let ctx;
  let props;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock canvas context
    ctx = {
      fillStyle: '',
      font: '',
      strokeStyle: '',
      lineWidth: 1,
      fillText: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      setLineDash: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 80 })
    };
    
    // Setup common props
    props = {
      ctx,
      minDate: new Date('2021-01-01'),
      maxDate: new Date('2021-04-01'),
      horizontalPadding: 20,
      headerHeight: 90,
      contentWidth: 1000,
      canvasHeight: 500,
      zoomLevel: 1
    };
  });
  
  it('should render the timeline header with title and date range', () => {
    // Call the component function
    const result = TimelineHeader(props);
    
    // Check that it renders the timeline title
    expect(ctx.fillText).toHaveBeenCalledWith(
      'Timeline', 
      props.horizontalPadding, 
      25
    );
    
    // It should return the months array
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0] instanceof Date).toBe(true);
  });
  
  it('should draw month labels and grid lines', () => {
    // Call the component function
    TimelineHeader(props);
    
    // Check that it called the required draw methods
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.strokeRect).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    
    // Verify it used the TimelineUtils.getXPosition function
    expect(TimelineUtils.getXPosition).toHaveBeenCalled();
  });
  
  it('should display the zoom level', () => {
    // Call with a specific zoom level
    TimelineHeader({
      ...props,
      zoomLevel: 1.5
    });
    
    // Check that it renders the zoom level
    expect(ctx.fillText).toHaveBeenCalledWith(
      expect.stringContaining('Zoom: 150%'),
      expect.any(Number),
      expect.any(Number)
    );
  });
  
  it('should display the date range in days', () => {
    // Call the component function
    TimelineHeader(props);
    
    // The date range should be about 90 days (Jan 1 to Apr 1)
    expect(ctx.fillText).toHaveBeenCalledWith(
      expect.stringContaining('Range: 90 days'),
      expect.any(Number),
      expect.any(Number)
    );
  });
  
  it('should always use abbreviated month format', () => {
    // Mock implementation of toLocaleDateString to verify it's called with short month format
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    
    // Replace toLocaleDateString with a spy
    Date.prototype.toLocaleDateString = jest.fn().mockReturnValue('Jan 2021');
    
    // Call component
    TimelineHeader(props);
    
    // Check that toLocaleDateString was called with month: 'short' format
    expect(Date.prototype.toLocaleDateString).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ month: 'short' })
    );
    
    // Restore original method
    Date.prototype.toLocaleDateString = originalToLocaleDateString;
  });
  
  it('should position month labels at the correct height', () => {
    // Call the component function
    TimelineHeader(props);
    
    // Check for a fillRect call for a month label background at the correct height
    expect(ctx.fillRect).toHaveBeenCalledWith(
      expect.any(Number),
      props.headerHeight - 30, // The new position for month labels
      expect.any(Number),
      expect.any(Number)
    );
  });
}); 
import TimelineLane from '../TimelineLane';
import TimelineUtils from '../TimelineUtils';

// Mock the dependencies
jest.mock('../TimelineUtils', () => ({
  drawTimelineItem: jest.fn().mockReturnValue({
    id: 1,
    name: 'Task 1',
    start: '2021-01-10',
    end: '2021-01-20',
    x: 100,
    y: 60,
    width: 200,
    height: 70
  })
}));

describe('TimelineLane', () => {
  let ctx;
  let props;
  
  beforeEach(() => {
    // Reset the mocks
    jest.clearAllMocks();
    
    // Mock canvas context with gradient creation
    ctx = {
      fillStyle: '',
      font: '',
      strokeStyle: '',
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      createLinearGradient: jest.fn().mockReturnValue({
        addColorStop: jest.fn()
      }),
      measureText: jest.fn().mockReturnValue({ width: 60 })
    };
    
    // Mock refs
    const itemPositionsRef = {
      current: []
    };
    
    // Setup common props
    props = {
      ctx,
      lane: [
        { id: 1, name: 'Task 1', start: '2021-01-10', end: '2021-01-20' },
        { id: 2, name: 'Task 2', start: '2021-01-15', end: '2021-01-25' }
      ],
      laneIndex: 0,
      laneY: 60,
      laneHeight: 80,
      minDate: new Date('2021-01-01'),
      maxDate: new Date('2021-02-01'),
      contentWidth: 1000,
      horizontalPadding: 20,
      itemPositionsRef,
      zoomLevel: 1
    };
  });
  
  it('should draw the lane background and border', () => {
    // Call the component function
    TimelineLane(props);
    
    // Verify the lane background was drawn
    expect(ctx.fillRect).toHaveBeenCalledWith(
      props.horizontalPadding,
      props.laneY,
      expect.any(Number),
      props.laneHeight - 5
    );
    
    // Verify the lane border was drawn
    expect(ctx.strokeRect).toHaveBeenCalledWith(
      props.horizontalPadding,
      props.laneY,
      expect.any(Number),
      props.laneHeight - 5
    );
  });
  
  it('should not draw lane label or date range', () => {
    // Call the component function
    TimelineLane(props);
    
    // Verify that fillText was not called for lane labels
    expect(ctx.fillText).not.toHaveBeenCalled();
  });
  
  it('should draw each item in the lane', () => {
    // Call the component function
    TimelineLane(props);
    
    // Verify drawTimelineItem was called for each item in the lane
    expect(TimelineUtils.drawTimelineItem).toHaveBeenCalledTimes(props.lane.length);
    
    // Verify first call parameters
    expect(TimelineUtils.drawTimelineItem).toHaveBeenCalledWith(
      ctx,
      props.lane[0],
      props.minDate,
      props.maxDate,
      props.contentWidth,
      props.laneHeight,
      props.laneY,
      props.horizontalPadding,
      props.zoomLevel
    );
  });
  
  it('should store item positions in the ref', () => {
    // Call the component function
    TimelineLane(props);
    
    // Verify that item positions were stored
    expect(props.itemPositionsRef.current.length).toBe(props.lane.length);
    expect(props.itemPositionsRef.current[0]).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'Task 1',
        start: '2021-01-10',
        end: '2021-01-20'
      })
    );
  });
  
  it('should apply zoom level when drawing items', () => {
    // Set a different zoom level
    const zoomedProps = {
      ...props,
      zoomLevel: 1.5
    };
    
    // Call the component function
    TimelineLane(zoomedProps);
    
    // Verify drawTimelineItem was called with the correct zoom level
    expect(TimelineUtils.drawTimelineItem).toHaveBeenCalledWith(
      ctx,
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      1.5 // Check the zoom level is passed
    );
  });
}); 
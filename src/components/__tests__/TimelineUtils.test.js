import TimelineUtils from '../TimelineUtils';

describe('TimelineUtils', () => {
  describe('getXPosition', () => {
    it('should calculate the correct X position based on date', () => {
      const minDate = new Date('2021-01-01');
      const maxDate = new Date('2021-04-01');
      const date = new Date('2021-02-01');
      const contentWidth = 1000;
      const horizontalPadding = 20;
      const result = TimelineUtils.getXPosition(date, minDate, maxDate, contentWidth, horizontalPadding);
      
      expect(result).toBeGreaterThan(horizontalPadding);
      expect(result).toBeLessThan(contentWidth + horizontalPadding);
      expect(result).toBeGreaterThan(horizontalPadding + contentWidth / 4);
      expect(result).toBeLessThan(horizontalPadding + contentWidth / 2);
    });
    
    it('should return horizontalPadding for the minDate', () => {
      const minDate = new Date('2021-01-01');
      const maxDate = new Date('2021-04-01');
      const contentWidth = 1000;
      const horizontalPadding = 20;
      const result = TimelineUtils.getXPosition(minDate, minDate, maxDate, contentWidth, horizontalPadding);
      
      expect(result).toBe(horizontalPadding);
    });
  });
  
  describe('drawTimelineItem', () => {
    let ctx;
    let baseProps;

    beforeEach(() => {
      ctx = {
        fillStyle: '',
        font: '',
        textBaseline: '',
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        quadraticCurveTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        arc: jest.fn(),
        measureText: jest.fn().mockReturnValue({ width: 50 }),
        fillText: jest.fn()
      };
      
      baseProps = {
        ctx,
        item: { id: 1, name: 'Test Item', start: '2021-01-10', end: '2021-01-20' },
        minDate: new Date('2021-01-01'),
        maxDate: new Date('2021-02-01'),
        contentWidth: 1000,
        laneHeight: 80,
        laneY: 50,
        horizontalPadding: 20,
        zoomLevel: 1
      };
    });

    it('should draw the item and return coordinates', () => {
      const itemVerticalPadding = 5;
      const result = TimelineUtils.drawTimelineItem(...Object.values(baseProps));
      
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
      
      expect(result).toHaveProperty('id', baseProps.item.id);
      expect(result).toHaveProperty('name', baseProps.item.name);
      expect(result).toHaveProperty('start', baseProps.item.start);
      expect(result).toHaveProperty('end', baseProps.item.end);
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y', baseProps.laneY + itemVerticalPadding);
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result).toHaveProperty('color');
    });
    
    it('should draw multiple drag handle dots on each side', () => {
      TimelineUtils.drawTimelineItem(...Object.values(baseProps));
      expect(ctx.arc).toHaveBeenCalledTimes(10);
      expect(ctx.fill).toHaveBeenCalledTimes(11);
    });
  });
  
  describe('formatDateForStorage', () => {
    it('should format a date as YYYY-MM-DD', () => {
      const date = new Date(2021, 0, 15);
      const result = TimelineUtils.formatDateForStorage(date);
      expect(result).toBe('2021-01-15');
    });
    
    it('should handle single-digit months and days with padding', () => {
      const date = new Date(2021, 0, 5);
      const result = TimelineUtils.formatDateForStorage(date);
      expect(result).toBe('2021-01-05');
    });
    
    it('should handle string date input', () => {
      const dateString = '2021-02-10';
      const result = TimelineUtils.formatDateForStorage(dateString);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
}); 
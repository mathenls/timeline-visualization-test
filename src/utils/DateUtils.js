import * as C from '../constants';

// Format date for display (short format)
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

// Format date for display with year
export const formatDateForDisplayWithYear = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

// Convert date to string in YYYY-MM-DD format
export const formatDateForStorage = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate X position based on date
export const getXPosition = (date, minDate, maxDate, contentWidth, horizontalPadding = C.TIMELINE_PADDING) => {
  const daysFromStart = (new Date(date) - minDate) / C.MS_PER_DAY;
  const totalTimelineDays = (maxDate - minDate) / C.MS_PER_DAY;
  // Prevent division by zero if totalTimelineDays is 0
  if (totalTimelineDays <= 0) {
    return horizontalPadding;
  }
  return horizontalPadding + (daysFromStart / totalTimelineDays) * contentWidth;
};

// Convert canvas position to date
export const dateFromPosition = (x, minDate, maxDate, contentWidth, horizontalPadding) => {
  const canvasX = x - horizontalPadding;
  const totalDays = (maxDate - minDate) / C.MS_PER_DAY;
  const daysFromStart = (canvasX / contentWidth) * totalDays;
  const resultDate = new Date(minDate.getTime() + daysFromStart * C.MS_PER_DAY);
  return resultDate;
};

// Calculate the min and max dates for the timeline with proper padding
export const getDateRange = (items, zoomLevel) => {
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

export default {
  formatDateForDisplay,
  formatDateForDisplayWithYear,
  formatDateForStorage,
  getXPosition,
  dateFromPosition,
  getDateRange
}; 
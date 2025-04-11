import * as C from '../constants';
import { formatDateForDisplayWithYear } from './DateUtils';

// Create HTML content for hover tooltips
export const createHoverTooltipHTML = (itemData) => {
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

// Create HTML content for drag tooltips
export const createDragTooltipHTML = (startDate, endDate) => {
  const duration = Math.ceil((endDate - startDate) / C.MS_PER_DAY);
  return `
    <div><b>Start:</b> ${formatDateForDisplayWithYear(startDate)}</div>
    <div><b>End:</b> ${formatDateForDisplayWithYear(endDate)}</div>
    <div><b>Duration:</b> ${duration} day${duration !== 1 ? 's' : ''}</div>
  `;
};

export default {
  createHoverTooltipHTML,
  createDragTooltipHTML
}; 
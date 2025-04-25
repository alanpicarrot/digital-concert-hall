import React from 'react';
import { Tag } from 'lucide-react';

/**
 * 折扣標籤組件
 * 
 * @param {Object} props
 * @param {string} props.code - 折扣代碼
 * @param {number} props.amount - 折扣金額
 * @param {number|null} props.percentage - 折扣百分比（可選）
 * @param {string} props.className - 額外的 CSS 類名（可選）
 * @returns {JSX.Element}
 */
const DiscountBadge = ({ code, amount, percentage, className = '' }) => {
  // 決定顯示內容：百分比或金額
  const displayValue = percentage ? `${percentage}%` : `NT$${amount}`;
  const tooltipText = percentage 
    ? `${code}: 折扣 ${percentage}%` 
    : `${code}: 折扣 NT$${amount}`;

  return (
    <div 
      className={`inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full ${className}`}
      title={tooltipText}
    >
      <Tag size={12} className="mr-1" />
      <span className="font-medium">{displayValue}</span>
    </div>
  );
};

export default DiscountBadge;

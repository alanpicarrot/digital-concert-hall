import React from 'react';

/**
 * 票券資訊卡片組件
 * 顯示票券詳細信息和行動按鈕
 */
const TicketInfoCard = ({ ticket, onAddToCart }) => {
  if (!ticket) {
    return <div>沒有票券資訊可顯示</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">{ticket.type}</h3>
        <p className="text-gray-600">{ticket.description}</p>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold text-indigo-600">
          NT$ {ticket.price.toLocaleString()}
        </div>
        
        <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
          {ticket.availableQuantity ? `剩餘 ${ticket.availableQuantity} 張` : '售罄'}
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-2">票券包含:</h4>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>音樂會實時串流</li>
          <li>30天回放權限</li>
          {ticket.perks && ticket.perks.map((perk, i) => (
            <li key={i}>{perk}</li>
          ))}
        </ul>
      </div>
      
      <button
        onClick={onAddToCart}
        disabled={!ticket.availableQuantity || ticket.availableQuantity <= 0}
        className={`w-full py-2 rounded-md font-medium text-white 
          ${ticket.availableQuantity && ticket.availableQuantity > 0
            ? 'bg-indigo-600 hover:bg-indigo-700' 
            : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {ticket.availableQuantity && ticket.availableQuantity > 0 ? '加入購物車' : '票券售罄'}
      </button>
    </div>
  );
};

export default TicketInfoCard;

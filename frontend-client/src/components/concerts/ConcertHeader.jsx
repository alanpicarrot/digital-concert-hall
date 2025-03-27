import React from 'react';
import { User } from 'lucide-react';
import PropTypes from 'prop-types';
import { ConcertType } from '../../types/concert';

export const ConcertHeader = ({ concert }) => (
  <div className="relative">
    <img 
      src={concert.image} 
      alt={concert.title} 
      className="w-full h-96 object-cover object-center"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
      <div className="p-6 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{concert.title}</h1>
        <div className="flex items-center mb-1">
          <User size={18} className="mr-2" />
          <span className="text-lg">{concert.performer}</span>
          <span className="mx-2">-</span>
          <span>{concert.performerTitle}</span>
        </div>
      </div>
    </div>
  </div>
);

ConcertHeader.propTypes = {
  concert: ConcertType.isRequired
};
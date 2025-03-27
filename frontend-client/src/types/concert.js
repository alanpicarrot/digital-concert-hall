import PropTypes from 'prop-types';

export const ConcertType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  performer: PropTypes.string.isRequired,
  performerTitle: PropTypes.string.isRequired,
  performerBio: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
  location: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  genre: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  program: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      duration: PropTypes.string.isRequired
    })
  ).isRequired,
  ticketAreas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      available: PropTypes.number.isRequired
    })
  ).isRequired,
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      user: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string.isRequired
    })
  ).isRequired
});
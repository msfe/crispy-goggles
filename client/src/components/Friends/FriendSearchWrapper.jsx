import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FriendSearch } from '../Friends';

const FriendSearchWrapper = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';

  const handleBack = () => {
    navigate('/friends');
  };

  return <FriendSearch searchQuery={searchQuery} onBack={handleBack} />;
};

export default FriendSearchWrapper;
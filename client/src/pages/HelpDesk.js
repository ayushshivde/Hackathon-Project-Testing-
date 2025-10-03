import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Helmet } from 'react-helmet-async';

const HelpDesk = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const sosId = searchParams.get('sosId');
    if (!sosId) {
      setError('Invalid SOS link');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/sos/${encodeURIComponent(sosId)}/public`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message || 'Failed to load help request');
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load help request');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleTrack = () => {
    if (!data?.location) return;
    const { latitude, longitude } = data.location;
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Help Desk - Nari Shakti</title>
      </Helmet>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Help Desk</h1>
        {loading && (
          <div className="card p-6">Loading...</div>
        )}
        {!loading && error && (
          <div className="card p-6 text-red-600">{error}</div>
        )}
        {!loading && data && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div
                className="w-24 h-24 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-300"
                style={{ aspectRatio: '1 / 1' }}
              >
                {data.requesterAvatarUrl ? (
                  <img src={data.requesterAvatarUrl.startsWith('http') ? data.requesterAvatarUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${data.requesterAvatarUrl}`} alt="Requester" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-xs text-gray-500">No image</div>
                )}
              </div>
              <div>
                <div className="text-gray-500 text-sm">Requester</div>
                <div className="text-lg font-semibold text-gray-900">{data.requesterName}</div>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Message</div>
              <div className="text-gray-900">{data.message}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Location</div>
              <div className="text-gray-900">{data.location?.address}</div>
            </div>
            <div className="pt-2">
              <button onClick={handleTrack} className="btn-primary">Track</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpDesk;



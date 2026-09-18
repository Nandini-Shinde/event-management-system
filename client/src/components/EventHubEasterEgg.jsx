import { useEffect } from 'react';

const EventHubEasterEgg = () => {
  useEffect(() => {
    console.log('✅ EVENTHUB EASTER EGG IS MOUNTED');

    const handleKeyDown = (event) => {
      console.log('KEY PRESSED:', event.key);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 99999,
        padding: '10px 15px',
        background: '#635bff',
        color: 'white',
        borderRadius: '10px',
        fontSize: '12px',
        fontWeight: '700'
      }}
    >
      EASTER EGG ARMED
    </div>
  );
};

export default EventHubEasterEgg;
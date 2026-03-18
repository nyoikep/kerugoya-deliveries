'use client';

import { useState, useEffect, ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
}

const NoSSR: React.FC<NoSSRProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : null;
};

export default NoSSR;

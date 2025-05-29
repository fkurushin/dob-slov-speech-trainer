import React, { useEffect, useState } from 'react';
import './BrowserWarning.css';

interface BrowserInfo {
  isIncompatible: boolean;
  browserName: string;
}

const BrowserWarning: React.FC = () => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isIncompatible: false,
    browserName: ''
  });
  
  useEffect(() => {
    // Check browser compatibility
    const checkBrowser = () => {
      const userAgent = navigator.userAgent;
      
      // Check for Safari (not Chrome)
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      
      // Check for Yandex Browser
      const isYandex = /YaBrowser/i.test(userAgent);
      
      if (isSafari) {
        setBrowserInfo({
          isIncompatible: true,
          browserName: 'Safari'
        });
      } else if (isYandex) {
        setBrowserInfo({
          isIncompatible: true,
          browserName: 'Yandex Browser'
        });
      }
    };
    
    checkBrowser();
  }, []);
  
  if (!browserInfo.isIncompatible) return null;
  
  return (
    <div className="browser-warning">
      <div className="warning-content">
        <h3>⚠️ Browser Compatibility Warning</h3>
        <p>
          You're using {browserInfo.browserName}, which has limited support for speech recognition.
          For the best experience, please use Google Chrome or Microsoft Edge.
        </p>
        <p className="small-text">
          The Web Speech API has inconsistent implementation in some browsers, which may cause
          the speech recognition feature to not work properly.
        </p>
      </div>
    </div>
  );
};

export default BrowserWarning; 
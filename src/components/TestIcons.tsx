import React from 'react';
import { 
  FiSettings, 
  FiShield, 
  FiFileText, 
  FiCpu,
  FiCheckCircle,
  FiGlobe,
  FiMail,
  FiBook,
  FiLock,
  FiCreditCard,
  FiAlertCircle,
  FiCode,
  FiRefreshCw,
  FiServer,
  FiPenTool,
  FiDatabase,
  FiCloudSnow,
  FiClock,
  FiTrash2
} from 'react-icons/fi';

const TestIcons = () => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="flex items-center"><FiSettings /> FiSettings</div>
      <div className="flex items-center"><FiShield /> FiShield</div>
      <div className="flex items-center"><FiFileText /> FiFileText</div>
      <div className="flex items-center"><FiCpu /> FiCpu</div>
      <div className="flex items-center"><FiCheckCircle /> FiCheckCircle</div>
      <div className="flex items-center"><FiGlobe /> FiGlobe</div>
      <div className="flex items-center"><FiMail /> FiMail</div>
      <div className="flex items-center"><FiBook /> FiBook</div>
      <div className="flex items-center"><FiLock /> FiLock</div>
      <div className="flex items-center"><FiCreditCard /> FiCreditCard</div>
      <div className="flex items-center"><FiAlertCircle /> FiAlertCircle</div>
      <div className="flex items-center"><FiCode /> FiCode</div>
      <div className="flex items-center"><FiRefreshCw /> FiRefreshCw</div>
      <div className="flex items-center"><FiServer /> FiServer</div>
      <div className="flex items-center"><FiPenTool /> FiPenTool</div>
      <div className="flex items-center"><FiDatabase /> FiDatabase</div>
      <div className="flex items-center"><FiCloudSnow /> FiCloudSnow</div>
      <div className="flex items-center"><FiClock /> FiClock</div>
      <div className="flex items-center"><FiTrash2 /> FiTrash2</div>
    </div>
  );
};

export default TestIcons; 
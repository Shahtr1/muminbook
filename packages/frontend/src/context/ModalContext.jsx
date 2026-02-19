import { createContext, useContext, useState } from 'react';
import { GlobalModalHost } from '@/components/layout/modals/GlobalModalHost.jsx';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState(null);

  const closeModal = () => setModalConfig(null);

  const confirm = (options) =>
    new Promise((resolve) => {
      if (modalConfig) return; // prevent stacking
      setModalConfig({
        type: 'confirm',
        props: {
          ...options,
          onConfirm: () => {
            resolve(true);
            closeModal();
          },
          onCancel: () => {
            resolve(false);
            closeModal();
          },
        },
      });
    });

  return (
    <ModalContext.Provider value={{ confirm }}>
      {children}
      <GlobalModalHost modalConfig={modalConfig} />
    </ModalContext.Provider>
  );
};

export const useXModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useXModal must be used within ModalProvider');
  }
  return context;
};

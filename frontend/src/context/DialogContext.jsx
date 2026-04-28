import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({ open: false, title: "", message: "" });

  const closeDialog = useCallback(() => {
    setDialog({ open: false, title: "", message: "" });
  }, []);

  const showError = useCallback((message, title = "Something went wrong") => {
    setDialog({ open: true, title, message });
  }, []);

  const value = useMemo(
    () => ({
      showError,
      closeDialog
    }),
    [showError, closeDialog]
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialog.open ? (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <div className="dialog-card">
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <button type="button" onClick={closeDialog}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used inside DialogProvider");
  }
  return context;
}


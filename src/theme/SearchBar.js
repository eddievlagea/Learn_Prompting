import "kailua-search/styles.css";
import React, {
  useCallback,
  useRef,
  useContext,
  useState,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

import { SearchContextProvider, SearchWidget } from "kailua-search";

function useDocSearchKeyboardEvents({ isOpen, onOpen, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      function open() {
        // We check that no other DocSearch modal is showing before opening
        // another one.
        if (!document.body.classList.contains("DocSearch--active")) {
          onOpen();
        }
      }

      if (
        (event.keyCode === 27 && isOpen) ||
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (!isEditingContent(event) && event.key === "/" && !isOpen)
      ) {
        event.preventDefault();

        if (isOpen) {
          onClose();
        } else if (!document.body.classList.contains("DocSearch--active")) {
          open();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onOpen, onClose]);
}

function isEditingContent(event) {
  let element = event.target;
  let tagName = element.tagName;
  return (
    element.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA"
  );
}

export default function SearchBarWrapper(props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
  });

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Search</button>
      {isOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "start",
              padding: "12vh",
              zIndex: 9999,
              backdropFilter: "blur(5px)",
            }}
            ref={ref}
            onClick={(event) => {
              if (ref.current === event.target) {
                onClose();
              }
            }}
          >
            <SearchContextProvider>
              <div
                style={{
                  backgroundColor: "white",
                }}
              >
                <SearchWidget
                  apiHostname="api.kailualabs.com"
                  apiKey="podcasts-lex-fridman"
                  catalogId="d2773ba1-88ca-4125-9897-f9b5bed8d2a4"
                  showResults
                />
              </div>
            </SearchContextProvider>
          </div>,
          document.body
        )}
    </>
  );
}

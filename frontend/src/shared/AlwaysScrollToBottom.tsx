import { useRef, useEffect } from "react";

const AlwaysScrollToBottom = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  useEffect(() => elementRef?.current?.scrollIntoView());
  return <div ref={elementRef} />;
};

export default AlwaysScrollToBottom;

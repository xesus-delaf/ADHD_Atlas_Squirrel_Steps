import React from "react";

interface BionicTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Clean text component (bionic bolding removed for effortless readability).
 */
export const BionicText: React.FC<BionicTextProps> = ({
  text,
  className = "",
  style,
}) => {
  if (!text) return null;

  return (
    <span className={`leading-relaxed ${className}`} style={style}>
      {text}
    </span>
  );
};

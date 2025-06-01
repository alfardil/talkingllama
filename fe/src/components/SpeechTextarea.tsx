import { Textarea } from "./ui/textarea";
import React from "react";

interface SpeechTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}

export function SpeechTextarea({
  value,
  onChange,
  placeholder,
  className,
}: SpeechTextareaProps) {
  return (
    <Textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}

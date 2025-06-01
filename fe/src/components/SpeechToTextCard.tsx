import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";

interface SpeechToTextCardProps {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function SpeechToTextCard({
  title,
  children,
  footer,
}: SpeechToTextCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-center gap-4">{footer}</CardFooter>
    </Card>
  );
}

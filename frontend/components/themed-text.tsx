import { Text, type TextProps } from "react-native";

import { cn } from "@/constants/utils";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  className?: string;
};

export function ThemedText({
  style,
  className,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = lightColor || darkColor
    ? useThemeColor({ light: lightColor, dark: darkColor }, "text")
    : undefined;

  return (
    <Text
      className={cn(
        "text-foreground",
        type === "default" && "text-base leading-6",
        type === "title" && "text-4xl font-bold leading-8",
        type === "defaultSemiBold" && "text-base font-semibold leading-6",
        type === "subtitle" && "text-xl font-bold",
        type === "link" && "text-base leading-[30px] text-[#0a7ea4]",
        className
      )}
      style={[color ? { color } : undefined, style]}
      {...rest}
    />
  );
}

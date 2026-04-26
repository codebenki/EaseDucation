import { View, type ViewProps } from "react-native";

import { cn } from "@/constants/utils";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({
  style,
  className,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = lightColor || darkColor
    ? useThemeColor({ light: lightColor, dark: darkColor }, "background")
    : undefined;

  return (
    <View
      className={cn("bg-background", className)}
      style={[backgroundColor ? { backgroundColor } : undefined, style]}
      {...otherProps}
    />
  );
}

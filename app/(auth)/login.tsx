import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, UserRound } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Pressable, View } from "react-native";

export default function Login() {
  const colorScheme = useColorScheme() ?? "light";
  const themeClasses = {
    light: {
      container: "bg-white",
      text: "text-black",
      inputBg: "bg-gray-100",
      border: "border-black",
      previewBg: "bg-white",
    },
    dark: {
      container: "bg-zinc-950",
      text: "text-white",
      inputBg: "bg-zinc-900",
      border: "border-white",
      previewBg: "bg-zinc-800/50",
    },
  };
  const currentTheme = themeClasses[colorScheme];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  function signIn() {
    console.log("test");
    console.log(email);
    console.log(password);

    setEmail("");
    setPassword("");
  }

  return (
    <KeyboardAvoidingView
      className={`flex h-screen justify-center items-center ${currentTheme.container} m-6`}
    >
      <Card
        className={`w-full max-w-sm mx-auto ${currentTheme.container} ${currentTheme.border} border-2 rounded-2xl`}
      >
        <CardHeader className="flex-row">
          <View className="flex-1 gap-1.5">
            <CardTitle
              className={`${currentTheme.text} ${currentTheme.text} ${currentTheme.border} border-4 rounded-full text-2xl self-center p-2`}
            >
              <UserRound size={60} />
            </CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <View className="w-full justify-center gap-4">
            <View className="gap-2">
              <Label htmlFor="email" className={`${currentTheme.text}`}>
                Email
              </Label>
              <Input
                id="email"
                value={email}
                autoComplete="email"
                onChangeText={(text) => setEmail(text)}
                placeholder="User@user.com"
              />
            </View>
            <View className="gap-2">
              <Label htmlFor="password" className={`${currentTheme.text}`}>
                Password
              </Label>
              <View className="flex flex-row gap-2">
                <Input
                  id="password"
                  value={password}
                  secureTextEntry={secureText}
                  onChangeText={(text) => setPassword(text)}
                  placeholder="Password"
                  className={` flex-1`}
                />
                <Pressable
                  className={`${currentTheme.previewBg} ${currentTheme.text} ${currentTheme.border} border p-2 flex items-center justify-center rounded-md`}
                  onPress={() => setSecureText(!secureText)}
                >
                  <Eye size={20}></Eye>
                </Pressable>
              </View>
            </View>
          </View>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className={`w-full bg-green-600`}>
            <Pressable onPress={signIn}>
              <Text className={`${currentTheme.text}`}>Sign In</Text>
            </Pressable>
          </Button>
          <Button className="w-full">
            <Text className={`${currentTheme.text}`}>Sign Up</Text>
          </Button>
        </CardFooter>
      </Card>
    </KeyboardAvoidingView>
  );
}

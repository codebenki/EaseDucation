import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/hooks/use-color-scheme";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRound } from "lucide-react-native";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Pressable, View } from "react-native";

import { authService } from "@/services/auth.service";
import { useRouter } from "expo-router";

export default function Register() {
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
      previewBg: "bg-black",
    },
  };
  const currentTheme = themeClasses[colorScheme];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const router = useRouter();

  async function register() {
    try {
      await authService.register(
        email,
        password,
        firstName,
        middleName,
        lastName,
      );
      Alert.alert("Success", "Confirmation link has been sent to you email!");
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }

    setEmail("");
    setPassword("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
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
              <Input
                id="password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                placeholder="Password"
              />
            </View>
            <View className="gap-2">
              <Label htmlFor="first_name" className={`${currentTheme.text}`}>
                First Name
              </Label>
              <Input
                id="first_name"
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
                placeholder="John"
              />
            </View>
            <View className="gap-2">
              <Label htmlFor="middle_name" className={`${currentTheme.text}`}>
                Middle Name
              </Label>
              <Input
                id="middle_name"
                value={middleName}
                onChangeText={(text) => setMiddleName(text)}
                placeholder="Mike"
              />
            </View>
            <View className="gap-2">
              <Label htmlFor="last_name" className={`${currentTheme.text}`}>
                Last Name
              </Label>
              <Input
                id="last_name"
                value={lastName}
                onChangeText={(text) => setLastName(text)}
                placeholder="Doe"
              />
            </View>
          </View>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center gap-2">
          <Pressable
            onPress={register}
            className={`bg-green-600 ${currentTheme.text} w-full flex justify-center rounded-md p-2`}
          >
            <Text
              className={`${currentTheme.text} text-center text-md font-bold`}
            >
              Register
            </Text>
          </Pressable>
        </CardFooter>
      </Card>
    </KeyboardAvoidingView>
  );
}

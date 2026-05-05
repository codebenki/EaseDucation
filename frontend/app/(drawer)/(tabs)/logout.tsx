import { authService } from "@/services/auth.service";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    authService.signOut().then(() => {
      router.replace("/(auth)/login");
    });
  }, []);

  return null;
}

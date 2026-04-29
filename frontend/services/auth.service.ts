import { supabase } from "./supabase.service";

export const authService = {
  /**
   * Registers a new user with email and password.
   * You can also pass 'data' for additional user metadata (like username).
   */
  async register(
    email: string,
    password: string,
    first_name?: string,
    middle_name?: string,
    last_name?: string,
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: first_name,
          middle_name: middle_name,
          last_name: last_name,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
  },
};

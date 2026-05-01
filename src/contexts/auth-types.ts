import { User, Session, AuthError } from "@supabase/supabase-js";

export type AppRole = "farmer" | "buyer";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null, data: { user: User | null; session: Session | null } }>;
  signOut: () => Promise<void>;
}
import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    permissions?: string | null;
  }
  interface Session {
    user: {
      id?: string;
      role?: string;
      permissions?: string | null;
    } & DefaultSession["user"];
  }
}

const API_KEY = "AIzaSyBlOxvGvw3-KddRfK63EOKhrM4MjA1wpNY";
const PROJECT_ID = "total-beauty-crm";

const WORKERS_MAP: Record<string, string> = {
  kentia: "1",
  arizbeth: "2",
  jessica: "3",
  gerencia: "4",
  francisco: "4",
};

async function getFirestoreUsers() {
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;
    const res = await fetch(firestoreUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "users" }]
        }
      })
    });
    if (!res.ok) return [];
    const list = await res.json();
    return list
      .filter((item: any) => item.document)
      .map((item: any) => {
        const doc = item.document;
        const fields = doc.fields || {};
        return {
          id: doc.name.split("/").pop(),
          email: fields.email?.stringValue || "",
          name: fields.name?.stringValue || "",
          role: fields.role?.stringValue || "",
          permissions: fields.permissions?.stringValue || null,
          portals: fields.portals?.stringValue || "",
        };
      });
  } catch (err) {
    console.error("Error al obtener usuarios de Firestore vía REST:", err);
    return [];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "super-secret-key-change-me-in-production",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo o Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const input = (credentials.email as string).trim();
        const password = credentials.password as string;

        try {
          // 1. Buscar en Firestore si el usuario existe para obtener su email oficial
          const users = await getFirestoreUsers();
          const userPrefix = input.includes("@") ? input.split("@")[0].toLowerCase() : input.toLowerCase();

          const matchedUserDoc = users.find((u: any) => {
            const docEmail = (u.email || "").toLowerCase();
            const docName = (u.name || "").toLowerCase();
            return (
              docEmail === input.toLowerCase() ||
              docName === input.toLowerCase() ||
              docEmail.startsWith(userPrefix + "@") ||
              docName === userPrefix
            );
          });

          const authEmail = matchedUserDoc?.email || input;

          // 2. Autenticar directamente contra Firebase Authentication (Panel de Firebase)
          const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
          const authRes = await fetch(authUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: authEmail,
              password,
              returnSecureToken: true
            })
          });

          const authData = await authRes.json();

          if (!authRes.ok || authData.error || !authData.idToken) {
            console.error("Firebase Auth falló:", authData.error?.message || "Credenciales incorrectas");
            return null;
          }

          // 3. Determinar rol, nombre y workerId correspondiente
          const rawRole = (matchedUserDoc?.role || "").toLowerCase();
          const isAdmin = 
            rawRole.includes("geren") || 
            rawRole === "admin" || 
            authEmail.toLowerCase().includes("gerencia");

          const role = isAdmin ? "admin" : "trabajadora";
          const name = matchedUserDoc?.name || (isAdmin ? "Gerencia" : authEmail.split("@")[0]);
          const lowerName = name.toLowerCase();

          const workerId = WORKERS_MAP[lowerName] || (isAdmin ? "4" : matchedUserDoc?.id || authData.localId);

          return {
            id: workerId,
            name,
            email: authEmail,
            role,
            permissions: matchedUserDoc?.permissions || null
          };
        } catch (error) {
          console.error("Error durante autenticación con Firebase:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string | null;
      }
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: 'checador.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  pages: {
    signIn: '/admin/login', 
  }
});

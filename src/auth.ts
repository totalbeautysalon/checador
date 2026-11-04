import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Asegurar compatibilidad SSL con certificados locales en Windows/antivirus
if (typeof process !== "undefined" && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

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
        
        const rawInput = (credentials.email as string).trim();
        const password = credentials.password as string;

        try {
          // 1. Obtener lista de usuarios de Firestore para cruzar perfiles
          const users = await getFirestoreUsers();

          // 2. Construir lista de correos candidatos a probar en Firebase Authentication
          const candidateEmails: string[] = [];

          if (rawInput.includes("@")) {
            // Prioridad 1: Exactamente el correo que el usuario escribió
            candidateEmails.push(rawInput);

            const lowerInput = rawInput.toLowerCase();
            if (lowerInput !== rawInput) {
              candidateEmails.push(lowerInput);
            }

            // Alternativas de dominio del salón si escribió uno u otro
            if (lowerInput.endsWith("@totalbeautysalon.com.mx")) {
              candidateEmails.push(lowerInput.replace("@totalbeautysalon.com.mx", "@totalbeauty.com"));
            } else if (lowerInput.endsWith("@totalbeauty.com")) {
              candidateEmails.push(lowerInput.replace("@totalbeauty.com", "@totalbeautysalon.com.mx"));
            }

            // Si el correo coincide con algún usuario de Firestore, añadir también ese correo oficial
            const matchedDoc = users.find((u: any) => {
              const uEmail = (u.email || "").toLowerCase();
              return uEmail === lowerInput || uEmail.startsWith(lowerInput.split("@")[0] + "@");
            });
            if (matchedDoc?.email && !candidateEmails.includes(matchedDoc.email)) {
              candidateEmails.push(matchedDoc.email);
            }
          } else {
            // Usuario escribió solo un nombre (ej: "kentia", "gerencia", "jessica")
            const prefix = rawInput.toLowerCase();
            const matchedDoc = users.find((u: any) => {
              const uEmail = (u.email || "").toLowerCase();
              const uName = (u.name || "").toLowerCase();
              return uName === prefix || uEmail.startsWith(prefix + "@");
            });

            if (matchedDoc?.email) {
              candidateEmails.push(matchedDoc.email);
            }
            candidateEmails.push(`${prefix}@totalbeauty.com`);
            candidateEmails.push(`${prefix}@totalbeautysalon.com.mx`);
          }

          // 3. Autenticar directamente contra Firebase Authentication (Identity Toolkit API)
          const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
          let authData: any = null;
          let successfulEmail = "";

          for (const email of candidateEmails) {
            console.log(`[AUTH] Verificando credenciales en Firebase para: ${email}`);
            const authRes = await fetch(authUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
              })
            });

            const data = await authRes.json();
            if (authRes.ok && data?.idToken) {
              authData = data;
              successfulEmail = email;
              console.log(`[AUTH] ¡Login exitoso en Firebase! Correo autenticado: ${email} (UID: ${data.localId})`);
              break;
            } else {
              console.log(`[AUTH] Intento fallido para ${email}:`, data?.error?.message || "Error desconocido");
            }
          }

          if (!authData || !authData.idToken) {
            console.error("[AUTH] No se pudo autenticar con ningún correo candidato en Firebase.");
            return null;
          }

          // 4. Buscar documento correspondiente en Firestore (por UID o email)
          const matchedUserDoc = users.find((u: any) => {
            const uEmail = (u.email || "").toLowerCase();
            return (
              u.id === authData.localId ||
              uEmail === successfulEmail.toLowerCase() ||
              uEmail === rawInput.toLowerCase()
            );
          });

          // 5. Determinar rol (admin vs trabajadora)
          const rawRole = (matchedUserDoc?.role || "").toLowerCase();
          const isAdmin = 
            rawRole.includes("geren") || 
            rawRole === "admin" || 
            successfulEmail.toLowerCase().includes("gerencia") ||
            rawInput.toLowerCase().includes("gerencia") ||
            rawInput.toLowerCase().includes("francisco");

          const role = isAdmin ? "admin" : "trabajadora";

          // 6. Determinar nombre a mostrar
          let name = matchedUserDoc?.name || "";
          const lowerEmail = successfulEmail.toLowerCase();
          if (!name) {
            if (isAdmin) {
              name = "Gerencia";
            } else if (lowerEmail.includes("kentia")) {
              name = "Kentia";
            } else if (lowerEmail.includes("arizbeth")) {
              name = "Arizbeth";
            } else if (lowerEmail.includes("jessica")) {
              name = "Jessica";
            } else {
              name = successfulEmail.split("@")[0];
            }
          }

          // 7. Determinar ID de trabajadora para asistencias (1=Kentia, 2=Arizbeth, 3=Jessica, 4=Gerencia)
          const lowerName = name.toLowerCase();
          let workerId = WORKERS_MAP[lowerName];
          if (!workerId) {
            if (lowerEmail.includes("kentia") || lowerName.includes("kentia")) workerId = "1";
            else if (lowerEmail.includes("arizbeth") || lowerName.includes("arizbeth")) workerId = "2";
            else if (lowerEmail.includes("jessica") || lowerName.includes("jessica")) workerId = "3";
            else if (isAdmin) workerId = "4";
            else workerId = matchedUserDoc?.id || authData.localId;
          }

          return {
            id: workerId,
            name,
            email: successfulEmail,
            role,
            permissions: matchedUserDoc?.permissions || null
          };
        } catch (error) {
          console.error("Error crítico durante autenticación:", error);
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

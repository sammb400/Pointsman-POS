import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { 
  User,
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Use your configured firebase instances

interface SignupData {
  email: string;
  password: string;
  businessName: string;
  phoneNumber: string;
}

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  loading: boolean;
  signup: (data: SignupData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup({ email, password, businessName, phoneNumber }: SignupData) {
    // 1. Create the user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Save additional user data to Cloud Firestore
    // We use the user's UID as the document ID for easy lookup
    await setDoc(doc(db, "businesses", user.uid), {
      uid: user.uid,
      email: user.email,
      businessName: businessName,
      phoneNumber: phoneNumber,
      createdAt: new Date(),
      role: 'cashier' // The first user to sign up is the owner/admin
    });
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "businesses", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
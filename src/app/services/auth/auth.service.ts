import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { ref } from '@angular/fire/storage';
import { getDownloadURL, Storage, uploadBytes } from '@angular/fire/storage';
import { from, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private storage: Storage) {}

  isAuthenticated(): boolean {
    const authUser = user(this.auth);
    return !!authUser;
  }

  register(email: string, password: string): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      map((userCredential: UserCredential) => {
        this.setUserData(userCredential.user);
        return userCredential.user;
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential: UserCredential) => {
        this.setUserData(userCredential.user);
        return userCredential.user;
      })
    );
  }

  googleSignIn(): Observable<User> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      map((userCredential: UserCredential) => {
        this.setUserData(userCredential.user);
        return userCredential.user;
      })
    );
  }

  logout(): Observable<void> {
    this.clearUserData();
    return from(signOut(this.auth));
  }

  private clearUserData() {
    localStorage.removeItem('userData');
  }

  getCurrentUser(): Observable<User | null> {
    const user = this.auth.currentUser;
    if (user) {
      this.setUserData(user);
    }
    return of(user);
  }

  getUserData() {
    const storedUser = localStorage.getItem('userData');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  setUserData(user: User | null) {
    if (user) {
      const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }

  uploadProfilePicture(file: File, user: User): Observable<string> {
    const filePath = `profilePictures/${user.uid}/${file.name}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, file)).pipe(
      switchMap(() => getDownloadURL(storageRef)),
      map((photoURL) => {
        updateProfile(user, { photoURL });
        this.setUserData(user);
        return photoURL;
      })
    );
  }

  updateUserProfile(
    user: User,
    displayName: string,
    photoURL?: string
  ): Observable<void> {
    return from(updateProfile(user, { displayName, photoURL })).pipe(
      map(() => {
        this.setUserData(user);
      })
    );
  }
}

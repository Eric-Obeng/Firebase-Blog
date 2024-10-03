import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Post } from '../../model/post';
import { Observable, from, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private postCollection = collection(this.firestore, 'post');

  constructor(private firestore: Firestore, private authService: AuthService) {}

  async createPost(post: Post): Promise<string> {
    const newDoc = doc(this.postCollection);
    const id = newDoc.id;

    const postData: Post = {
      ...post,
      id,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
    };

    await setDoc(newDoc, postData);
    return id;
  }

  getPosts(): Observable<Post[]> {
    return collectionData(this.postCollection, { idField: 'id' }) as Observable<
      Post[]
    >;
  }

  getPostById(postId: string): Observable<Post | undefined> {
    const postDoc = doc(this.postCollection, postId);
    return from(getDoc(postDoc)).pipe(
      map((docSnap) =>
        docSnap.exists()
          ? ({ id: docSnap.id, ...docSnap.data() } as Post)
          : undefined
      )
    );
  }

  async updatePost(postId: string, post: Partial<Post>): Promise<void> {
    const postDoc = doc(this.postCollection, postId);
    const updateData = {
      ...post,
      updatedAt: new Date(),
    };
    await updateDoc(postDoc, updateData);
  }

  async deletePost(postId: string): Promise<void> {
    const postDoc = doc(this.postCollection, postId);
    await deleteDoc(postDoc);
  }
}

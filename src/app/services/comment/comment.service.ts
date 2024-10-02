import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  collectionData,
  deleteDoc,
  updateDoc,
  getDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Comment } from '../../model/comment';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private firestore: Firestore) {}

  private filterUndefinedFields(obj: Partial<Comment>): Partial<Comment> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
  }

  async addComment(postId: string, comment: Comment): Promise<string> {
    const postCommentsCollection = collection(
      this.firestore,
      `post/${postId}/comments`
    );
    const newCommentDoc = doc(postCommentsCollection);
    const commentId = newCommentDoc.id;

    const commentData: Comment = {
      ...comment,
      id: commentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(newCommentDoc, this.filterUndefinedFields(commentData));
    return commentId;
  }

  getComments(postId: string): Observable<Comment[]> {
    const commentCollection = collection(
      this.firestore,
      `post/${postId}/comments`
    );
    return collectionData(commentCollection, { idField: 'id' }) as Observable<
      Comment[]
    >;
  }

  getCommentById(
    postId: string,
    commentId: string
  ): Observable<Comment | undefined> {
    const commentDoc = doc(
      this.firestore,
      `post/${postId}/comments/${commentId}`
    );
    return from(getDoc(commentDoc)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as {
            content: string; // Assuming content is of type string
            author: string; // Assuming author is of type string
            createdAt: Timestamp; // Should be of type Timestamp
            updatedAt?: Timestamp; // Optional
          };

          return {
            id: docSnap.id,
            content: data.content,
            author: data.author,
            createdAt: data.createdAt.toDate(), // Convert Timestamp to Date
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined, // Handle optional property
          } as Comment;
        }
        return undefined;
      })
    );
  }

  async updateComment(
    postId: string,
    commentId: string,
    comment: Partial<Comment>
  ): Promise<void> {
    const commentDoc = doc(
      this.firestore,
      `post/${postId}/comments/${commentId}`
    );

    // Always update the updatedAt field
    await updateDoc(commentDoc, {
      ...this.filterUndefinedFields({ ...comment, updatedAt: new Date() }),
    });
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const commentDoc = doc(
      this.firestore,
      `post/${postId}/comments/${commentId}`
    );
    await deleteDoc(commentDoc);
  }
}

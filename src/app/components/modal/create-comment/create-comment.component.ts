import { Component, Input, OnInit } from '@angular/core';
import { CommentService } from '../../../services/comment/comment.service';
import { Comment } from '../../../model/comment';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth, user } from '@angular/fire/auth';
import { switchMap, take } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-comment',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-comment.component.html',
  styleUrls: ['./create-comment.component.scss'],
})
export class CreateCommentComponent implements OnInit {
  @Input() postId!: string;
  @Input() isEditMode: boolean = false;
  @Input() commentId!: string;

  commentForm!: FormGroup;
  displayName: string | null = '';

  constructor(
    private commentService: CommentService,
    private fb: FormBuilder,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setAuthorName();

    if (this.isEditMode && this.commentId) {
      this.loadCommentData();
    }
  }

  private initializeForm() {
    this.commentForm = this.fb.group({
      content: ['', Validators.required],
      author: [{ value: '', disabled: true }, Validators.required],
    });
  }

  private setAuthorName(): void {
    user(this.auth)
      .pipe(
        take(1), // Unsubscribe after one emission
        switchMap((authUser) => {
          if (authUser && authUser.displayName) {
            this.displayName = authUser.displayName;
            this.commentForm.patchValue({
              author: this.displayName,
            });
          }
          return []; // Return empty observable
        })
      )
      .subscribe();
  }

  private loadCommentData(): void {
    this.commentService
      .getCommentById(this.postId, this.commentId)
      .subscribe((comment) => {
        if (comment) {
          this.commentForm.patchValue({
            content: comment.content,
            // The author field is disabled and should retain the display name
            author: this.displayName, // Set author to the current user's display name
          });
        }
      });
  }

  submit(): void {
    if (this.commentForm.invalid) return;

    const commentData: Comment = {
      ...this.commentForm.getRawValue(),
      createdAt: new Date(),
      // Only set updatedAt if in edit mode
      updatedAt: this.isEditMode ? new Date() : undefined,
    };

    if (this.isEditMode && this.commentId) {
      this.commentService.updateComment(
        this.postId,
        this.commentId,
        commentData
      );
    } else {
      this.commentService.addComment(this.postId, commentData);
    }

    this.commentForm.reset();
  }
}

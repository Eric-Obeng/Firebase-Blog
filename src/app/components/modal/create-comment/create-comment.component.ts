import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Input() commentId: string | null = null;
  @Output() closeForm = new EventEmitter<void>();

  commentForm!: FormGroup;
  displayName: string | null = '';
  authorId: string | null = null;

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
        take(1),
        switchMap((authUser) => {
          if (authUser && authUser.displayName) {
            this.displayName = authUser.displayName;
            this.authorId = authUser.uid;
            this.commentForm.patchValue({
              author: this.displayName,
            });
          }
          return [];
        })
      )
      .subscribe();
  }

  private loadCommentData(): void {
    this.commentService
      .getCommentById(this.postId, this.commentId!)
      .subscribe((comment) => {
        if (comment) {
          this.commentForm.patchValue({
            content: comment.content,
            author: this.displayName,
          });
        }
      });
  }

  submit(): void {
    if (this.commentForm.invalid) return;

    const commentData: Comment = {
      ...this.commentForm.getRawValue(),
      authorId: this.authorId,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: this.isEditMode ? new Date().toLocaleDateString() : undefined,
    };

    if (this.isEditMode && this.commentId) {
      this.commentService.updateComment(
        this.postId,
        this.commentId,
        commentData
      );
      this.closeForm.emit();
    } else {
      this.commentService.addComment(this.postId, commentData);
      this.closeForm.emit();
    }

    this.commentForm.reset();
  }
}

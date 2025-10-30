import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { Admin } from '../../services/admin';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-test',
  imports: [SharedModule],
  templateUrl: './view-test.html',
  styleUrl: './view-test.css',
})
export class ViewTest {

  questions: any[] = [];
  testData: any = {};
  testId: any;
  isLoading = false;

  constructor(private admin: Admin,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.testId = params.get('id');
      this.loadTestDetails();
    });
  }

  loadTestDetails() {
    this.isLoading = true;
    this.admin.getTestQuestions(this.testId).subscribe({
      next: (res) => {
        this.questions = res.questions || [];
        this.testData = res.testDTO || {};
        this.isLoading = false;
        console.log('Test details:', res);
      },
      error: (error) => {
        console.error('Error loading test details:', error);
        this.isLoading = false;
      }
    });
  }

  getFormattedTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} min ${seconds} sec`;
  }

  trackByQuestionId(index: number, question: any): number {
    return question.id;
  }
}

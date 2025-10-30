import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared-module';
import { Test } from '../../services/test';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-view-my-test-results',
  imports: [SharedModule, RouterModule, NzTagModule],
  templateUrl: './view-my-test-results.html',
  styleUrl: './view-my-test-results.css',
})
export class ViewMyTestResults {

  dataSet: any[] = [];
  isLoading = false;
  
  constructor(private testService: Test) { }

  ngOnInit() {
    this.getTestResults();
  }

  getTestResults() {
    this.isLoading = true;
    this.testService.getMyTestResults().subscribe({
      next: (res) => {
        this.dataSet = res || [];
        this.isLoading = false;
        console.log('Test results:', this.dataSet);
      },
      error: (error) => {
        console.error('Error loading test results:', error);
        this.dataSet = [];
        this.isLoading = false;
      }
    });
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 80) return '#52c41a'; // Green
    if (percentage >= 60) return '#faad14'; // Orange
    return '#ff4d4f'; // Red
  }

  getGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  getAverageScore(): string {
    if (this.dataSet.length === 0) return '0%';
    
    const total = this.dataSet.reduce((sum, result) => sum + (result.percentage || 0), 0);
    const average = total / this.dataSet.length;
    return `${Math.round(average)}%`;
  }

  getPassedTests(): number {
    return this.dataSet.filter(result => (result.percentage || 0) >= 60).length;
  }
}

import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { Admin } from '../../services/admin';

@Component({
  selector: 'app-view-test-results',
  imports: [SharedModule],
  templateUrl: './view-test-results.html',
  styleUrl: './view-test-results.css',
})
export class ViewTestResults {

  resultsData: any[] = [];
  isLoading = false;
  
  constructor(private testservice: Admin) { }

  ngOnInit() {
    this.getTestResults();
  }

  getTestResults() {
    this.isLoading = true;
    this.testservice.getTestResults().subscribe({
      next: (res) => {
        this.resultsData = res || [];
        this.isLoading = false;
        console.log('Test results for current admin:', this.resultsData);
      },
      error: (error) => {
        console.error('Error loading test results:', error);
        this.resultsData = [];
        this.isLoading = false;
        
        // You might want to show an error message to the user
        if (error.message && error.message.includes('Admin user ID not found')) {
          console.error('Admin authentication required');
        } else if (error.status === 403) {
          console.error('Access denied - can only view own test results');
        }
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

  getAverageScore(): number {
    if (this.resultsData.length === 0) return 0;
    
    const total = this.resultsData.reduce((sum, result) => sum + (result.percentage || 0), 0);
    return Math.round(total / this.resultsData.length);
  }

  getPassedCount(): number {
    // Count unique students who have at least one passing score (>= 60%)
    // This ensures we don't count the same student multiple times
    const passedStudents = new Set<string>();
    
    this.resultsData.forEach(result => {
      if ((result.percentage || 0) >= 60 && result.userName) {
        passedStudents.add(result.userName);
      }
    });
    
    return passedStudents.size;
  }

  getUniqueStudents(): number {
    // Count total unique students who took the test (regardless of pass/fail)
    const uniqueUsers = new Set(this.resultsData.map(result => result.userName).filter(name => name));
    return uniqueUsers.size;
  }

  getTotalAttempts(): number {
    return this.resultsData.length;
  }

  getFailedCount(): number {
    // Count unique students who have NO passing scores (all attempts < 60%)
    const allStudents = new Set(this.resultsData.map(result => result.userName).filter(name => name));
    const passedStudents = new Set<string>();
    
    this.resultsData.forEach(result => {
      if ((result.percentage || 0) >= 60 && result.userName) {
        passedStudents.add(result.userName);
      }
    });
    
    return allStudents.size - passedStudents.size;
  }
}

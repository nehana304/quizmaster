import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Admin } from '../../services/admin';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-leaderboard',
  imports: [SharedModule],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.css'],
})
export class Leaderboard {
  testId: number = 0;
  testDetails: any = null;
  leaderboardData: any[] = [];
  isLoading = false;

  constructor(
    private notification: NzNotificationService,
    private adminService: Admin,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.testId = +params['id'];
      console.log('Leaderboard initialized with test ID:', this.testId);
      if (this.testId) {
        this.loadLeaderboard();
      } else {
        console.error('No test ID provided to leaderboard');
        this.notification.error('Error', 'No test ID provided', {
          nzDuration: 5000
        });
      }
    });
  }

  loadLeaderboard() {
    this.isLoading = true;
    console.log('Loading leaderboard for test ID:', this.testId);
    
    this.adminService.getTestResults().subscribe({
      next: (results) => {
        console.log('All test results received:', results);
        console.log('Looking for results with testId:', this.testId);
        
        // Filter results for this specific test and sort by score
        const filteredResults = results.filter(result => {
          console.log('Checking result:', result, 'testId:', result.testId, 'matches:', result.testId === this.testId);
          return result.testId === this.testId;
        });
        
        console.log('Filtered results for this test:', filteredResults);
        
        this.leaderboardData = filteredResults
          .sort((a, b) => b.percentage - a.percentage)
          .map((result, index) => ({
            ...result,
            rank: index + 1,
            badge: this.getBadge(index + 1)
          }));
        
        console.log('Final leaderboard data:', this.leaderboardData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        this.isLoading = false;
        this.leaderboardData = [];
        this.notification.error('Error', 'Failed to load leaderboard data', {
          nzDuration: 5000
        });
      }
    });
  }

  getBadge(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 75) return '#1890ff';
    if (percentage >= 60) return '#faad14';
    return '#ff4d4f';
  }

  exportLeaderboard() {
    if (this.leaderboardData.length === 0) {
      this.notification.warning('No Data', 'No results to export', {
        nzDuration: 3000
      });
      return;
    }
    
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-test-${this.testId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Debug method to show all test results
  showAllResults() {
    this.isLoading = true;
    this.adminService.getTestResults().subscribe({
      next: (results) => {
        console.log('All test results in database:', results);
        
        // Show detailed breakdown
        const testGroups = results.reduce((groups, result) => {
          const testId = result.testId || 'unknown';
          if (!groups[testId]) {
            groups[testId] = [];
          }
          groups[testId].push(result);
          return groups;
        }, {});
        
        console.log('Results grouped by test ID:', testGroups);
        
        let message = `Found ${results.length} total test results.\n`;
        Object.keys(testGroups).forEach(testId => {
          message += `Test ${testId}: ${testGroups[testId].length} results\n`;
        });
        
        this.notification.info('Debug Info', message, {
          nzDuration: 8000
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading all results:', error);
        this.notification.error('Error', 'Failed to load test results for debugging', {
          nzDuration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  // Method to create sample data for testing
  createSampleData() {
    this.notification.info('Sample Data', 'This would create sample leaderboard data. For now, check if any tests have been completed by users.', {
      nzDuration: 5000
    });
  }

  private generateCSV(): string {
    const headers = ['Rank', 'Student Name', 'Score (%)', 'Correct Answers', 'Total Questions', 'Time Taken'];
    const rows = this.leaderboardData.map(item => [
      item.rank,
      item.userName || 'Unknown',
      item.percentage,
      item.correctAnswers,
      item.totalQuestions,
      item.timeTaken || 'N/A'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
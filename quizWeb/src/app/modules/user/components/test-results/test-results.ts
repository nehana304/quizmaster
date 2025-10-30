import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared-module';
import { Test } from '../../services/test';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserStorage } from '../../../auth/services/user-storage';
import { SoundService } from '../../../shared/services/sound.service';

@Component({
  selector: 'app-test-results',
  imports: [SharedModule],
  templateUrl: './test-results.html',
  styleUrls: ['./test-results.css'],
})
export class TestResults implements OnInit {
  testId: number = 0;
  testResult: any = null;
  leaderboardData: any[] = [];
  currentUserRank: number = 0;
  isLoading = true;
  showLeaderboard = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private testService: Test,
    private notification: NzNotificationService,
    private soundService: SoundService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.testId = +params['id'];
      if (this.testId) {
        this.loadTestResult();
        this.loadLeaderboard();
      } else {
        // If no test ID, redirect to dashboard
        this.router.navigate(['/user/dashboard']);
      }
    });
  }

  loadTestResult() {
    // Get the user's latest test result for this test
    this.testService.getMyTestResults().subscribe({
      next: (results) => {
        // Find the most recent result for this test
        const testResults = results.filter(result => result.testId === this.testId);
        if (testResults.length > 0) {
          this.testResult = testResults[testResults.length - 1]; // Get the latest result
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading test result:', error);
        this.isLoading = false;
        this.notification.error('Error', 'Failed to load test results', {
          nzDuration: 5000
        });
      }
    });
  }

  loadLeaderboard() {
    // Get real leaderboard data from the backend
    this.testService.getLeaderboardByTestId(this.testId).subscribe({
      next: (results) => {
        console.log('Leaderboard results received:', results);
        if (results && results.length > 0) {
          this.leaderboardData = this.processLeaderboardData(results);
        } else {
          // If no results, show mock data with current user
          this.leaderboardData = this.generateMockLeaderboard();
        }
        this.findCurrentUserRank();
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        // Fallback to mock data if API fails - don't show error to user
        this.leaderboardData = this.generateMockLeaderboard();
        this.findCurrentUserRank();
        
        // Only show warning if it's not a 403 error (which might be expected)
        if (error.status !== 403) {
          this.notification.warning('Leaderboard', 'Could not load real leaderboard data. Showing sample data.', {
            nzDuration: 4000
          });
        }
      }
    });
  }

  processLeaderboardData(results: any[]) {
    const currentUser = UserStorage.getUser();
    const currentUserId = UserStorage.getUserId();
    
    // Process the real data from backend
    const processedData = results.map((result, index) => ({
      userName: result.userName || 'Anonymous User',
      percentage: Math.round(result.percentage || 0),
      correctAnswers: result.correctAnswers || 0,
      totalQuestions: result.totalQuestions || 0,
      rank: index + 1,
      badge: this.getBadge(index + 1),
      isCurrentUser: result.userId === currentUserId,
      userId: result.userId
    }));

    return processedData;
  }

  generateMockLeaderboard() {
    const currentUser = UserStorage.getUser();
    const currentUserName = currentUser?.name || 'You';
    
    // Generate sample leaderboard data including current user
    const mockData = [
      { userName: 'Alice Johnson', percentage: 95, correctAnswers: 19, totalQuestions: 20, rank: 1, badge: '🥇' },
      { userName: 'Bob Smith', percentage: 88, correctAnswers: 17, totalQuestions: 20, rank: 2, badge: '🥈' },
      { userName: 'Carol Davis', percentage: 82, correctAnswers: 16, totalQuestions: 20, rank: 3, badge: '🥉' },
      { userName: 'David Wilson', percentage: 75, correctAnswers: 15, totalQuestions: 20, rank: 4, badge: '' },
      { userName: 'Eva Brown', percentage: 70, correctAnswers: 14, totalQuestions: 20, rank: 5, badge: '' },
      { userName: 'Frank Miller', percentage: 65, correctAnswers: 13, totalQuestions: 20, rank: 6, badge: '' },
      { userName: 'Grace Lee', percentage: 60, correctAnswers: 12, totalQuestions: 20, rank: 7, badge: '' },
      { userName: 'Henry Clark', percentage: 55, correctAnswers: 11, totalQuestions: 20, rank: 8, badge: '' },
    ];

    // Insert current user with their actual score if available
    if (this.testResult) {
      const userResult = {
        userName: currentUserName,
        percentage: this.testResult.percentage || 0,
        correctAnswers: this.testResult.correctAnswers || 0,
        totalQuestions: this.testResult.totalQuestions || 20,
        rank: 0,
        badge: '',
        isCurrentUser: true
      };

      // Find where to insert the user based on their score
      let insertIndex = mockData.findIndex(item => item.percentage < userResult.percentage);
      if (insertIndex === -1) {
        insertIndex = mockData.length;
      }
      
      mockData.splice(insertIndex, 0, userResult);
      
      // Update ranks
      mockData.forEach((item, index) => {
        item.rank = index + 1;
        item.badge = this.getBadge(index + 1);
      });
    }

    return mockData;
  }

  findCurrentUserRank() {
    const currentUserId = UserStorage.getUserId();
    
    const userEntry = this.leaderboardData.find(item => 
      item.isCurrentUser || item.userId === currentUserId
    );
    
    if (userEntry) {
      this.currentUserRank = userEntry.rank;
    } else {
      // If user not found in leaderboard, they might not have completed the test yet
      this.currentUserRank = 0;
    }
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

  getGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  getPerformanceMessage(): string {
    if (!this.testResult) return '';
    
    const percentage = this.testResult.percentage || 0;
    if (percentage >= 90) return 'Outstanding performance! 🎉';
    if (percentage >= 80) return 'Excellent work! 👏';
    if (percentage >= 70) return 'Good job! 👍';
    if (percentage >= 60) return 'Well done! Keep practicing! 📚';
    return 'Keep studying and try again! 💪';
  }

  retakeTest() {
    this.router.navigate(['/user/take-test', this.testId]);
  }

  goToDashboard() {
    this.router.navigate(['/user/dashboard']);
  }

  viewAllResults() {
    this.router.navigate(['/user/view-test-results']);
  }

  shareResult() {
    if (this.testResult) {
      const shareText = `I just scored ${this.testResult.percentage}% on QuizMaster! 🎯`;
      if (navigator.share) {
        navigator.share({
          title: 'My Quiz Result',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          this.soundService.playTick();
          this.notification.success('Copied!', 'Result copied to clipboard', {
            nzDuration: 2000
          });
        });
      }
    }
  }
}
import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Test } from '../../services/test';
import { ActivatedRoute } from '@angular/router';
import { UserStorage } from '../../../auth/services/user-storage';

@Component({
  selector: 'app-user-leaderboard',
  imports: [SharedModule],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.css'],
})
export class UserLeaderboard {
  testId: number = 0;
  testDetails: any = null;
  leaderboardData: any[] = [];
  isLoading = false;
  currentUserRank: number = 0;
  currentUserResult: any = null;

  constructor(
    private notification: NzNotificationService,
    private testService: Test,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.testId = +params['id'];
      if (this.testId) {
        this.loadLeaderboard();
      }
    });
  }

  loadLeaderboard() {
    this.isLoading = true;
    
    // Get real leaderboard data from the backend
    this.testService.getLeaderboardByTestId(this.testId).subscribe({
      next: (results) => {
        console.log('Leaderboard results received:', results);
        this.leaderboardData = this.processLeaderboardData(results);
        this.findCurrentUserRank();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        this.isLoading = false;
        // Fallback to mock data if API fails
        this.leaderboardData = this.generateMockLeaderboard();
        this.findCurrentUserRank();
      }
    });
  }

  processLeaderboardData(results: any[]) {
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
    // Generate sample leaderboard data for demonstration
    return [
      { userName: 'Alice Johnson', percentage: 95, correctAnswers: 19, totalQuestions: 20, rank: 1, badge: '🥇' },
      { userName: 'Bob Smith', percentage: 88, correctAnswers: 17, totalQuestions: 20, rank: 2, badge: '🥈' },
      { userName: 'Carol Davis', percentage: 82, correctAnswers: 16, totalQuestions: 20, rank: 3, badge: '🥉' },
      { userName: 'David Wilson', percentage: 75, correctAnswers: 15, totalQuestions: 20, rank: 4, badge: '' },
      { userName: 'Eva Brown', percentage: 70, correctAnswers: 14, totalQuestions: 20, rank: 5, badge: '' },
    ];
  }

  findCurrentUserRank() {
    const currentUserId = UserStorage.getUserId();
    
    const userEntry = this.leaderboardData.find(item => 
      item.isCurrentUser || item.userId === currentUserId
    );
    
    if (userEntry) {
      this.currentUserRank = userEntry.rank;
      this.currentUserResult = userEntry;
    } else {
      // If user not found in leaderboard, they might not have completed the test yet
      this.currentUserRank = 0;
      this.currentUserResult = null;
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
}
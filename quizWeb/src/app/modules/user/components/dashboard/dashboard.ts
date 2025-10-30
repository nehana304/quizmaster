import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Test } from '../../services/test';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { UserStorage } from '../../../auth/services/user-storage';
import { SoundService } from '../../../shared/services/sound.service';
import { CourseAds } from '../course-ads/course-ads';

@Component({
  selector: 'app-dashboard',
  imports: [SharedModule, FormsModule, RouterModule, CourseAds],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnDestroy {
  tests: any[] | null = null;
  userTestResults: any[] = [];
  isLoading = false;
  searchTerm = '';
  filteredTests: any[] = [];
  statsLoading = false;
  testCode = '';
  isJoining = false;
  showAvailableTests = false; // Hide available tests by default
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private notification: NzNotificationService,
    private testService: Test,
    private router: Router,
    private soundService: SoundService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Don't automatically load tests anymore
    this.getUserTestResults();
    this.setupSearchDebounce();
    
    // Initialize stats after a short delay to avoid change detection issues
    setTimeout(() => {
      this.initializeStats();
    }, 0);
  }

  private initializeStats(): void {
    // Pre-calculate the stats to avoid change detection issues
    this.getTotalPoints();
    this.getBestScore();
    this.cdr.detectChanges();
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateFilteredTests();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAllTests() {
    this.isLoading = true;
    this.testService.getAllTest().subscribe({
      next: (res) => {
        this.tests = res || [];
        this.updateFilteredTests();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.tests = [];
        this.filteredTests = [];
        
        if (error.status === 403) {
          this.notification.error('Authentication Error', 'Your session has expired. Please login again.', {
            nzDuration: 5000
          });
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.notification.error('Error', 'Failed to load tests', {
            nzDuration: 5000
          });
        }
      }
    });
  }

  getFormattedTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} min ${seconds} sec`;
  }

  startTest(testId: number) {
    this.router.navigate(['/user/take-test', testId]);
  }

  trackByTestId(index: number, test: any): number {
    return test.id;
  }

  getDifficultyLevel(test: any): string {
    // You can implement logic to determine difficulty based on test properties
    // For now, returning a default value
    const questionCount = test.questions?.length || 0;
    if (questionCount <= 5) return 'easy';
    if (questionCount <= 10) return 'medium';
    return 'hard';
  }

  // Get user test results for statistics
  getUserTestResults() {
    this.statsLoading = true;
    this.testService.getMyTestResults().subscribe({
      next: (res) => {
        this.userTestResults = res || [];
        this.statsLoading = false;
        // Reset cached values when data changes
        this._cachedTotalPoints = null;
        this._cachedBestScore = null;
        this.updateCachedStats();
      },
      error: (error) => {
        console.error('Error loading user test results:', error);
        this.userTestResults = [];
        this.statsLoading = false;
        // Reset cached values on error too
        this._cachedTotalPoints = null;
        this._cachedBestScore = null;
        this.updateCachedStats();
      }
    });
  }

  private updateCachedStats(): void {
    // Pre-calculate all stats to avoid change detection issues
    this.getAvailableTestsCount();
    this.getCompletedTestsCount();
    this.getAverageScore();
    this.getTotalPoints();
    this.getBestScore();
    
    // Trigger change detection
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  // Cached stats to avoid change detection issues
  private _cachedStats = {
    availableTests: 0,
    completedTests: 0,
    averageScore: '0%',
    totalPoints: 0,
    bestScore: '0%'
  };

  private _cachedBestScore: string | null = null;

  // Stats methods - return actual counts based on real data
  getAvailableTestsCount(): number {
    const count = this.tests?.length || 0;
    this._cachedStats.availableTests = count;
    return count;
  }

  getCompletedTestsCount(): number {
    const count = this.userTestResults?.length || 0;
    this._cachedStats.completedTests = count;
    return count;
  }

  getAverageScore(): string {
    if (!this.userTestResults || this.userTestResults.length === 0) {
      this._cachedStats.averageScore = '0%';
      return '0%';
    }
    
    const totalPercentage = this.userTestResults.reduce((sum, result) => {
      return sum + (result.percentage || 0);
    }, 0);
    
    const average = totalPercentage / this.userTestResults.length;
    const scoreString = `${Math.round(average)}%`;
    this._cachedStats.averageScore = scoreString;
    return scoreString;
  }

  getBestScore(): string {
    // Return cached best score to avoid change detection issues
    if (this._cachedBestScore !== null) {
      return this._cachedBestScore;
    }

    if (!this.userTestResults || this.userTestResults.length === 0) {
      this._cachedBestScore = '0%';
      return '0%';
    }
    
    // Find the highest percentage score
    const bestPercentage = Math.max(...this.userTestResults.map(result => result.percentage || 0));
    const bestScoreString = `${Math.round(bestPercentage)}%`;
    
    this._cachedBestScore = bestScoreString;
    this._cachedStats.bestScore = bestScoreString;
    return bestScoreString;
  }

  private _cachedTotalPoints: number | null = null;

  getTotalPoints(): number {
    // Return cached points to avoid change detection issues
    if (this._cachedTotalPoints !== null) {
      return this._cachedTotalPoints;
    }

    if (!this.userTestResults || this.userTestResults.length === 0) {
      this._cachedTotalPoints = 0;
      return 0;
    }
    
    // Calculate total points based on correct answers
    const totalPoints = this.userTestResults.reduce((sum, result) => {
      return sum + (result.correctAnswers || 0);
    }, 0);
    
    this._cachedTotalPoints = totalPoints;
    return totalPoints;
  }

  viewDetailedStats(): void {
    this.soundService.playTick();
    
    const completedTests = this.getCompletedTestsCount();
    const totalPoints = this.getTotalPoints();
    const avgScore = this.getAverageScore();
    const bestScore = this.getBestScore();
    
    let message = `📊 Your Quiz Statistics:\n\n`;
    message += `✅ Tests Completed: ${completedTests}\n`;
    message += `🔥 Best Score: ${bestScore}\n`;
    message += `📈 Average Score: ${avgScore}\n`;
    message += `⭐ Total Points: ${totalPoints}\n`;
    
    if (completedTests > 0) {
      const avgPointsPerTest = Math.round(totalPoints / completedTests);
      message += `🎯 Average Points per Test: ${avgPointsPerTest}\n`;
      
      // Performance feedback based on best score
      const bestScoreNum = parseFloat(bestScore.replace('%', ''));
      if (bestScoreNum >= 95) {
        message += `\n🏆 Outstanding! You've achieved excellence!`;
      } else if (bestScoreNum >= 85) {
        message += `\n🌟 Excellent work! You're a top performer!`;
      } else if (bestScoreNum >= 75) {
        message += `\n👏 Great job! Keep pushing for higher scores!`;
      } else if (bestScoreNum >= 60) {
        message += `\n📚 Good progress! Aim for that 80%+ score!`;
      } else {
        message += `\n💪 Keep studying and you'll see improvement!`;
      }
    } else {
      message += `\n🚀 Take your first quiz to start earning points!`;
    }
    
    this.notification.info('Your Statistics', message, {
      nzDuration: 8000
    });
  }

  // Search functionality
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.updateFilteredTests();
  }

  onSearchButtonClick(): void {
    // Optional: Add any additional search logic here
    this.updateFilteredTests();
  }

  getFilteredTests(): any[] {
    if (!this.tests) return [];
    
    if (!this.searchTerm.trim()) {
      return this.tests;
    }

    const searchLower = this.searchTerm.toLowerCase();
    return this.tests.filter(test => 
      test.title?.toLowerCase().includes(searchLower) ||
      test.description?.toLowerCase().includes(searchLower) ||
      test.subject?.toLowerCase().includes(searchLower) // Add subject search if available
    );
  }

  private updateFilteredTests(): void {
    this.filteredTests = this.getFilteredTests();
  }

  joinTest() {
    if (!this.testCode.trim()) {
      this.notification.warning('Please enter a test code', 'Test code is required', {
        nzDuration: 3000
      });
      return;
    }

    const cleanTestCode = this.testCode.trim().toUpperCase();
    console.log('Attempting to join test with code:', cleanTestCode);
    
    this.isJoining = true;
    this.testService.getTestByCode(cleanTestCode).subscribe({
      next: (test) => {
        console.log('Test found:', test);
        console.log('User token:', UserStorage.getToken());
        console.log('User info:', UserStorage.getUser());
        this.isJoining = false;
        if (test && test.id) {
          this.soundService.playCorrect();
          this.notification.success('Test found!', `Joining "${test.title}"`, {
            nzDuration: 3000
          });
          // Navigate to the test
          this.router.navigate(['/user/take-test', test.id]);
        } else {
          this.notification.error('Test Not Found', 'Invalid test code or test not available', {
            nzDuration: 5000
          });
        }
      },
      error: (error) => {
        this.isJoining = false;
        console.error('Error joining test:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        
        if (error.status === 401 || error.status === 403) {
          this.notification.error('Authentication Error', 'Your session has expired. Please login again.', {
            nzDuration: 5000
          });
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 404) {
          this.soundService.playIncorrect();
          this.notification.error('Test Not Found', 'Invalid test code. Please check the code and try again.', {
            nzDuration: 5000
          });
        } else {
          this.soundService.playIncorrect();
          const errorMessage = error.error?.message || error.message || 'Invalid test code or test not available';
          this.notification.error('Error', errorMessage, {
            nzDuration: 5000
          });
        }
      }
    });
  }

  // Get search results count for display
  getSearchResultsText(): string {
    if (!this.searchTerm.trim()) {
      return `Showing all ${this.tests?.length || 0} tests`;
    }
    return `Found ${this.filteredTests.length} test(s) matching "${this.searchTerm}"`;
  }

  // Handle paste event for test code
  onTestCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    this.testCode = pastedText.trim().toUpperCase();
  }

  // Paste test code from clipboard
  async pasteTestCode(): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        this.testCode = text.trim().toUpperCase();
        this.soundService.playTick();
        this.notification.success('Pasted!', 'Test code pasted from clipboard', {
          nzDuration: 2000
        });
      } else {
        this.notification.warning('Not supported', 'Clipboard access not supported in this browser', {
          nzDuration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      this.soundService.playIncorrect();
      this.notification.error('Error', 'Failed to read from clipboard', {
        nzDuration: 3000
      });
    }
  }
}


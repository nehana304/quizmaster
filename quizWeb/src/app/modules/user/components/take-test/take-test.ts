import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Test } from '../../services/test';
import { UserStorage } from '../../../auth/services/user-storage';
import { SoundService } from '../../../shared/services/sound.service';

@Component({
  selector: 'app-take-test',
  imports: [SharedModule],
  templateUrl: './take-test.html',
  styleUrl: './take-test.css',
})
export class TakeTest implements OnInit, OnDestroy {

  questions: any[] = [];
  testId:any;

  selectedAnswers: { [key: number]: string } = {};
  
  // Pre-computed data for performance
  questionOptions: { [key: number]: Array<{letter: string, value: string}> } = {};
  currentQuestionIndex: number = 1;
  progressPercentage: number = 0;
  answeredCount: number = 0;

  timeRemaining: number = 0;
  timerInterval: any;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  isSoundMuted: boolean = false;

  constructor(private testService: Test,
    private activatedRoute: ActivatedRoute,
    private message: NzMessageService,
    private router: Router,
    private soundService: SoundService
  ) { }

  ngOnInit() {
    // Prevent accidental page refresh
    this.addBeforeUnloadListener();
    
    // Initialize sound state
    this.isSoundMuted = this.soundService.isSoundMuted();
    
    this.activatedRoute.paramMap.subscribe(params => {
      this.testId = params.get('id');

      this.testService.getTestQuestions(this.testId).subscribe({
        next: (res) => {
          this.questions = res.questions;
          console.log(this.questions);

          // Pre-compute question options for performance
          this.preComputeQuestionOptions();

          this.timeRemaining = res.testDTO.time || 0;
          this.isLoading = false;
          
          // Load any backup answers
          this.loadBackupAnswers();
          
          // Update computed values
          this.updateComputedValues();
          
          this.startTimer();
        },
        error: (error) => {
          console.error('Error loading test questions:', error);
          this.isLoading = false;
          this.message.error('Failed to load test questions. Please try again.', { nzDuration: 5000 });
          this.router.navigate(['/user/dashboard']);
        }
      });
    });
  }

  private addBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
      if (!this.isSubmitting && this.getAnsweredCount() > 0) {
        const message = 'You have unsaved answers. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
      return undefined;
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if(this.timeRemaining > 0) {
        this.timeRemaining--;
        
        // Show warnings at specific time intervals with sound effects
        if (this.timeRemaining === 300) { // 5 minutes
          this.soundService.playWarning();
          this.message.warning('5 minutes remaining!', { nzDuration: 3000 });
        } else if (this.timeRemaining === 60) { // 1 minute
          this.soundService.playWarning();
          this.message.error('1 minute remaining!', { nzDuration: 3000 });
        } else if (this.timeRemaining === 10) { // 10 seconds
          this.soundService.playWarning();
          this.message.error('10 seconds remaining!', { nzDuration: 2000 });
        }
        
        // Tick sound for last 10 seconds
        if (this.timeRemaining <= 10) {
          this.soundService.playTick();
        }
      } else {
        clearInterval(this.timerInterval);
        this.soundService.playWarning();
        this.message.error('Time is up! Submitting your test automatically.', { nzDuration: 3000 });
        this.submitAnswers();
      }
    }, 1000);
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  onAnswerChange(questionId: number, selectedOption: string) {
    console.log('Answer changed for question:', questionId, 'to:', selectedOption);
    this.selectedAnswers[questionId] = selectedOption;
    console.log('Current selected answers:', this.selectedAnswers);
    
    // Play sound effect for answer selection
    this.soundService.playTick();
    
    // Update computed values for performance
    this.updateComputedValues();
    
    // Auto-save answers as backup
    this.autoSaveAnswers();
    
    // Show progress feedback
    if (this.answeredCount === this.questions.length) {
      this.soundService.playCorrect();
      this.message.success('All questions answered! You can now submit your test.', { 
        nzDuration: 2000 
      });
    }
  }

  // Performance optimization methods
  private preComputeQuestionOptions(): void {
    this.questions.forEach(question => {
      this.questionOptions[question.id] = [
        { letter: 'A', value: question.optionA },
        { letter: 'B', value: question.optionB },
        { letter: 'C', value: question.optionC },
        { letter: 'D', value: question.optionD }
      ].filter(option => option.value && option.value.trim() !== '');
    });
  }

  private updateComputedValues(): void {
    this.answeredCount = Object.keys(this.selectedAnswers).length;
    this.currentQuestionIndex = Math.min(this.answeredCount + 1, this.questions.length);
    this.progressPercentage = this.questions.length > 0 ? (this.answeredCount / this.questions.length) * 100 : 0;
  }

  // Optimized getter methods (now just return pre-computed values)
  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  getProgressPercentage(): number {
    return this.progressPercentage;
  }

  getAnsweredCount(): number {
    return this.answeredCount;
  }

  getQuestionOptions(question: any): Array<{letter: string, value: string}> {
    return this.questionOptions[question.id] || [];
  }

  trackByQuestionId(index: number, question: any): number {
    return question.id;
  }

  trackByOption(index: number, option: any): string {
    return option.letter + option.value;
  }

  isOptionSelected(questionId: number, optionValue: string): boolean {
    return this.selectedAnswers[questionId] === optionValue;
  }

  reviewAnswers(): void {
    // Use pre-computed values for better performance
    const unansweredCount = this.questions.length - this.answeredCount;
    if (unansweredCount > 0) {
      this.message.info(`You have ${unansweredCount} unanswered questions remaining.`, {
        nzDuration: 3000
      });
      
      // Scroll to first unanswered question
      const firstUnansweredIndex = this.questions.findIndex(q => !this.selectedAnswers[q.id]);
      if (firstUnansweredIndex >= 0) {
        setTimeout(() => {
          const questionCards = document.querySelectorAll('.question-card');
          if (questionCards[firstUnansweredIndex]) {
            questionCards[firstUnansweredIndex].scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 100);
      }
    } else {
      this.message.success('All questions answered! Ready to submit.', {
        nzDuration: 3000
      });
      // Scroll to submit section
      setTimeout(() => {
        const submitSection = document.querySelector('.submit-section');
        if (submitSection) {
          submitSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }

  confirmSubmit(): void {
    const unansweredCount = this.questions.length - this.answeredCount;
    if (unansweredCount > 0) {
      this.message.warning(`You have ${unansweredCount} unanswered questions. They will be marked as incorrect.`, {
        nzDuration: 4000
      });
    }
    this.submitAnswers();
  }

  submitAnswers(){
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    const answerList = Object.keys(this.selectedAnswers).map(questionId => {
      return {
        questionId: +questionId,
        selectedOption: this.selectedAnswers[questionId]
      };
    })

    const data = {
      testId: this.testId,
      userId: UserStorage.getUserId(),
      responses: answerList
    }

    this.testService.submitTest(data).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.soundService.playComplete();
        this.message.success('Test submitted successfully! Redirecting to results and leaderboard...',
        { nzDuration: 3000 }
      );
      console.log('Test submission successful:', res);
      console.log('Navigating to test results with leaderboard...');
      // Navigate to results page with test ID for leaderboard
      setTimeout(() => {
        this.router.navigate(['/user/test-results', this.testId]).then(
          (success) => {
            console.log('Navigation success:', success);
            if (!success) {
              // Fallback navigation
              this.router.navigate(['/user/view-test-results']);
            }
          },
          (error) => {
            console.error('Navigation error:', error);
            // Fallback navigation
            this.router.navigate(['/user/view-test-results']);
          }
        );
      }, 1000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.soundService.playIncorrect();
        console.error('Test submission error:', error);
        
        let errorMessage = 'Failed to submit test. Please try again.';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.message.error(errorMessage, { nzDuration: 5000 });
      }
    })
  }

  // Toggle sound on/off
  toggleSound(): void {
    this.isSoundMuted = this.soundService.toggleMute();
    this.message.info(this.isSoundMuted ? 'Sound muted' : 'Sound enabled', { nzDuration: 2000 });
  }

  // Add keyboard shortcuts
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl/Cmd + Enter to submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (this.getAnsweredCount() === this.questions.length) {
        this.confirmSubmit();
      } else {
        this.reviewAnswers();
      }
    }
    
    // Escape to review answers
    if (event.key === 'Escape') {
      event.preventDefault();
      this.reviewAnswers();
    }
  }

  // Add auto-save functionality (optional)
  private autoSaveAnswers(): void {
    // This could save answers to localStorage as backup
    try {
      const saveData = {
        testId: this.testId,
        answers: this.selectedAnswers,
        timestamp: Date.now()
      };
      localStorage.setItem(`test_${this.testId}_backup`, JSON.stringify(saveData));
    } catch (error) {
      console.warn('Could not save answers to localStorage:', error);
    }
  }

  private loadBackupAnswers(): void {
    try {
      const backupData = localStorage.getItem(`test_${this.testId}_backup`);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        // Only load if backup is less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          this.selectedAnswers = parsed.answers || {};
        }
      }
    } catch (error) {
      console.warn('Could not load backup answers:', error);
    }
  }

  private clearBackupAnswers(): void {
    try {
      localStorage.removeItem(`test_${this.testId}_backup`);
    } catch (error) {
      console.warn('Could not clear backup answers:', error);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // Remove beforeunload listener
    window.removeEventListener('beforeunload', () => {});
    
    // Clear backup if test was submitted successfully
    if (this.isSubmitting) {
      this.clearBackupAnswers();
    }
  }
}

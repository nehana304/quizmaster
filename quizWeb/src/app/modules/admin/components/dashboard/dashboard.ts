import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Admin } from '../../../admin/services/admin';
import { SoundService } from '../../../shared/services/sound.service';
import { UserStorage } from '../../../auth/services/user-storage';

@Component({
  selector: 'app-dashboard',
  imports: [SharedModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {

  tests = [];
  isLoading = false;

  constructor(private notification: NzNotificationService,
    private message: NzMessageService,
    private testService: Admin,
    private soundService: SoundService
  ) { }

  ngOnInit() {
    this.getAllTests();
  }

  getAllTests() {
    this.isLoading = true;
    this.testService.getAllTestsForAdmin().subscribe({
      next: (res) => {
        this.tests = res || [];
        console.log('Admin tests loaded for current user:', this.tests);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading admin tests:', error);
        this.isLoading = false;
        
        let errorMessage = 'Failed to load tests';
        if (error.message && error.message.includes('Admin user ID not found')) {
          errorMessage = 'Please log in again to access your tests';
        } else if (error.status === 403) {
          errorMessage = 'Access denied. You can only view your own tests.';
        } else if (error.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        }
        
        this.notification.error('Error', errorMessage, {
          nzDuration: 5000
        });
      }
    });
  }

  cancelTest(testId: number) {
    this.testService.cancelTest(testId).subscribe({
      next: (res) => {
        this.soundService.playCorrect();
        this.notification.success('Success', 'Test cancelled successfully. Results have been preserved.', {
          nzDuration: 4000
        });
        this.getAllTests(); // Refresh the list
      },
      error: (error) => {
        this.soundService.playIncorrect();
        
        let errorMessage = 'Failed to cancel test';
        if (error.status === 403) {
          errorMessage = 'Access denied. You can only cancel your own tests.';
        } else if (error.status === 404) {
          errorMessage = 'Test not found or you do not have permission to cancel it.';
        } else if (error.message && error.message.includes('Admin user ID not found')) {
          errorMessage = 'Please log in again to perform this action.';
        }
        
        this.notification.error('Error', errorMessage, {
          nzDuration: 5000
        });
      }
    });
  }

  activateTest(testId: number) {
    this.testService.activateTest(testId).subscribe({
      next: (res) => {
        this.soundService.playCorrect();
        this.notification.success('Success', 'Test activated successfully', {
          nzDuration: 3000
        });
        this.getAllTests(); // Refresh the list
      },
      error: (error) => {
        this.soundService.playIncorrect();
        
        let errorMessage = 'Failed to activate test';
        if (error.status === 403) {
          errorMessage = 'Access denied. You can only activate your own tests.';
        } else if (error.status === 404) {
          errorMessage = 'Test not found or you do not have permission to activate it.';
        } else if (error.message && error.message.includes('Admin user ID not found')) {
          errorMessage = 'Please log in again to perform this action.';
        }
        
        this.notification.error('Error', errorMessage, {
          nzDuration: 5000
        });
      }
    });
  }

  permanentlyRemoveTest(testId: number) {
    // Find the test to check its status
    const test = this.tests.find(t => t.id === testId);
    if (!test) {
      this.notification.error('Error', 'Test not found in current list', {
        nzDuration: 3000
      });
      return;
    }
    
    if (test.status !== 'CANCELLED') {
      this.notification.warning('Warning', 'Only cancelled tests can be permanently removed. Please cancel the test first.', {
        nzDuration: 5000
      });
      return;
    }

    console.log('Attempting to permanently remove test:', testId, 'with status:', test.status);
    console.log('Current user:', UserStorage.getUser());
    console.log('Current token:', UserStorage.getToken());
    console.log('User role:', UserStorage.getUser()?.role);
    
    // First check authentication
    this.testService.checkAuthentication().subscribe({
      next: (authInfo) => {
        console.log('Authentication check successful:', authInfo);
        // Proceed with permanent removal
        this.performPermanentRemoval(testId);
      },
      error: (authError) => {
        console.error('Authentication check failed:', authError);
        this.notification.error('Authentication Error', 'Please log in again as an administrator', {
          nzDuration: 5000
        });
      }
    });
  }

  private performPermanentRemoval(testId: number) {
    console.log('Starting permanent removal for test ID:', testId);
    
    this.testService.permanentlyRemoveTest(testId).subscribe({
      next: (res) => {
        console.log('✅ Permanent removal SUCCESS - Response:', res);
        console.log('✅ Response type:', typeof res);
        console.log('✅ Response status: SUCCESS');
        
        this.soundService.playCorrect();
        this.notification.success('Success', 'Test permanently removed from the system', {
          nzDuration: 4000
        });
        this.getAllTests(); // Refresh the list
      },
      error: (error) => {
        console.error('❌ Permanent removal ERROR:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error body:', error.error);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        
        this.soundService.playIncorrect();
        
        // Check if this is actually a successful deletion that's being treated as an error
        if (error.status === 200 || error.status === 0) {
          console.log('🔄 Treating as success despite error status');
          this.notification.success('Success', 'Test permanently removed from the system', {
            nzDuration: 4000
          });
        } else {
          let errorMessage = 'Failed to permanently remove test';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 403) {
            errorMessage = 'Access denied. Please check your permissions.';
          } else if (error.status === 404) {
            errorMessage = 'Test not found or already removed.';
          } else if (error.status === 500) {
            errorMessage = 'Server error occurred while removing test.';
          }
          
          this.notification.error('Error', errorMessage, {
            nzDuration: 6000
          });
        }
        
        // Always refresh the list to see current state
        this.getAllTests();
      }
    });
  }

  getStatusColor(status: string): string {
    return status === 'CANCELLED' ? '#ff4d4f' : '#52c41a';
  }

  getStatusText(status: string): string {
    return status === 'CANCELLED' ? 'Cancelled' : 'Active';
  }

  trackByTestId(index: number, test: any): number {
    return test.id;
  }

  copyTestCode(testCode: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(testCode).then(() => {
        this.soundService.playTick();
        this.message.success(`Test code "${testCode}" copied to clipboard!`, { nzDuration: 3000 });
      }).catch(() => {
        this.fallbackCopyTextToClipboard(testCode);
      });
    } else {
      this.fallbackCopyTextToClipboard(testCode);
    }
  }

  private fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      this.soundService.playTick();
      this.message.success(`Test code "${text}" copied to clipboard!`, { nzDuration: 3000 });
    } catch (err) {
      this.soundService.playIncorrect();
      this.message.error('Failed to copy test code', { nzDuration: 3000 });
    }
    document.body.removeChild(textArea);
  }

  getFormattedTime(time): string{
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} min ${seconds} sec`;
  }
}
import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { Admin } from '../../services/admin';

@Component({
  selector: 'app-create-test',
  imports: [SharedModule],
  templateUrl: './create-test.html',
  styleUrls: ['./create-test.css'],
})
export class CreateTest {

  constructor(private fb: FormBuilder,
    private devicesService: Admin,
    private notification: NzNotificationService,
    private router: Router,
  ){}

  testForm!: FormGroup;

  generateTestCode() {
    // Generate a shorter, more user-friendly test code
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits
    const testCode = `${randomStr}${timestamp}`;
    this.testForm.patchValue({ testCode });
  }

  ngOnInit(){
    this.testForm = this.fb.group({
      title: [null, Validators.required],
      description: [null, [Validators.required]],
      time: [null,[Validators.required]],
      testCode: [null, [Validators.required]],
    });
    
    // Auto-generate a test code when the form loads
    this.generateTestCode();
  }

  submitForm() {
  if (this.testForm.valid) {
    const formData = this.testForm.value;
    // Ensure test code is uppercase
    formData.testCode = formData.testCode.toUpperCase();
    
    this.devicesService.createTest(formData).subscribe({
      next: (res) => {
        const testCode = formData.testCode;
        this.notification.success(
          'Success', 
          `Test Created Successfully! Test Code: ${testCode}`, 
          { nzDuration: 8000 }
        );
        this.router.navigateByUrl('admin/dashboard');
      },
      error: (error) => {
        console.error('Error creating test:', error);
        let message = 'Server not reachable. Please check backend connection.';
        
        if (error?.error?.message) {
          message = error.error.message;
        } else if (error?.message) {
          message = error.message;
        }
        
        this.notification.error('Error', message, { nzDuration: 5000 });
      }
    });
  } else {
    this.notification.warning('Warning', 'Please fill all fields', { nzDuration: 4000 });
  }
}
}

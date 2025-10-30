import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


const BASIC_URL = 'http://16.16.90.232:9090/';
@Injectable({
  providedIn: 'root'
})
export class Admin {
  constructor(private http: HttpClient) { }

  private getCurrentAdminId(): string {
    try {
      const currentUser = JSON.parse(localStorage.getItem('q_user') || '{}');
      const adminId = currentUser.id;
      
      if (!adminId || typeof adminId !== 'string') {
        throw new Error('Admin user ID not found. Please log in again.');
      }
      
      return adminId;
    } catch (error) {
      console.error('Error getting current admin ID:', error);
      throw new Error('Admin user ID not found. Please log in again.');
    }
  }

  private getCurrentAdminInfo(): any {
    try {
      const currentUser = JSON.parse(localStorage.getItem('q_user') || '{}');
      
      if (!currentUser.id || !currentUser.role || currentUser.role !== 'ADMIN') {
        throw new Error('Admin authentication required. Please log in as an administrator.');
      }
      
      return currentUser;
    } catch (error) {
      console.error('Error getting current admin info:', error);
      throw new Error('Admin authentication required. Please log in as an administrator.');
    }
  }

  createTest(testDto): Observable<any>{
    const adminInfo = this.getCurrentAdminInfo();
    
    // Add creator ID to the test data
    const testWithCreator = {
      ...testDto,
      createdBy: adminInfo.id
    };
    
    console.log(`Admin ${adminInfo.name} (${adminInfo.id}) creating test:`, testDto.title);
    
    return this.http.post(BASIC_URL + `api/test`, testWithCreator);
  }

  getAllTest(): Observable<any>{
    return this.http.get(BASIC_URL + `api/test`);
  
  }

  addQuestionInTest(questionDto): Observable<any>{
    return this.http.post(BASIC_URL + `api/test/question`, questionDto);
  
  }

  getTestQuestions(id:number): Observable<any>{
    return this.http.get(BASIC_URL + `api/test/${id}`);
  
  }

  getTestResults(): Observable<any>{
    const adminInfo = this.getCurrentAdminInfo();
    
    console.log(`Loading test results for admin: ${adminInfo.name} (${adminInfo.id})`);
    
    // Include admin ID to get only results from their tests
    return this.http.get(BASIC_URL + `api/test/test-result/admin/${adminInfo.id}`);
  }

  getAllTestsForAdmin(): Observable<any>{
    const adminInfo = this.getCurrentAdminInfo();
    
    console.log(`Loading tests for admin: ${adminInfo.name} (${adminInfo.id})`);
    
    // Include admin ID in the request to get only their tests
    return this.http.get(BASIC_URL + `api/test/admin/${adminInfo.id}`);
  }

  cancelTest(testId: number): Observable<any>{
    const adminInfo = this.getCurrentAdminInfo();
    
    console.log(`Admin ${adminInfo.name} (${adminInfo.id}) attempting to cancel test ${testId}`);
    
    // Include admin ID in request for backend validation
    return this.http.post(BASIC_URL + `api/test/cancel/${testId}`, { adminId: adminInfo.id });
  }

  activateTest(testId: number): Observable<any>{
    const adminInfo = this.getCurrentAdminInfo();
    
    console.log(`Admin ${adminInfo.name} (${adminInfo.id}) attempting to activate test ${testId}`);
    
    // Include admin ID in request for backend validation
    return this.http.post(BASIC_URL + `api/test/activate/${testId}`, { adminId: adminInfo.id });
  }

  permanentlyRemoveTest(testId: number): Observable<any>{
    const adminInfo = this.getCurrentAdminInfo();
    
    console.log(`Admin ${adminInfo.name} (${adminInfo.id}) attempting to permanently remove test ${testId}`);
    console.log('🔄 Making DELETE request to:', BASIC_URL + `api/test/remove/${testId}`);
    
    return this.http.delete(BASIC_URL + `api/test/remove/${testId}`, { 
      responseType: 'text' as 'json', // Handle text response from backend
      body: { adminId: adminInfo.id } // Include admin ID for backend validation
    });
  }

  checkAuthentication(): Observable<any>{
    return this.http.get(BASIC_URL + `api/test/auth-check`);
  }

  validateTestOwnership(testId: number): Observable<any> {
    const adminId = this.getCurrentAdminId();
    
    // Check if the current admin owns this test
    return this.http.get(BASIC_URL + `api/test/validate-ownership/${testId}/${adminId}`);
  }

}
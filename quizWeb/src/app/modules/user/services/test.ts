import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserStorage } from '../../auth/services/user-storage';

const BASIC_URL = 'http://16.16.90.232:9090/';

@Injectable({
  providedIn: 'root'
})
export class Test {
  
  constructor(private http: HttpClient) { }

    getAllTest(): Observable<any>{
      return this.http.get(BASIC_URL + `api/test`);
      
      }

    getTestQuestions(id:number): Observable<any>{
        return this.http.get(BASIC_URL + `api/test/${id}`);
      
      }

    submitTest(data:any): Observable<any>{
        return this.http.post(BASIC_URL + `api/test/submit-test`, data);
      
      }

      getMyTestResults(): Observable<any>{
      return this.http.get(BASIC_URL + `api/test/test-result/${UserStorage.getUserId()}`);
      }

      getTestByCode(testCode: string): Observable<any>{
        return this.http.get(BASIC_URL + `api/test/code/${testCode}`);
      }

      getLeaderboardByTestId(testId: number): Observable<any>{
        return this.http.get(BASIC_URL + `api/test/leaderboard/${testId}`);
      }

      // Health check to test server connectivity
      checkHealth(): Observable<any>{
        return this.http.get(BASIC_URL + `api/health`);
      }
}
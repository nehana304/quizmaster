import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { TakeTest } from './components/take-test/take-test';
import { ViewMyTestResults } from './components/view-my-test-results/view-my-test-results';
import { TestResults } from './components/test-results/test-results';
import { UserLeaderboard } from './components/leaderboard/leaderboard';

const routes: Routes = [
  {path:'dashboard', component:Dashboard},
  {path:'view-test-results', component:ViewMyTestResults},
  {path:'view-test-result', redirectTo:'view-test-results', pathMatch:'full'}, // Handle old singular route
  {path:'test-results/:id', component:TestResults}, // New route for test results with leaderboard
  {path:'leaderboard/:id', component:UserLeaderboard}, // User leaderboard route
  {path:'take-test/:id', component:TakeTest},
  {path:'', redirectTo:'dashboard', pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }

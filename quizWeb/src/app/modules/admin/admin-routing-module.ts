import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CreateTest } from './components/create-test/create-test';
import { AddQuestionInTest } from './components/add-question-in-test/add-question-in-test';
import { ViewTest } from './components/view-test/view-test';
import { ViewTestResults } from './components/view-test-results/view-test-results';
import { Leaderboard } from './components/leaderboard/leaderboard';

const routes: Routes = [
  {path:'dashboard', component:Dashboard},
  {path:'create-test', component:CreateTest},
  {path:'add-question/:id', component: AddQuestionInTest},
  {path:'view-test/:id', component: ViewTest},
  {path:'view-test-results', component: ViewTestResults},
  {path:'leaderboard/:id', component: Leaderboard}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

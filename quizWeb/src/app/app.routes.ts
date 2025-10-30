import { Routes } from '@angular/router';
import { Signup } from './modules/auth/signup/signup';
import { Login } from './modules/auth/login/login';
import { Home } from './modules/home/home';
import { authGuard, adminGuard, userGuard } from './modules/auth/guards/auth.guard';

export const routes: Routes = [
    {path: 'home', component: Home},
    {path: 'register', component: Signup},
    {path:'login', component: Login},
    {path:'user', loadChildren: ()=> import('./modules/user/user-module').then(m=> m.UserModule), canActivate: [userGuard]},
    {path: 'admin', loadChildren: ()=> import('./modules/admin/admin-module').then(m=> m.AdminModule), canActivate: [adminGuard]},
    // Handle the specific problematic route
    {path: 'user/view-test-result', redirectTo: 'user/view-test-results', pathMatch: 'full'},
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: '**', redirectTo: 'home'}
];

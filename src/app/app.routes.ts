import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { PostDetail } from './features/post-detail/post-detail';

export const routes: Routes = [
    {path: '', component: Home},
    {path: ':id', component: PostDetail},
    { path: '**', redirectTo: '' }
];

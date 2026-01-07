import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

const LOGIN = gql`
  mutation ($username: String!) {
    login(username: $username) {
      id
      username
      role
    }
  }
`;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  error = '';

  constructor(private apollo: Apollo, private router: Router) {}

 login() {
  if (!this.username.trim()) {
    this.error = 'Username required';
    return;
  }

  this.apollo.mutate<{ login: any }>({
    mutation: LOGIN,
    variables: { username: this.username }
  }).subscribe({
    next: res => {
      localStorage.setItem('user', JSON.stringify(res.data?.login));

      this.apollo.client.resetStore().then(() => {
        this.router.navigate(['/tasks']); 
      });
    }
  });
}


}


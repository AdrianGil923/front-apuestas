import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Credentials } from '../models/user/Credentials';
import { Router } from '@angular/router';
import { Token } from '../models/user/Token';
import { StorageService } from "../services/storage.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
      private userService: UserService,
      private storageService: StorageService,
      private router: Router
   ) { }

   username: String = "";
   password: String = "";
   myLogin = new Token();

callLogin() {
  const myCredential = new Credentials();
  myCredential.username = this.username.toString(); // <- cambio aquí
  myCredential.password = this.password.toString(); // <- cambio aquí

  this.userService.postLogin(myCredential).subscribe({
    next: (data: any) => {
      console.log('user logged: ', data);
      this.storageService.setSession("user", myCredential.username.toString());
      this.storageService.setSession("token", data.accessToken.toString());
      this.router.navigate(['/home']);
    },
    error: (errMsg) => {
      this.username = "";
      this.password = "";
    }
  });
}
}
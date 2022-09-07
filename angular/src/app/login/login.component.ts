import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from "../authentication.service";
import {User} from "../user";
import {CordovaService} from "../cordova.service";


@Component({
  selector: 'nag-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  viewstate = {
    loading: false,
  };

  /**
   * model for form-content
   */
  public readonly credentials: { username: string, password: string } = {
    username: '',
    password: ''
  };

  constructor(private router: Router, private auth: AuthenticationService, private cordova: CordovaService) {
  }

  // return user of current session or null
  get currentUser() {
    if (this.auth.currentLogin) {
      return this.auth.currentLogin.user;
    }
    return null;
  }

  goToLink(url: string) {
    window.open(url, "_blank");
  }

  /**
   * perform login with typed in credentials
   */
  login() {
    this.viewstate.loading = true;

    this.auth.login(this.credentials).subscribe(
      // navigate to activities after success
      (user: User) => {
        this.cordova.toast('Login success');
        this.viewstate.loading = false;
        this.router.navigate(['/']);
      },
      // show notification on error
      err => {
        /* error message*/
        this.cordova.toast(`Login failed: ${err}`);
        this.viewstate.loading = false;
      });
  }

  /**
   * log out and show confirmation
   */
  logout() {
    this.auth.logout();
    this.cordova.toast('Logout success');
  }
}

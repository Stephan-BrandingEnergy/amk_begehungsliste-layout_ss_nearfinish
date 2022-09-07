import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {noop, Observable, of} from 'rxjs';
import {map, share, tap} from 'rxjs/operators';
import {LocalStorage} from 'ngx-store';

import {ApiService} from './api.service';
import {User} from "./user";
import {Login} from "./login";

interface LoginError {
  code: string;
  msg: string;
}

/**
 * The AuthenticationService service requests and destroys auth-tokens and provides user-details
 */
@Injectable()
export class AuthenticationService implements OnInit, OnDestroy {

  /** API endpoint */
  private _authEndpoint = '/feuser-login/';

  get currentLogin(): Login {
    return this._currentLogin;
  }

  set currentLogin(value: Login) {
    this._currentLogin = value;
  }

  /**
   * holds the current session-information (token and user-details)
   * this is persisted,
   */
  @LocalStorage('currentLogin')
  private _currentLogin: Login | null;

  constructor(private api: ApiService, private router: Router) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  } // event empty method is needed to allow ngx-store handle class destruction

  // Methode für AuthGuard
  handleAuthentication(): boolean {
    if (this.currentLogin) {
      return true;
    }

    this.router.navigate(['/']);

    return false;
  }

  /**
   * Creates Session with given user-credentials and returns the user-details
   */
  login(credentials: { username: string, password: string }): Observable<User> {

    // clear amkbegehungsliste cache
    this.api.rundgangCache.next(null);

    const observable =
      this.api.get<User | LoginError>(`${this._authEndpoint}`, {
        "no_cache": "1",
        "user": credentials.username,
        "pass": credentials.password
      })
        .pipe(
          tap((login: User) => this.log(JSON.stringify(login))),

          // map empty response to error
          map((login: User | LoginError): User => {

            // empty response
            if (!login) {
              throw 'Nutzername oder Passwort ist falsch.';
            }
            // respnse with error message
            if ((<LoginError>login).code) {
              if ((<LoginError>login).code == 'error')
                throw (<LoginError>login).msg;
            }
            if ((<User>login).uid)
              return <User>login;
          }),

          // Log success and errors
          tap(
            (login: User) => this.log(`login success (${login.username})`),
            (err: any) => {
              this.log(`login error: ${err}`);
            }),
          share()
        );

    // perform login and store result
    observable.subscribe((user: User) => {
      this._currentLogin = {user: user, token: `${user.uid}`};
    });

    // return Observable with user-details
    return observable;
  }

  /**
   * Clears the current session-token and notifies the backend
   */
  logout(): Observable<any> {

    // immediatly clear stored token and user-details
    this._currentLogin = null;

    // clear amkbegehungsliste cache
    this.api.rundgangCache.next(null);

    /**const observable = this.api.post(`${this._authEndpoint}/logout`).pipe(
     // Log success and errors
     tap(
     () => this.log('logout success'),
     (err: any) => {
          this.log(`logout error`);
          this.logger.error(err);
        }),
     share()
     );*/

    const observable = of().pipe(
      tap(() => this.log('logout success')),
      share()
    );

    // perform logout
    observable.subscribe(noop);

    return observable;
  }

  /**
   * returns the current session-token or nothing
   */
  getSessionToken(): string | null {
    return this._currentLogin && this._currentLogin.token;
  }

  /**
   * @param {string} message Informative Message
   */
  private log(message: string) {
    console.info(`AuthService: ${message}`);
  }

  /**
   * check of the browser has credentials (csession cookie), and populate user-details
   * if possible
   */
  initSession(): Observable<Login> {
    const obs = this.api.get<User>(`/users/current`)
      .pipe(map((user: User) => ({token: 'bla', user: user} as Login)))
      .pipe(share());

    obs.subscribe((login: Login) => {
      this._currentLogin = login;
      this.log(`login success (${login.user.username})`);
    });

    return obs;
  }
}

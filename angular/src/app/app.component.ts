import {Component, OnDestroy, OnInit, NgZone} from '@angular/core';
import {ApiService} from './api.service';
import {LocalStorageService} from 'ngx-store';
import {AuthenticationService} from './authentication.service';
import {CordovaService} from './cordova.service';
import {Location} from '@angular/common';


// set locale to DE
import {registerLocaleData} from '@angular/common';
import {Router} from '@angular/router';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit, OnDestroy {
  public isCollapsed = false;

  viewstate = {
    loading: false,
    nfcWait: false,
    navVisible: false
  };

  constructor(
    public router: Router,
    private apiService: ApiService,
    private localStorageService: LocalStorageService,
    private auth: AuthenticationService,
    private ngZone: NgZone,
    private cordova: CordovaService,
    private _location: Location
  ) {
  }

  DateNow = Date();
  versionsnummer = '0.903';

  // return user of current session or null
  get currentUser() {
    if (this.auth.currentLogin) {
      return this.auth.currentLogin.user;
    }
    return null;
  }

  /**
   * log out and show confirmation
   */
  logout() {
    this.auth.logout();
    window.setTimeout(_ => this.auth.logout(), 100); // nochmal ausloggen , wegen bug in ngx-store
    this.cordova.toast('Erfolgreich abgemeldet');
    if (this.router.url !== '/') {
      // noinspection JSIgnoredPromiseFromCall
      this.router.navigate(['/']);
    }
  }

  backClicked() {
    this.viewstate.loading = true;
    if (this.router.url !== '/') {
      this._location.back();
    }
  }

  /**
   * methods for API request queue
   */
  sendQueuedRequests() {
    // noinspection JSIgnoredPromiseFromCall
    this.apiService.trySendQueuedRequests();
  }

  get isSendingQueueInProgress() {
    return this.apiService.sendingQueueInProgress;
  }

  get numQueuedRequestParams() {
    return this.apiService.getQueuedRequestParams().length;
  }


  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    /* const v: ModulsVisit = this.localStorageService.get('currentVisit');
     if (v && v.modul) {
       console.log(`restore visit: ${v.modul.name}`);
       this.apiService.currentVisit = v;
     }*/
  }
}

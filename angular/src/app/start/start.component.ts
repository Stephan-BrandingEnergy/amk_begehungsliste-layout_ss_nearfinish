import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthenticationService} from "../authentication.service";
import {CordovaService} from "../cordova.service";

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  constructor(
    private router: Router,
    private auth: AuthenticationService,
    private cordova: CordovaService) {
  }

  ngOnInit(): void {

  }

  // return user of current session or null
  get currentUser() {
    if (this.auth.currentLogin) {
      return this.auth.currentLogin.user;
    }
    return null;
  }
}

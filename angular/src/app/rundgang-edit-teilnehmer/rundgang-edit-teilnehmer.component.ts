import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ApiResponseModul} from "../api-interfaces";
import {ApiService} from "../api.service";
import {of, Subscription} from "rxjs";
import {CordovaService} from "../cordova.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../authentication.service";
import {concatMap, map, tap} from "rxjs/operators";
import Rundgang = ApiResponseModul.Rundgang;
import User = ApiResponseModul.User;
import Schwerpunkt = ApiResponseModul.Schwerpunkt;

@Component({
  selector: 'app-rundgang-edit-teilnehmer',
  templateUrl: './rundgang-edit-teilnehmer.component.html',
  styleUrls: ['./rundgang-edit-teilnehmer.component.scss']
})
export class RundgangEditTeilnehmerComponent implements OnInit, OnDestroy {

  rundgang: Rundgang;
  user: User[] = [];

  viewstate = {
    loading: false,
  };


  private _subscription = new Subscription();


  constructor(private apiService: ApiService,
              private cordova: CordovaService,
              private router: Router,
              private route: ActivatedRoute,
              private ngZone: NgZone,
              private auth: AuthenticationService) {
  }


  ngOnInit() {
    this.viewstate.loading = true;

    // lade rundgang from state

    if (history.state['rundgang']) {
      this.rundgang = history.state['rundgang'];
      console.log("Rundgang restored from state");
    } else
      // lade rundgang from uid
      this._subscription.add(
        this.route.queryParamMap.pipe(
          map(m => m.get('uid')),
          concatMap(uid => {

            // if uid is given get Rundgang from apiService
            if (uid) {
              return this.apiService.getRundgang(uid).pipe(tap(() => console.log("Rundgang loaded with uid", uid)));
            }
            // else create empty Rundgang
            else {
              return of(this.getNewRundgang()).pipe(tap(() => console.log("New Rundgang created")));
            }
          })
        ).subscribe(
          response => {
            if (response) {
              this.rundgang = response
            }
            this.viewstate.loading = false;
          }));


    // lade user liste
    this._subscription.add(this.apiService.getUserList(this.auth.currentLogin?.user.uid)
      .subscribe(
        response => this.user = response
      ));
  }


  /** To prevent memory leaks, unsubscribe from all subscriptions made while the activity is alive. */
  ngOnDestroy(): void {
    console.log("ngOnDestroy")
    this._subscription.unsubscribe();
  }

  public getNewSchwerpunkt(): Schwerpunkt {
    return {
      name: "",
    }
  }

  public getNewRundgang(): Rundgang {
    return {
      data: {
        kurztext: "",
        ort: ""
      },
      maengel: [],
      teilnehmer: [],
      verantwortlicher: {firstName: "", lastName: ""},
      schwerpunkt: this.getNewSchwerpunkt(),
      kurztext: "",
      ort: ""
    };
  }

  /**
   * Chek if a user with the same uid is in the teilnehmer array
   * @param u
   * @param rundgang
   */
  isTnInList(u: User, rundgang: Rundgang) {
    return rundgang.teilnehmer.find(tn => tn.uid == u.uid) !== undefined;
  }

  toggleTnInList(u: User, rundgang: Rundgang, $event: Event) {
    if (($event.currentTarget as HTMLInputElement).checked) {
      // ad TN to list if not already in it
      if (!rundgang.teilnehmer.find(tn => tn.uid == u.uid))
        rundgang.teilnehmer.push(u);
    } else {
      // remove TN with uid
      rundgang.teilnehmer = rundgang.teilnehmer.filter(tn => tn.uid != u.uid);
    }
  }
}

import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {ApiResponseModul} from '../api-interfaces';
import Mangel = ApiResponseModul.Mangel;
import {ApiService} from '../api.service';
import {AuthenticationService} from '../authentication.service';
import {CordovaService} from '../cordova.service';

import {NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import Rundgang = ApiResponseModul.Rundgang;

@Component({
  selector: 'app-stoerung',
  templateUrl: './stoerung.component.html',
  styleUrls: ['./stoerung.component.scss']
})
export class StoerungComponent implements OnInit {

  constructor(
    private auth: AuthenticationService,
    private apiService: ApiService,
    private cordova: CordovaService,
    private ngZone: NgZone,
    private modalService: BsModalService,
    private router: Router,
  ) {
  }

  viewstate = {
    loading: false,
  };

  /**
   * die angezeigte Störung
   */
  @Input()
  stoerung: Mangel = {text: '', status: 0};

  /**
   * Kamerabild
   */
  foto: string;

  /**
   * der aktuelle Rundgang (um neue Mängel zu erzeugen)
   */
  @Input()
  modul: Rundgang;

  @Output()
  logUpdated = new EventEmitter<ApiResponseModul.LogEintrag>();

  @Output()
  stoerungUpdated = new EventEmitter<ApiResponseModul.Mangel>();

  /**
   * der neue Logeintrag
   */
  neuerLogeintrag: ApiResponseModul.LogEintrag = {
    text: '',
    type: '',
  };

  /**
   * Modal für neue Logs
   */
  logsModalRef: BsModalRef;


  openLogsModal(template: TemplateRef<any>) {
    this.logsModalRef = this.modalService.show(template, {
      keyboard: false
    });
  }

  ngOnInit() {
  }

  speichereLogEintrag(neuerLogeintrag: ApiResponseModul.LogEintrag) {
    if (!this.auth.currentLogin) {
      this.cordova.toast(`Login benötigt`);
      return;
    }

    const user_id = this.auth.currentLogin.user.uid;

    this.viewstate.loading = true;
    this.apiService.sendMangelLog(this.stoerung, neuerLogeintrag, user_id).subscribe(_ => {
      // Speichern erfolgreich
      this.cordova.toast('Logeintrag gespeichert');
      this.viewstate.loading = false;

      // neuen logeintrag als Event senden
      this.logUpdated.emit(neuerLogeintrag);

      // Form leeren
      this.neuerLogeintrag = {text: '', type: ''};

      // Logeintrag sofort an aktuelles Störungsmodell anängen
      this.stoerung.logs.push({...neuerLogeintrag, crdate: moment().toISOString()});

    }, err => {
      // Fehler beim Speichern
      this.cordova.toast(`Fehler beim Speichern des Logeintrags: ${err}`);
      this.viewstate.loading = false;
    });
  }

  speichereNeueStoerung(stoerung: ApiResponseModul.Mangel) {
    if (!this.auth.currentLogin) {
      this.cordova.toast(`Login benötigt`);
      return;
    }

    const user_id = this.auth.currentLogin.user.uid;

    this.viewstate.loading = true;
    this.apiService.sendMangel(this.modul, this.stoerung, this.foto, user_id).subscribe(_ => {
        // Speichern erfolgreich
        this.ngZone.run(() => {
          // noinspection JSIgnoredPromiseFromCall
          this.router.navigate([`/amkbegehungsliste`]);
        });
        this.cordova.toast('Störung gespeichert');
        this.viewstate.loading = false;

        // neue Störung als Event senden
        this.stoerungUpdated.emit(stoerung);
      },
      err => {
        // Fehler beim Speichern
        this.cordova.toast(`Fehler beim Speichern der Störung: ${err}`);
        this.viewstate.loading = false;
      });
  }

  takePicture() {
    this.cordova.camera().subscribe(imageData => {
      this.ngZone.run(() => {
        this.foto = 'data:image/jpeg;base64,' + imageData;
      });
    }, (err) => {
      this.cordova.toast(`Fehler beim Öffnen der Kamera ${err}`);
    });
  }

  getLogsSorted() {
    const logs = this.stoerung.logs;
    logs.sort((a, b) => moment(b.crdate).unix() - moment(a.crdate).unix());
    return logs;
  }
}

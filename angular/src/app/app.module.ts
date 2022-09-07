import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {AmkBegehungslisteComponent} from './amkbegehungsliste/amk-begehungsliste.component';
import {ModulComponent} from './modul/modul.component';
import {FormsModule} from '@angular/forms';
import {AuthenticationService} from './authentication.service';
import {CordovaService} from './cordova.service';
import {HttpClientModule} from '@angular/common/http';
import {StartComponent} from './start/start.component';
import {WebStorageModule} from 'ngx-store';
import {SignaturePadModule} from 'angular2-signaturepad';
import {StoerungComponent} from './stoerung/stoerung.component';
import {ModalModule} from 'ngx-bootstrap/modal';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCardModule} from '@angular/material/card';
import {RundgangFilterPipe} from './rundgang-filter.pipe';
import {FailuresFilterPipe} from './failures-filter.pipe';
import {ContentComponent} from './content/content.component';
import {RundgangListComponent} from "./rundgang-list/rundgang-list.component";
import {RundgangEditVerantwortlicherComponent} from './rundgang-edit-verantwortlicher/rundgang-edit-verantwortlicher.component';
import {RundgangEditSchwerpunktComponent} from './rundgang-edit-schwerpunkt/rundgang-edit-schwerpunkt.component';
import {RundgangEditTeilnehmerComponent} from './rundgang-edit-teilnehmer/rundgang-edit-teilnehmer.component';
import {MangelEditTextAndPhotoComponent} from './mangel-edit-text-and-photo/mangel-edit-text-and-photo.component';
import {MangelEditMassnahmeComponent} from './mangel-edit-massnahme/mangel-edit-massnahme.component';
import {MangelEditBereichComponent} from './mangel-edit-bereich/mangel-edit-bereich.component';
import {MangelEditErledigungsdatumComponent} from './mangel-edit-erledigungsdatum/mangel-edit-erledigungsdatum.component';
import {MangelEditVerantwortlichePersonComponent} from './mangel-edit-verantwortliche-person/mangel-edit-verantwortliche-person.component';
import {RundgangOverviewComponent} from './rundgang-overview/rundgang-overview.component';
import {MangelOverviewComponent} from './mangel-overview/mangel-overview.component';
import {RundgangSignAndSaveComponent} from './rundgang-sign-and-save/rundgang-sign-and-save.component';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatIconModule} from "@angular/material/icon";
import {MatSortModule} from "@angular/material/sort";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AmkBegehungslisteComponent,
    ModulComponent,
    StartComponent,
    StoerungComponent,
    ContentComponent,
    RundgangFilterPipe,
    FailuresFilterPipe,
    RundgangListComponent,
    RundgangEditVerantwortlicherComponent,
    RundgangEditSchwerpunktComponent,
    RundgangEditTeilnehmerComponent,
    MangelEditTextAndPhotoComponent,
    MangelEditMassnahmeComponent,
    MangelEditBereichComponent,
    MangelEditErledigungsdatumComponent,
    MangelEditVerantwortlichePersonComponent,
    RundgangOverviewComponent,
    MangelOverviewComponent,
    RundgangSignAndSaveComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    WebStorageModule,
    HttpClientModule,
    FormsModule,
    SignaturePadModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatCardModule,
    ModalModule.forRoot(),
    MatButtonToggleModule,
    MatIconModule,
    MatSortModule,
    MatButtonModule,
    MatSelectModule,
    BsDatepickerModule.forRoot()
  ],
  providers: [
    AuthenticationService,
    CordovaService
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    StoerungComponent
  ]
})
export class AppModule {
}

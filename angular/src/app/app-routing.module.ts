import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AmkBegehungslisteComponent} from './amkbegehungsliste/amk-begehungsliste.component';
import {ModulComponent} from './modul/modul.component';
import {StartComponent} from './start/start.component';
import {ContentComponent} from './content/content.component';
import {RundgangOverviewComponent} from "./rundgang-overview/rundgang-overview.component";
import {RundgangListComponent} from "./rundgang-list/rundgang-list.component";
import {RundgangEditSchwerpunktComponent} from "./rundgang-edit-schwerpunkt/rundgang-edit-schwerpunkt.component";
import {RundgangEditTeilnehmerComponent} from "./rundgang-edit-teilnehmer/rundgang-edit-teilnehmer.component";
import {RundgangEditVerantwortlicherComponent} from "./rundgang-edit-verantwortlicher/rundgang-edit-verantwortlicher.component";
import {MangelOverviewComponent} from "./mangel-overview/mangel-overview.component";
import {RundgangSignAndSaveComponent} from "./rundgang-sign-and-save/rundgang-sign-and-save.component";
import {MangelEditTextAndPhotoComponent} from "./mangel-edit-text-and-photo/mangel-edit-text-and-photo.component";
import {MangelEditBereichComponent} from "./mangel-edit-bereich/mangel-edit-bereich.component";
import {MangelEditMassnahmeComponent} from "./mangel-edit-massnahme/mangel-edit-massnahme.component";
import {MangelEditVerantwortlichePersonComponent} from "./mangel-edit-verantwortliche-person/mangel-edit-verantwortliche-person.component";
import {MangelEditErledigungsdatumComponent} from "./mangel-edit-erledigungsdatum/mangel-edit-erledigungsdatum.component";

const routes: Routes = [
  {path: '', component: StartComponent, pathMatch: 'full'},

  {path: 'rundgang/list', component: RundgangListComponent},

  {path: 'rundgang/detail', component: RundgangOverviewComponent},
  {path: 'rundgang/schwerpunkt', component: RundgangEditSchwerpunktComponent},
  {path: 'rundgang/teilnehmer', component: RundgangEditTeilnehmerComponent},
  {path: 'rundgang/verantwortlicher', component: RundgangEditVerantwortlicherComponent},
  {path: 'rundgang/save', component: RundgangSignAndSaveComponent},

  {path: 'mangel', component: MangelOverviewComponent},
  {path: 'mangel/bereich', component: MangelEditBereichComponent},
  {path: 'mangel/text', component: MangelEditTextAndPhotoComponent},
  {path: 'mangel/massnahme', component: MangelEditMassnahmeComponent},
  {path: 'mangel/verantwortlicher', component: MangelEditVerantwortlichePersonComponent},
  {path: 'mangel/erledigungsdatum', component: MangelEditErledigungsdatumComponent},
  {path: 'mangel/overview', component: MangelOverviewComponent},

  {path: 'content/:name', component: ContentComponent},
  {path: '**', redirectTo: ''}];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, fromEvent, Observable, of, Subject} from 'rxjs';
import {delay, tap, timeoutWith} from 'rxjs/operators';

function _window(): any {
  // return the global native browser window object
  return window;
}


@Injectable()
export class CordovaService {

  private resume: BehaviorSubject<boolean>;

  constructor(private zone: NgZone) {
    this.resume = new BehaviorSubject<boolean>(null);
    fromEvent(document, 'resume').subscribe(event => {
      this.zone.run(() => {
        this.onResume();
      });
    });
  }

  get cordova(): any {
    return _window().cordova;
  }

  get onCordova(): boolean {
    return !!_window().cordova;
  }

  public onResume(): void {
    this.resume.next(true);
  }


  public toast(message: string): void {

    console.log(`Infomeldung: ${message}`);

    // @ts-ignore
    if (window.plugins && window.plugins.toast) {
      // @ts-ignore
      window.plugins.toast.showWithOptions(
        {
          message,
          duration: 'short', // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
          position: 'bottom',
        }
      );
    }
  }

  public nfcListener(): Observable<any> {
    // @ts-ignore
    const nfc: PhoneGapNfc.Nfc = window.nfc;

    if (!nfc) {
      console.log(`no NFC API present`);
      return of(null).pipe(delay(500));
    } // fake delay, damit man sieht das was passiert

    const timeout = 5000;

    const sub = new Subject<any>();

    const nfcCallback = (nfcEvent: any) => {
      console.log(`read nfc: ${JSON.stringify(nfcEvent.tag, null, 4)}`);

      sub.next(nfcEvent.tag);

      // end session after we received something
      // @ts-ignore
      nfc.invalidateSession();
    };

    // @ts-ignore

    nfc.beginSession(() => {
      nfc.addNdefListener(nfcCallback, () => {
          console.log('Listening for NDEF Tags.');
        },
        () => {
          console.error(`Error adding NFC Listener`);
        }
      );
      window.setTimeout(() => {
        // @ts-ignore
        nfc.removeNdefListener(nfcCallback);
      }, 5002);
    });


    // return nfc-result or nothing after timeout, also end nfc session after timeout
    return sub.pipe(
      timeoutWith(timeout, of(null).pipe(tap(_ => {
        // @ts-ignore
        return nfc.invalidateSession();
      })))
    );
  }

  public camera(): Observable<string> {
    // @ts-ignore
    const camera = navigator.camera;

    if (!camera) {
      console.log(`no Camera API present`);
      return of(null).pipe(delay(500));
    } // fake delay, damit man sieht das was passiert

    const sub = new Subject<string>();
    camera.getPicture((datauri: string) => {
        sub.next(datauri);
      },
      () => {
        console.error(`Error accessing Camera`);
      },
      {
        // @ts-ignore
        destinationType: Camera.DestinationType.DATA_URL,
        allowEdit: true,
        quality: 50,
        // @ts-ignore
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 720,
        // @ts-ignore
        sourceType: Camera.PictureSourceType.CAMERA,
        saveToPhotoAlbum: false,
        correctOrientation: true
      }
    );

    return sub;
  }

}
